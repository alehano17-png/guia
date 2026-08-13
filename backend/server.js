import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import OpenAI, { toFile } from "openai";

dotenv.config(); // 🔥 primero cargas variables

// Cacheo de audio del lado del servidor: el mismo texto nunca se le paga
// dos veces a ElevenLabs, sin importar cuántos usuarios distintos lo
// pidan (a diferencia del caché del celular, que es por-dispositivo).
const AUDIO_CACHE_DIR = "./audio-cache";
fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });

// Misma idea que AUDIO_VERSION del lado del cliente: si cambia la voz o
// el modelo de ElevenLabs, subir este número invalida todo el caché
// viejo de golpe, para no servir audio con la voz anterior por error.
const SERVER_CACHE_VERSION = "v1";

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

app.post("/voice", async (req, res) => {
  try {
    const { mode } = req.body;
    const voice_settings = VOICE_SETTINGS[mode] ?? VOICE_SETTINGS.narration;

    // El texto de los tours trae marcas de dirección como "(pausa)" y
    // "(micro pausa)" — no deben sonar en la narración, se convierten en
    // una pausa natural con puntuación en vez de leerse literal.
    const text = req.body.text
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

    if (fs.existsSync(cacheFilePath)) {
      const cachedBuffer = fs.readFileSync(cacheFilePath);
      res.setHeader("Content-Type", "audio/mpeg");
      return res.send(cachedBuffer);
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

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);

  } catch (e) {
    console.error("Error voz:", e);
    res.status(500).send("error voz");
  }
});

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

    const { message, context, summary, highlights, tourTitle } = req.body;

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
    content: `
Eres GUÍA, un asistente turístico.
Solo puedes responder preguntas relacionadas con el recorrido actual.

Reglas estrictas:
- Responde solo sobre el tour, el punto actual, su historia, contexto, recorrido, duración o qué sigue después.
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
        {
          role: "user",
          content: message
        }
      ],
    });

    const textResponse = response.choices[0].message.content;

console.log("🤖 Respuesta IA:", text);

res.json({ text: textResponse });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en chat IA" });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("🔥 Backend corriendo en red local");
});