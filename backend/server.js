import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import OpenAI, { toFile } from "openai";
import { fileURLToPath } from "url";

dotenv.config(); // 🔥 primero cargas variables

// Cacheo de audio del lado del servidor: el mismo texto nunca se le paga
// dos veces a ElevenLabs, sin importar cuántos usuarios distintos lo
// pidan (a diferencia del caché del celular, que es por-dispositivo).
const AUDIO_CACHE_DIR = "./audio-cache";
fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });

// Misma idea que AUDIO_VERSION del lado del cliente: si cambia la voz o
// el modelo de ElevenLabs, subir este número invalida todo el caché
// viejo de golpe, para no servir audio con la voz anterior por error.
const SERVER_CACHE_VERSION = "v2";

const app = express();
app.use(cors());
// Límite alto porque /transcribe recibe audio corto en base64 dentro del JSON
app.use(express.json({ limit: "25mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ElevenLabs: especialista en voz, mucho más natural que la TTS de OpenAI.
// El ID de voz lo eliges tú en https://elevenlabs.io/app/voice-library
// (filtra por español, escucha las muestras, y copia su Voice ID).
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
console.log("🔑 Llave de ElevenLabs detectada:", ELEVENLABS_API_KEY ? `sí, ${ELEVENLABS_API_KEY.length} caracteres` : "NO detectada (undefined)");
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const ELEVENLABS_MODEL = "eleven_multilingual_v2";

// Ajustes de expresividad por modo. "stability" más bajo = más variación en
// el tono (menos plano); "style" más alto = más carácter/emoción en la
// entonación. Son valores de partida razonables, no son mágicos — una vez
// que lo escuches, se pueden afinar.
const VOICE_SETTINGS = {
  narration: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.35,
    use_speaker_boost: true,
  },
  chat: {
    stability: 0.4,
    similarity_boost: 0.75,
    style: 0.5,
    use_speaker_boost: true,
  },
};

// "Fila" para ElevenLabs: tu plan permite máximo 3 peticiones a la vez.
// Esto asegura que tu backend nunca le mande más de 2 en paralelo, sin
// importar cuántas pida la app de golpe — las demás esperan su turno
// en vez de fallar con error 429.
let activeElevenLabsRequests = 0;
const MAX_CONCURRENT_ELEVENLABS = 2;
const elevenLabsQueue = [];

function runWithConcurrencyLimit(taskFn) {
  return new Promise((resolve, reject) => {
    const run = async () => {
      activeElevenLabsRequests++;
      try {
        const result = await taskFn();
        resolve(result);
      } catch (e) {
        reject(e);
      } finally {
        activeElevenLabsRequests--;
        if (elevenLabsQueue.length > 0) {
          const next = elevenLabsQueue.shift();
          next();
        }
      }
    };

    if (activeElevenLabsRequests < MAX_CONCURRENT_ELEVENLABS) {
      run();
    } else {
      elevenLabsQueue.push(run);
    }
  });
}

// Genera (o sirve desde caché) el audio de un texto + modo dado. Extraída
// tal cual estaba dentro de /voice para que /chat pueda reutilizarla
// oración por oración sin duplicar la lógica de caché — el comportamiento
// de /voice no cambia, solo delega en esta función.
//
// withTimestamps (default false): con false, esta función es BYTE POR
// BYTE idéntica a como estaba antes de agregar timestamps — mismo
// endpoint, mismo Buffer de retorno. Ningún llamado existente (/voice sin
// pedirlo, y /chat siempre) pasa este parámetro, así que quedan intactos.
// Con true, usa el endpoint /with-timestamps de ElevenLabs (devuelve JSON
// con audio_base64 + alignment) y devuelve { buffer, alignment } en vez
// de un Buffer suelto.
async function generateVoiceAudio(rawText, mode, withTimestamps = false) {
  const voice_settings = VOICE_SETTINGS[mode] ?? VOICE_SETTINGS.narration;

  // El texto de los tours trae marcas de dirección como "(pausa)" y
  // "(micro pausa)" — no deben sonar en la narración, se convierten en
  // una pausa natural con puntuación en vez de leerse literal.
  const text = rawText
    .replace(/\(\s*micro\s*pausa\s*\)/gi, "")
    .replace(/\(\s*pausa\s*\)/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Caché de servidor: mismo texto + mismo modo + misma versión → mismo
  // archivo para cualquier usuario. Si ya está generado, se sirve
  // directo del disco, sin tocar ElevenLabs ni la fila de concurrencia.
  const cacheKey = crypto
    .createHash("md5")
    .update(`${SERVER_CACHE_VERSION}-${mode}-${text}`)
    .digest("hex");
  const cacheFilePath = `${AUDIO_CACHE_DIR}/${cacheKey}.mp3`;

  if (!withTimestamps) {
    // Camino de siempre — no tocar nada acá.
    if (fs.existsSync(cacheFilePath)) {
      return fs.readFileSync(cacheFilePath);
    }

    const elevenRes = await runWithConcurrencyLimit(() =>
      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: ELEVENLABS_MODEL,
          voice_settings,
        }),
      })
    );

    const contentType = elevenRes.headers.get("content-type") || "";

    if (!elevenRes.ok || !contentType.includes("audio")) {
      const errText = await elevenRes.text();
      console.error("Respuesta inesperada de ElevenLabs:", elevenRes.status, contentType, errText);
      throw new Error(`ElevenLabs ${elevenRes.status}: ${errText}`);
    }

    const buffer = Buffer.from(await elevenRes.arrayBuffer());

    fs.writeFileSync(cacheFilePath, buffer);

    return buffer;
  }

  // withTimestamps = true, solo para la narración principal.
  const alignmentFilePath = `${AUDIO_CACHE_DIR}/${cacheKey}.json`;

  // TEMP DEBUG [ALIGNMENT DEBUG] — bifurcación exacta: caché en disco vs.
  // llamada real a ElevenLabs, con el cacheKey calculado para poder
  // compararlo directo contra lo que ya sabemos que existe en
  // backend/audio-cache/.
  const cacheFileExists = fs.existsSync(cacheFilePath);
  console.log(
    "[ALIGNMENT DEBUG] generateVoiceAudio: cacheKey:",
    cacheKey,
    "| ¿existe el .mp3 en caché?",
    cacheFileExists,
    "| rama tomada:",
    cacheFileExists ? "CACHÉ (no llama a ElevenLabs)" : "ELEVENLABS (llamada real)"
  );

  if (cacheFileExists) {
    const buffer = fs.readFileSync(cacheFilePath);
    // El .mp3 puede ser de un uso viejo, de antes de este cambio, sin su
    // .json al lado — se devuelve el audio igual, con alignment en null
    // (el cliente ya sabe caer a la estimación en ese caso), en vez de
    // volver a pagarle a ElevenLabs por un audio que ya tenemos.
    const alignment = fs.existsSync(alignmentFilePath)
      ? JSON.parse(fs.readFileSync(alignmentFilePath, "utf-8"))
      : null;
    return { buffer, alignment };
  }

  const elevenRes = await runWithConcurrencyLimit(() =>
    fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/with-timestamps`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings,
      }),
    })
  );

  if (!elevenRes.ok) {
    const errText = await elevenRes.text();
    console.error("Respuesta inesperada de ElevenLabs (with-timestamps):", elevenRes.status, errText);
    throw new Error(`ElevenLabs ${elevenRes.status}: ${errText}`);
  }

  // TEMP DEBUG: ver el texto crudo de ElevenLabs antes de que nuestro
  // código le toque nada. .json() consume el body una sola vez, así que
  // para poder loguear el crudo hay que leerlo con .text() y parsearlo
  // nosotros mismos — data queda idéntico a como quedaba con .json().
  const rawResponseText = await elevenRes.text();
  console.log(
    "[ALIGNMENT DEBUG] Respuesta cruda de ElevenLabs /with-timestamps (primeros 500 caracteres):",
    rawResponseText.slice(0, 500)
  );

  const data = JSON.parse(rawResponseText);
  const buffer = Buffer.from(data.audio_base64, "base64");
  const alignment = data.alignment ?? null;

  fs.writeFileSync(cacheFilePath, buffer);
  if (alignment) {
    fs.writeFileSync(alignmentFilePath, JSON.stringify(alignment));
  }

  return { buffer, alignment };
}

// Exportada solo para poder probar esta función real (no una copia) desde
// un script de Node aislado, sin pasar por el celular ni por /voice.
export { generateVoiceAudio };

app.post("/voice", async (req, res) => {
  try {
    const { mode, withTimestamps } = req.body;

    if (!withTimestamps) {
      // Camino de siempre — no tocar nada acá.
      const buffer = await generateVoiceAudio(req.body.text, mode);

      res.setHeader("Content-Type", "audio/mpeg");
      res.send(buffer);
      return;
    }

    const { buffer, alignment } = await generateVoiceAudio(
      req.body.text,
      mode,
      true
    );

    res.json({
      audioBase64: buffer.toString("base64"),
      alignment,
    });
  } catch (e) {
    console.error("Error voz:", e);
    res.status(500).send("error voz");
  }
});

// Separa un buffer de texto en oraciones completas (terminan en ".", "!"
// o "?") y lo que todavía queda sin cerrar. Cuidado especial con números
// decimales ("2.5 km"): si el carácter que sigue al punto es un dígito,
// no se considera fin de oración. Si el punto es lo último que llegó
// hasta ahora, tampoco se corta ahí — se espera un carácter más para
// poder decidir.
function extractCompleteSentences(buffer) {
  const sentences = [];
  let start = 0;

  for (let i = 0; i < buffer.length; i++) {
    const char = buffer[i];
    if (char !== "." && char !== "!" && char !== "?") continue;

    const next = buffer[i + 1];
    if (next === undefined) break;
    if (/[0-9]/.test(next)) continue;

    const sentence = buffer.slice(start, i + 1).trim();
    if (sentence) sentences.push(sentence);
    start = i + 1;
  }

  return { sentences, remainder: buffer.slice(start) };
}

app.post("/transcribe", async (req, res) => {
  try {
    const { audioBase64 } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: "Falta audioBase64" });
    }

    const buffer = Buffer.from(audioBase64, "base64");

    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(buffer, "pregunta.m4a"),
      model: "gpt-4o-mini-transcribe",
      language: "es",
    });

    console.log("🎙️ Transcripción:", transcription.text);

    res.json({ text: transcription.text });
  } catch (e) {
    console.error("Error transcribiendo:", e);
    res.status(500).json({ error: "Error transcribiendo audio" });
  }
});

app.post("/chat", async (req, res) => {
  try {
    console.log("📩 Mensaje recibido:", req.body.message);

    const { message, context, summary, highlights, tourTitle, history } = req.body;

    // Solo se aceptan turnos con la forma esperada — si algo raro llega en
    // el body, se ignora en vez de mandárselo tal cual a OpenAI.
    const conversationHistory = Array.isArray(history)
      ? history.filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string"
        )
      : [];

    const text = (message || "").toLowerCase().trim();

const shortAllowed = [
  "si",
  "sí",
  "no",
  "ok",
  "dale",
  "continua",
  "continúa",
  "siguiente",
  "entrar",
  "afuera",
  "fuera",
  "base",
  "profunda"
];

const blockedTopics = [
  "fútbol",
  "partido",
  "champions",
  "liga",
  "real madrid",
  "barcelona",
  "salud",
  "medicina",
  "doctor",
  "síntoma",
  "política",
  "presidente",
  "elecciones",
  "noticia",
  "noticias",
  "btc",
  "bitcoin",
  "cripto",
  "programación",
  "código",
  "chatgpt",
  "openai",
  "iphone",
  "android",
  "netflix",
  "amor",
  "novia",
  "trabajo",
  "cv"
];

const isShortAllowed = shortAllowed.includes(text);
const isClearlyOffTopic = blockedTopics.some(word => text.includes(word));

if (!isShortAllowed && isClearlyOffTopic) {
  return res.json({
    text: "Solo puedo responder preguntas sobre este recorrido y este lugar."
  });
}

    // TEMP DEBUG — valores exactos y completos tal como llegan en el
    // body, para confirmar con datos reales antes de tocar el prompt de
    // nuevo. Remover después.
    console.log(
      "[PROMPT DEBUG] Valores para el system prompt:",
      JSON.stringify({ tourTitle, context, summary, highlights }, null, 2)
    );

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        {
          role: "system",
    content: `
Eres GUÍA, un asistente turístico.
Solo puedes responder preguntas relacionadas con el recorrido actual.

Reglas estrictas:
- Responde solo sobre el tour, el punto actual, su historia, contexto, recorrido, duración o qué sigue después.
- El recorrido ocurre en ${tourTitle ?? "esta zona"}. Preguntas sobre esta zona en general (ubicación, distrito, alrededores) también son tema válido, no solo sobre el punto puntual actual.
- Si el usuario escribe algo breve como "sí", "no", "ok", "dale", "continúa" o "siguiente", interprétalo dentro del recorrido actual, no lo rechaces.
- Si el mensaje breve es ambiguo, asume que el usuario quiere continuar con la explicación del lugar actual.
- Si la pregunta no tiene relación con el tour, responde exactamente:
"Solo puedo responder preguntas sobre este recorrido y este lugar."
- No respondas temas generales, personales, actualidad, tecnología, deporte, salud ni otros temas externos.
- Responde breve, claro y natural.

Tour actual: ${tourTitle ?? "Tour"}
Punto actual: ${context ?? "Lugar actual"}
Resumen: ${summary ?? "Sin resumen"}
Datos clave: ${Array.isArray(highlights) ? highlights.join(", ") : "Sin datos clave"}
`.trim()
  },
        ...conversationHistory,
        {
          role: "user",
          content: message
        }
      ],
    });

    // A partir de acá la respuesta es streaming: un objeto JSON por línea
    // (NDJSON), cada uno con el audio de una oración apenas queda lista —
    // así GUÍA puede empezar a hablar sin esperar el texto completo.
    res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");

    let sentenceBuffer = "";
    let fullText = "";

    const sendSentence = async (rawSentence) => {
      const sentence = rawSentence.trim();
      if (!sentence) return;

      try {
        const audioBuffer = await generateVoiceAudio(sentence, "chat");
        res.write(
          JSON.stringify({
            type: "chunk",
            text: sentence,
            audioBase64: audioBuffer.toString("base64"),
          }) + "\n"
        );
      } catch (audioError) {
        console.error("Error generando audio de un fragmento del chat:", audioError);
        res.write(
          JSON.stringify({
            type: "chunk",
            text: sentence,
            audioBase64: null,
            error: "No se pudo generar audio para este fragmento",
          }) + "\n"
        );
      }
    };

    try {
      for await (const part of stream) {
        const delta = part.choices?.[0]?.delta?.content || "";
        if (!delta) continue;

        fullText += delta;
        sentenceBuffer += delta;

        const { sentences, remainder } = extractCompleteSentences(sentenceBuffer);
        sentenceBuffer = remainder;

        for (const sentence of sentences) {
          await sendSentence(sentence);
        }
      }

      // El pedazo final puede no terminar en punto — igual se procesa,
      // para no perder el cierre de la respuesta.
      await sendSentence(sentenceBuffer);

      console.log("🤖 Respuesta IA:", fullText);

      res.write(JSON.stringify({ type: "done" }) + "\n");
      res.end();
    } catch (streamError) {
      // Los headers (200, NDJSON) ya se mandaron, así que un error acá no
      // puede convertirse en un status 500 nuevo — se avisa como una
      // línea más y se cierra la conexión.
      console.error("Error durante el streaming del chat:", streamError);
      res.write(JSON.stringify({ type: "error", error: "Error en chat IA" }) + "\n");
      res.end();
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en chat IA" });
  }
});

// Arranca el servidor solo cuando este archivo se ejecuta directo
// (`node server.js`, igual que siempre) — no cuando otro módulo lo
// importa (ej. un script de prueba aislado que solo quiere usar
// generateVoiceAudio), para no intentar levantar un segundo listener en
// el puerto 3000 y chocar con el backend real que ya está corriendo.
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  app.listen(3000, "0.0.0.0", () => {
    console.log("🔥 Backend corriendo en red local");
  });
}