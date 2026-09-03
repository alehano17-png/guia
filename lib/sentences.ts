// Mismo patrón EXACTO que usa generateVoiceAudio en backend/server.js para
// limpiar el texto antes de mandarlo a ElevenLabs — portado tal cual (es
// JS puro, sin nada específico de Node) porque el backend y el cliente
// son dos runtimes separados sin ningún path de import compartido entre
// ellos. Si el backend cambia esta limpieza, hay que replicarlo acá a
// mano.
//
// Sin esto, estimateSentenceStartTimes contaría caracteres que la voz
// real nunca pronuncia (los marcadores "(pausa)"/"(micro pausa)" se
// eliminan antes de generar el audio), inflando el conteo y corriendo la
// estimación de todo lo que sigue.
export function cleanNarrationText(rawText: string): string {
  return rawText
    .replace(/\(\s*micro\s*pausa\s*\)/gi, "")
    .replace(/\(\s*pausa\s*\)/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Mismo criterio de corte que extractCompleteSentences en backend/server.js
// (streaming de /chat) — portado acá porque el backend (Node) y el cliente
// (Metro/React Native) son dos runtimes separados sin ningún path de
// import compartido entre ellos. Si el criterio de corte cambia de un
// lado, hay que actualizar el otro a mano.
//
// Separa un texto en oraciones completas (terminan en ".", "!" o "?") y
// lo que quede sin cerrar al final. Cuidado especial con números
// decimales ("2.5 km"): si el carácter que sigue al punto es un dígito,
// no se considera fin de oración.
export function extractCompleteSentences(buffer: string): {
  sentences: string[];
  remainder: string;
} {
  const sentences: string[] = [];
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

export type SentenceStart = {
  sentence: string;
  startSeconds: number;
};

// Estima el segundo de inicio de cada oración de un texto completo,
// repartiendo la duración total del audio proporcionalmente a cuántos
// caracteres del texto llevan acumulados hasta el inicio de esa oración.
// Es una aproximación — no hay timestamps reales por palabra/oración, así
// que asume (nunca del todo cierto) que el narrador habla a un ritmo
// parejo a lo largo de todo el texto.
export function estimateSentenceStartTimes(
  fullText: string,
  durationSeconds: number
): SentenceStart[] {
  const { sentences, remainder } = extractCompleteSentences(fullText);
  const trimmedRemainder = remainder.trim();
  const allSentences = trimmedRemainder
    ? [...sentences, trimmedRemainder]
    : sentences;

  if (allSentences.length === 0 || durationSeconds <= 0) {
    return [];
  }

  const totalChars = allSentences.reduce(
    (sum, sentence) => sum + sentence.length,
    0
  );

  if (totalChars === 0) {
    return [];
  }

  let accumulatedChars = 0;

  return allSentences.map((sentence) => {
    const startSeconds = (accumulatedChars / totalChars) * durationSeconds;
    accumulatedChars += sentence.length;
    return { sentence, startSeconds };
  });
}

// De una lista de inicios estimados (en orden ascendente), la última que
// arranca en o antes de currentTimeSeconds — "redondear hacia atrás"
// hasta el inicio de la oración que estaba sonando, en vez de un segundo
// exacto a mitad de oración. Si ninguna arranca antes, devuelve 0. Sirve
// tanto para inicios estimados (estimateSentenceStartTimes) como para
// inicios reales (buildSentenceStartsFromAlignment) — misma forma de
// salida, mismo criterio de búsqueda.
export function findSentenceStartAtOrBefore(
  sentenceStarts: SentenceStart[],
  currentTimeSeconds: number
): number {
  let result = 0;

  for (const { startSeconds } of sentenceStarts) {
    if (startSeconds <= currentTimeSeconds) {
      result = startSeconds;
    } else {
      break;
    }
  }

  return result;
}

// Alineación real de ElevenLabs (endpoint /with-timestamps), en camelCase
// — la respuesta cruda de ElevenLabs viene en snake_case
// (character_start_times_seconds, etc.), se convierte una sola vez al
// recibirla (en ensureAudioForStep) para no meter esa convención en medio
// de un archivo que por lo demás es todo camelCase.
export type AudioAlignment = {
  characters: string[];
  characterStartTimesSeconds: number[];
  characterEndTimesSeconds: number[];
};

// Igual que estimateSentenceStartTimes, pero con tiempos REALES de
// ElevenLabs (alignment por carácter) en vez de una estimación
// proporcional por conteo de caracteres. cleanedText tiene que ser
// EXACTAMENTE el mismo texto que se le mandó a ElevenLabs (después de
// cleanNarrationText) — alignment viene indexado carácter por carácter
// sobre ESE texto, no sobre el voiceText original con "(pausa)" todavía
// adentro.
export function buildSentenceStartsFromAlignment(
  cleanedText: string,
  alignment: AudioAlignment
): SentenceStart[] {
  if (alignment.characters.length !== cleanedText.length) {
    // El alignment no corresponde a este texto (versión vieja, texto
    // distinto, etc.) — mejor no usarlo que usar índices que no calzan.
    return [];
  }

  const { sentences, remainder } = extractCompleteSentences(cleanedText);
  const trimmedRemainder = remainder.trim();
  const allSentences = trimmedRemainder
    ? [...sentences, trimmedRemainder]
    : sentences;

  // extractCompleteSentences devuelve cada oración ya con .trim() — no se
  // puede ubicar su posición real acumulando sentence.length a ciegas (el
  // espacio recortado al principio de cada oración desincroniza el
  // índice, y el error se acumula oración a oración). Se busca la
  // posición real de cada una con indexOf, avanzando el cursor.
  let searchFromIndex = 0;

  return allSentences.map((sentence) => {
    const foundIndex = cleanedText.indexOf(sentence, searchFromIndex);
    const startIndex = foundIndex === -1 ? searchFromIndex : foundIndex;
    const startSeconds = alignment.characterStartTimesSeconds[startIndex] ?? 0;
    searchFromIndex = startIndex + sentence.length;
    return { sentence, startSeconds };
  });
}
