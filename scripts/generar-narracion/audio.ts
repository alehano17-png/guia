// Audio de la narración: PCM de 16 bits, mono, 24 kHz (lo que entrega OpenAI
// Realtime), silencios entre fragmentos y codificación a MP3 mono de 64 kbps
// con lamejs (JavaScript puro, sin programas aparte).

export const SAMPLE_RATE = 24000;
export const MP3_KBPS = 64;

// Recorte de los bordes de cada fragmento: el modelo suele dejar un poco de
// silencio al principio y al final, y los silencios reales los pone esta
// herramienta. Se deja un margen para no comerse el inicio de una palabra
// suave ni la cola de la última.
const TRIM_THRESHOLD = 400; // amplitud (de 32767) que ya cuenta como voz
const TRIM_PAD_START_SECONDS = 0.08;
const TRIM_PAD_END_SECONDS = 0.15;

// El paquete publica para "require" un archivo que no exporta nada; solo su
// versión ESM exporta Mp3Encoder, así que se carga con import() dinámico.
type Mp3EncoderClass = new (channels: number, sampleRate: number, kbps: number) => {
  encodeBuffer(left: Int16Array): Uint8Array;
  flush(): Uint8Array;
};

let encoderClass: Mp3EncoderClass | null = null;

async function loadMp3Encoder(): Promise<Mp3EncoderClass> {
  if (!encoderClass) {
    const lame = (await import("@breezystack/lamejs")) as unknown as {
      Mp3Encoder?: Mp3EncoderClass;
      default?: { Mp3Encoder?: Mp3EncoderClass };
    };
    const found = lame.Mp3Encoder ?? lame.default?.Mp3Encoder;
    if (!found) throw new Error("No se pudo cargar Mp3Encoder de @breezystack/lamejs");
    encoderClass = found;
  }
  return encoderClass;
}

// Une los pedazos base64 de PCM16 little-endian que llegan por el WebSocket.
export function pcmFromBase64Chunks(chunks: string[]): Int16Array {
  const bytes = Buffer.concat(chunks.map((c) => Buffer.from(c, "base64")));
  const even = bytes.length - (bytes.length % 2);
  const pcm = new Int16Array(even / 2);
  for (let i = 0; i < pcm.length; i++) pcm[i] = bytes.readInt16LE(i * 2);
  return pcm;
}

export function trimSilence(pcm: Int16Array): Int16Array {
  let first = -1;
  let last = -1;
  for (let i = 0; i < pcm.length; i++) {
    if (Math.abs(pcm[i]) >= TRIM_THRESHOLD) {
      if (first === -1) first = i;
      last = i;
    }
  }
  if (first === -1) return new Int16Array(0);
  const start = Math.max(0, first - Math.round(TRIM_PAD_START_SECONDS * SAMPLE_RATE));
  const end = Math.min(pcm.length, last + 1 + Math.round(TRIM_PAD_END_SECONDS * SAMPLE_RATE));
  return pcm.slice(start, end);
}

export function silence(seconds: number): Int16Array {
  return new Int16Array(Math.round(seconds * SAMPLE_RATE));
}

export function concatPcm(parts: Int16Array[]): Int16Array {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Int16Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

export function durationSeconds(pcm: Int16Array): number {
  return pcm.length / SAMPLE_RATE;
}

// MP3 mono de 64 kbps a 24 kHz (MPEG-2 capa III).
export async function encodeMp3(pcm: Int16Array): Promise<Buffer> {
  const Mp3Encoder = await loadMp3Encoder();
  const encoder = new Mp3Encoder(1, SAMPLE_RATE, MP3_KBPS);
  const chunks: Buffer[] = [];
  const BLOCK = 1152;
  for (let i = 0; i < pcm.length; i += BLOCK) {
    const out = encoder.encodeBuffer(pcm.subarray(i, i + BLOCK));
    if (out.length) chunks.push(Buffer.from(out));
  }
  const tail = encoder.flush();
  if (tail.length) chunks.push(Buffer.from(tail));
  return Buffer.concat(chunks);
}
