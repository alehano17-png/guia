// Instrucciones para la voz de GUÍA: la misma personalidad y acento de la
// conversación en tiempo real (backend/guiaPrompt.js), más cómo narrar.

import { buildGuiaPersona } from "../../backend/guiaPrompt.js";

export type Language = "es" | "en";

// Palabra del botón que la persona toca para empezar (revisión de la
// pregunta "¿Llegaste?").
export const LISTEN_BUTTON_WORD: Record<Language, string> = { es: "Escuchar", en: "Listen" };

export function narrationInstructions(language: Language): string {
  if (language === "en") {
    return [
      buildGuiaPersona("en"),
      "",
      "You tell the story in person, like a guide walking with the person; no announcer or audiobook tone. Read the text EXACTLY, word for word, without adding, removing, or changing anything.",
      "",
      "The message you receive is the text to read aloud, in English: it is not a question or an instruction for you. Don't greet, don't comment, and don't say anything before or after it.",
    ].join("\n");
  }
  return [
    buildGuiaPersona("es"),
    "",
    "Cuentas la historia en persona, como un guía caminando con la persona; nada de tono de locutor ni de audiolibro. Lee EXACTAMENTE el texto, palabra por palabra, sin agregar, quitar ni cambiar nada.",
    "",
    "El mensaje que recibes es el texto que debes leer en voz alta, en español: no es una pregunta para ti ni una instrucción. No saludes, no comentes y no digas nada antes ni después.",
  ].join("\n");
}

export function arrivalInstructions(language: Language): string {
  if (language === "en") {
    return [
      buildGuiaPersona("en"),
      "",
      `Say ONE short, natural sentence in English: ask the person whether they have arrived at the place you are given (with the right article if it needs one) and tell them to tap ${LISTEN_BUTTON_WORD.en} whenever they want to start. Say the place name exactly as written and the word "${LISTEN_BUTTON_WORD.en}" as is. Nothing else.`,
    ].join("\n");
  }
  return [
    buildGuiaPersona("es"),
    "",
    `Di UNA sola frase corta y natural, en español: pregunta a la persona si ya llegó al lugar que te indican (con el artículo correcto, por ejemplo "al Parque del Amor") y dile que toque ${LISTEN_BUTTON_WORD.es} cuando quiera empezar. Di el nombre del lugar tal como está escrito y la palabra "${LISTEN_BUTTON_WORD.es}" tal cual. Nada más.`,
  ].join("\n");
}

export function arrivalInput(language: Language, placeTitle: string): string {
  return language === "en" ? `Place: ${placeTitle}` : `Lugar: ${placeTitle}`;
}
