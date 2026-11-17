// Texto de la narración: fragmentos y silencios, alignment por carácter y
// revisión de la transcripción.

import { createHash } from "node:crypto";
// La MISMA limpieza que usan hoy el servidor (generateVoiceAudio) y la app
// (stopCurrentAudio) para redondear al inicio de la oración: el alignment
// se arma carácter por carácter sobre este texto.
import { cleanNarrationText } from "../../lib/sentences";

// Silencios reales al unir el audio (segundos).
export const MICRO_PAUSE_SECONDS = 0.4; // "(micro pausa)"
export const PAUSE_SECONDS = 0.9; // "(pausa)"
// "(silencio Ns)" = N segundos; "(confirmación requerida)" se quita sin silencio.
export const PARAGRAPH_PAUSE_SECONDS = 0.6; // párrafo nuevo sin marca

// Mismas marcas (y mismo orden: "micro pausa" antes que "pausa") que
// cleanNarrationText.
const MARKER = /\(\s*micro\s*pausa\s*\)|\(\s*pausa\s*\)|\(\s*silencio\s*(\d+)\s*s\s*\)|\(\s*confirmación\s*requerida\s*\)/gi;
const PARAGRAPH_BREAK = /\n[ \t]*\n/;

function markerSilence(marker: string, seconds: string | undefined): number {
  if (seconds !== undefined) return Number(seconds);
  if (/micro/i.test(marker)) return MICRO_PAUSE_SECONDS;
  if (/pausa/i.test(marker)) return PAUSE_SECONDS;
  return 0; // (confirmación requerida)
}

export type Fragment = {
  // Lo que se le da al modelo para leer (espacios normalizados).
  text: string;
  // Posición exacta en el texto limpio (cleanNarrationText).
  cleanStart: number;
  cleanEnd: number;
  // Silencio después de este fragmento (0 en el último).
  silenceAfter: number;
};

export type SplitText = { clean: string; fragments: Fragment[] };

// Divide un voiceText por las marcas y por párrafos. Entre dos fragmentos va
// el silencio más largo de lo que los separa (por ejemplo, "(pausa)" seguido
// de un párrafo nuevo = 0,9 s, no 1,5 s). Antes del primero y después del
// último no se agrega silencio.
export function splitVoiceText(voiceText: string): SplitText {
  const clean = cleanNarrationText(voiceText);
  const pieces: { raw: string; gapBefore: number }[] = [];
  let pendingGap = 0;

  const addSegment = (segment: string) => {
    segment.split(PARAGRAPH_BREAK).forEach((part, index) => {
      if (index > 0) pendingGap = Math.max(pendingGap, PARAGRAPH_PAUSE_SECONDS);
      const raw = part.trim();
      if (!raw) return;
      pieces.push({ raw, gapBefore: pendingGap });
      pendingGap = 0;
    });
  };

  let last = 0;
  for (const match of voiceText.matchAll(MARKER)) {
    addSegment(voiceText.slice(last, match.index));
    pendingGap = Math.max(pendingGap, markerSilence(match[0], match[1]));
    last = match.index! + match[0].length;
  }
  addSegment(voiceText.slice(last));

  const fragments: Fragment[] = [];
  let cursor = 0;
  pieces.forEach((piece, i) => {
    const start = clean.indexOf(piece.raw, cursor);
    if (start === -1) {
      throw new Error(`No se encontró el fragmento ${i + 1} en el texto limpio: "${piece.raw.slice(0, 40)}..."`);
    }
    cursor = start + piece.raw.length;
    fragments.push({
      text: piece.raw.replace(/\s+/g, " "),
      cleanStart: start,
      cleanEnd: cursor,
      silenceAfter: i + 1 < pieces.length ? pieces[i + 1].gapBefore : 0,
    });
  });
  return { clean, fragments };
}

// Mismo formato que devuelve hoy el servidor desde ElevenLabs.
export type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

// Tiempos exactos en los bordes de cada fragmento (dónde empieza y termina
// su audio en el archivo final); dentro del fragmento, repartidos por
// cantidad de caracteres. Lo que queda entre fragmentos (espacios, saltos
// de línea) lleva el tiempo del final del fragmento anterior.
export function buildAlignment(
  split: SplitText,
  times: { start: number; end: number }[]
): Alignment {
  const { clean, fragments } = split;
  const starts = new Array<number>(clean.length);
  const ends = new Array<number>(clean.length);
  const round = (v: number) => Math.round(v * 1000) / 1000;

  let previousEnd = 0;
  let index = 0;
  fragments.forEach((fragment, f) => {
    for (; index < fragment.cleanStart; index++) {
      starts[index] = round(previousEnd);
      ends[index] = round(previousEnd);
    }
    const { start, end } = times[f];
    const length = fragment.cleanEnd - fragment.cleanStart;
    for (let k = 0; k < length; k++, index++) {
      starts[index] = round(start + ((end - start) * k) / length);
      ends[index] = round(start + ((end - start) * (k + 1)) / length);
    }
    previousEnd = end;
  });
  for (; index < clean.length; index++) {
    starts[index] = round(previousEnd);
    ends[index] = round(previousEnd);
  }

  // Un elemento por carácter de JavaScript, como compara la app
  // (alignment.characters.length === cleanedText.length).
  return {
    characters: clean.split(""),
    character_start_times_seconds: starts,
    character_end_times_seconds: ends,
  };
}

// Sin tildes, mayúsculas ni signos.
export function normalizeForReview(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function words(text: string): string[] {
  const normalized = normalizeForReview(text);
  return normalized ? normalized.split(" ") : [];
}

// Coincidencia palabra por palabra: palabras en el mismo orden (subsecuencia
// común más larga) sobre el largo mayor de los dos textos, así cuenta tanto
// lo que falta como lo que sobra.
export function wordMatchRatio(expected: string, transcript: string): number {
  const a = words(expected);
  const b = words(transcript);
  if (!a.length && !b.length) return 1;
  if (!a.length || !b.length) return 0;
  let previous = new Array<number>(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    const current = new Array<number>(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      current[j] = a[i - 1] === b[j - 1] ? previous[j - 1] + 1 : Math.max(previous[j], current[j - 1]);
    }
    previous = current;
  }
  return previous[b.length] / Math.max(a.length, b.length);
}

// Números y fechas del texto que no aparecen en la transcripción.
export function missingNumbers(expected: string, transcript: string): string[] {
  const said = new Set(words(transcript));
  return [...new Set(words(expected).filter((w) => /\d/.test(w)))].filter((n) => !said.has(n));
}

// Revisión de la pregunta "¿Llegaste?": nombre del lugar (sin su artículo
// inicial, porque el modelo puede decir "al" o "del") y la palabra del botón.
export function arrivalPhraseProblems(placeTitle: string, buttonWord: string, transcript: string): string[] {
  const said = ` ${normalizeForReview(transcript)} `;
  const place = normalizeForReview(placeTitle).replace(/^(el|la|los|las|the) /, "");
  const problems: string[] = [];
  if (!said.includes(` ${place} `)) problems.push(`falta "${placeTitle}"`);
  if (!said.includes(` ${normalizeForReview(buttonWord)} `)) problems.push(`falta "${buttonWord}"`);
  return problems;
}

export function hashOf(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}
