import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

dotenv.config(); // 🔥 primero cargas variables

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/voice", async (req, res) => {
  try {
    const { text } = req.body;

    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
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