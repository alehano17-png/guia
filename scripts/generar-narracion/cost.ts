// Costo de OpenAI Realtime: el real sale del "usage" que devuelve cada
// respuesta (response.done); el estimado, antes de generar, de la cantidad
// de texto.

export type ModelPrices = {
  date: string;
  source: string;
  usdPerMillionTokens: {
    textInput: number;
    textInputCached: number;
    textOutput: number;
    audioInput: number;
    audioInputCached: number;
    audioOutput: number;
  };
};

// Precios en US$ por millón de tokens, por modelo, según la página de cada
// modelo en OpenAI (noviembre de 2026). Si cambian, actualizar solo aquí.
// Un modelo que no está aquí no se puede usar (la herramienta se detiene).
export const REALTIME_PRICES: Record<string, ModelPrices> = {
  "gpt-realtime-2.1": {
    date: "2026-11",
    source: "https://developers.openai.com/api/docs/models/gpt-realtime-2.1",
    usdPerMillionTokens: {
      textInput: 4,
      textInputCached: 0.4,
      textOutput: 24,
      audioInput: 32,
      audioInputCached: 0.4,
      audioOutput: 64,
    },
  },
  "gpt-realtime-2.1-mini": {
    date: "2026-11",
    source: "https://developers.openai.com/api/docs/models/gpt-realtime-2.1-mini",
    usdPerMillionTokens: {
      textInput: 0.6,
      textInputCached: 0.06,
      textOutput: 2.4,
      audioInput: 10,
      audioInputCached: 0.3,
      audioOutput: 20,
    },
  },
};

// Tope por corrida si no se pasa --tope.
export const DEFAULT_BUDGET_USD = 1.5;

// Para estimar antes de generar (a propósito un poco pesimistas: sin
// contar el descuento de caché).
// - Audio de salida: 1 token cada 50 ms (documentación de costos de OpenAI
//   Realtime; la prueba corta lo confirmó: 175 tokens en 8,75 s).
// - Ritmo de lectura y tokens de texto: ajustados con la prueba corta
//   (90 caracteres en 8,4 s; 57 tokens de texto de salida, 15 de ellos de
//   razonamiento).
const OUTPUT_AUDIO_TOKENS_PER_SECOND = 20;
const SPOKEN_CHARS_PER_SECOND = 10;
const INPUT_CHARS_PER_TOKEN = 3;
const OUTPUT_CHARS_PER_TOKEN = 2;
const OVERHEAD_INPUT_TOKENS = 40;
const REASONING_TOKENS_PER_RESPONSE = 20;

export type RealtimeUsage = {
  input_token_details?: {
    text_tokens?: number;
    audio_tokens?: number;
    cached_tokens_details?: { text_tokens?: number; audio_tokens?: number };
  };
  output_token_details?: { text_tokens?: number; audio_tokens?: number };
};

// Los tokens en caché son parte de los de entrada (documentación de OpenAI):
// se cobran aparte, a su precio.
export function usageCost(prices: ModelPrices, usage: RealtimeUsage | undefined): number {
  if (!usage) return 0;
  const p = prices.usdPerMillionTokens;
  const input = usage.input_token_details ?? {};
  const cached = input.cached_tokens_details ?? {};
  const output = usage.output_token_details ?? {};
  const textIn = input.text_tokens ?? 0;
  const audioIn = input.audio_tokens ?? 0;
  const textCached = Math.min(cached.text_tokens ?? 0, textIn);
  const audioCached = Math.min(cached.audio_tokens ?? 0, audioIn);
  const usd =
    (textIn - textCached) * p.textInput +
    textCached * p.textInputCached +
    (audioIn - audioCached) * p.audioInput +
    audioCached * p.audioInputCached +
    (output.text_tokens ?? 0) * p.textOutput +
    (output.audio_tokens ?? 0) * p.audioOutput;
  return usd / 1_000_000;
}

// Una respuesta: entra instrucciones + texto, sale el audio y su
// transcripción.
export function estimateResponseCost(prices: ModelPrices, instructionsChars: number, spokenChars: number): number {
  const p = prices.usdPerMillionTokens;
  const inputTokens = (instructionsChars + spokenChars) / INPUT_CHARS_PER_TOKEN + OVERHEAD_INPUT_TOKENS;
  const audioTokens = (spokenChars / SPOKEN_CHARS_PER_SECOND) * OUTPUT_AUDIO_TOKENS_PER_SECOND;
  const textTokens = spokenChars / OUTPUT_CHARS_PER_TOKEN + REASONING_TOKENS_PER_RESPONSE;
  return (inputTokens * p.textInput + audioTokens * p.audioOutput + textTokens * p.textOutput) / 1_000_000;
}

export function formatUsd(value: number): string {
  return `US$ ${value.toFixed(value < 0.1 ? 4 : 2)}`;
}
