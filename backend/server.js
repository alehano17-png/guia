import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI, { toFile } from "openai";

dotenv.config(); // 🔥 primero cargas variables

const app = express();
app.use(cors());
// Límite alto porque /transcribe recibe audio corto en base64 dentro del JSON
app.use(express.json({ limit: "25mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Misma voz para narración y conversación: GUÍA debe sonar como una sola
// persona, no como un narrador y luego un asistente distinto.
const GUIA_VOICE = "marin";

const VOICE_INSTRUCTIONS = {
  // Narración de un punto del tour: pausada, cálida, como contando una historia.
  narration:
    "Habla como un guía turístico cercano y cálido, caminando junto al oyente. " +
    "Ritmo pausado y natural, con pequeñas pausas como al conversar, no como " +
    "alguien leyendo un texto en voz alta.",
  // Respuesta a una pregunta puntual del usuario: más viva, conversacional.
  chat:
    "Responde como si estuvieras charlando cara a cara con alguien que te " +
    "acaba de hacer una pregunta mientras caminan juntos. Tono cercano, " +
    "espontáneo y natural, con la energía de una conversación real, breve " +
    "y directo, sin sonar como una narración leída.",
};

app.post("/voice", async (req, res) => {
  try {
    const { text, mode } = req.body;
    const instructions = VOICE_INSTRUCTIONS[mode] ?? VOICE_INSTRUCTIONS.narration;

    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: GUIA_VOICE,
      instructions,
      format: "mp3",
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

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