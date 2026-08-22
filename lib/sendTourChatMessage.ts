import { Buffer } from "buffer";
import { fetch as expoFetch } from "expo/fetch";
import { TOUR_API_BASE_URL } from "./tourApiConfig";

// Un turno de la conversación (pregunta o respuesta) — lo que se manda
// como contexto de los mensajes anteriores, no el mensaje nuevo en sí.
export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type Params = {
  message: string;
  context?: string;
  summary?: string;
  highlights?: string[];
  tourTitle?: string;
  // Turnos previos de la conversación, más viejo primero. No incluye el
  // `message` de esta llamada — eso ya viaja aparte.
  history?: ConversationMessage[];
  // Se llama por cada oración lista mientras la respuesta todavía se está
  // generando (antes de que termine el streaming completo). audioBase64
  // viene en null si ese pedazo puntual falló al generar su audio.
  onChunk?: (text: string, audioBase64: string | null) => void | Promise<void>;
};

// Tipado como Uint8Array<ArrayBufferLike> (en vez del Uint8Array<ArrayBuffer>
// que infiere `new Uint8Array(0)`) porque .slice() en TS 5.7+ devuelve esa
// forma más amplia — si no, la reasignación de byteBuffer no tipa bien.
function concatBytes(
  a: Uint8Array<ArrayBufferLike>,
  b: Uint8Array<ArrayBufferLike>
): Uint8Array<ArrayBufferLike> {
  const merged = new Uint8Array(a.length + b.length);
  merged.set(a, 0);
  merged.set(b, a.length);
  return merged;
}

export async function sendTourChatMessage({
  message,
  context,
  summary,
  highlights,
  tourTitle,
  history,
  onChunk,
}: Params): Promise<string> {
  // fetch global de React Native no entrega response.body como stream real
  // (llega todo junto igual, aunque el servidor lo mande de a pedazos) —
  // expo/fetch sí, así que es el único cambiado acá.
  const res = await expoFetch(`${TOUR_API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      context,
      summary,
      highlights,
      tourTitle,
      history,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  if (!res.body) {
    throw new Error("Respuesta de chat sin cuerpo (streaming no soportado)");
  }

  // El backend manda NDJSON: un objeto JSON por línea, a medida que cada
  // oración queda lista — ya no un solo res.json() al final.
  const reader = res.body.getReader();

  // Se acumulan bytes crudos (no texto) y se corta por el byte de salto de
  // línea (0x0A) antes de decodificar — un "\n" nunca puede caer en medio
  // de un carácter UTF-8 multibyte (tildes, "ñ", "¿"...), así que cada
  // línea completa siempre se puede decodificar sola, sin riesgo de
  // partir un carácter entre dos pedazos de red.
  let byteBuffer: Uint8Array<ArrayBufferLike> = new Uint8Array(0);
  const fullTextParts: string[] = [];

  const handleLineBytes = async (lineBytes: Uint8Array<ArrayBufferLike>) => {
    const line = Buffer.from(lineBytes).toString("utf-8").trim();
    if (!line) return;

    const data = JSON.parse(line);

    if (data.type === "chunk") {
      fullTextParts.push(data.text);
      await onChunk?.(data.text, data.audioBase64 ?? null);
      return;
    }

    if (data.type === "error") {
      throw new Error(data.error || "Error en el chat");
    }

    // "done" no necesita hacer nada más acá — el while de abajo corta
    // solo cuando el stream se cierra del todo.
  };

  while (true) {
    const { done, value } = await reader.read();

    if (value) {
      byteBuffer = concatBytes(byteBuffer, value);

      let newlineIndex: number;
      while ((newlineIndex = byteBuffer.indexOf(10)) !== -1) {
        const lineBytes = byteBuffer.slice(0, newlineIndex);
        byteBuffer = byteBuffer.slice(newlineIndex + 1);
        await handleLineBytes(lineBytes);
      }
    }

    if (done) break;
  }

  // Por si el último pedazo no traía un salto de línea final.
  if (byteBuffer.length > 0) {
    await handleLineBytes(byteBuffer);
  }

  if (fullTextParts.length === 0) {
    throw new Error("Respuesta inválida del chat");
  }

  return fullTextParts.join(" ");
}
