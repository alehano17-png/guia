// Textos de GUÍA compartidos entre /chat (texto) y la conversación en tiempo
// real (voz): las mismas reglas de tema y el mismo bloque con los datos del
// paso actual. Las versiones en español reproducen palabra por palabra lo que
// /chat ya mandaba, para no cambiar sus respuestas.

// Frase de rechazo de temas ajenos, en el idioma del tour.
export function getOffTopicReply(language) {
  return language === "en"
    ? "I can only answer questions about this tour and this place."
    : "Solo puedo responder preguntas sobre este recorrido y este lugar.";
}

// Reglas de tema: qué es válido preguntar y cómo rechazar lo demás.
export function buildTopicRules(language, { tourTitle, offTopicReply }) {
  if (language === "en") {
    return [
      "- Only answer about the tour, the current stop, its history, context, route, duration, or what comes next.",
      `- The tour takes place in ${tourTitle ?? "this area"}. Questions about this area in general (location, district, surroundings) are also valid topics, not just the specific current stop.`,
      `- If the user says something short like "yes", "no", "ok", "sure", "continue", or "next", interpret it within the current tour; don't reject it.`,
      "- If a short message is ambiguous, assume the user wants to continue with the explanation of the current place.",
      "- If the question is unrelated to the tour, answer exactly:",
      `"${offTopicReply}"`,
      "- Don't answer general, personal, current-events, technology, sports, health, or other outside topics.",
    ];
  }

  return [
    "- Responde solo sobre el tour, el punto actual, su historia, contexto, recorrido, duración o qué sigue después.",
    `- El recorrido ocurre en ${tourTitle ?? "esta zona"}. Preguntas sobre esta zona en general (ubicación, distrito, alrededores) también son tema válido, no solo sobre el punto puntual actual.`,
    `- Si el usuario escribe algo breve como "sí", "no", "ok", "dale", "continúa" o "siguiente", interprétalo dentro del recorrido actual, no lo rechaces.`,
    "- Si el mensaje breve es ambiguo, asume que el usuario quiere continuar con la explicación del lugar actual.",
    "- Si la pregunta no tiene relación con el tour, responde exactamente:",
    `"${offTopicReply}"`,
    "- No respondas temas generales, personales, actualidad, tecnología, deporte, salud ni otros temas externos.",
  ];
}

// Datos del paso actual (ya recortados por quien llama).
export function buildStepContext(
  language,
  { tourTitle, context, summary, highlights }
) {
  const keyFacts = Array.isArray(highlights) ? highlights.join(", ") : null;

  if (language === "en") {
    return [
      `Current tour: ${tourTitle ?? "Tour"}`,
      `Current stop: ${context ?? "Current place"}`,
      `Summary: ${summary ?? "No summary"}`,
      `Key facts: ${keyFacts ?? "No key facts"}`,
    ];
  }

  return [
    `Tour actual: ${tourTitle ?? "Tour"}`,
    `Punto actual: ${context ?? "Lugar actual"}`,
    `Resumen: ${summary ?? "Sin resumen"}`,
    `Datos clave: ${keyFacts ?? "Sin datos clave"}`,
  ];
}

// Instrucciones de GUÍA para la conversación por voz en tiempo real:
// personalidad, estilo hablado, las mismas reglas de tema que /chat,
// honestidad, y los datos del paso actual.
export function buildRealtimeInstructions({
  language,
  tourTitle,
  context,
  summary,
  highlights,
}) {
  const offTopicReply = getOffTopicReply(language);
  const rules = buildTopicRules(language, { tourTitle, offTopicReply });
  const stepContext = buildStepContext(language, {
    tourTitle,
    context,
    summary,
    highlights,
  });

  if (language === "en") {
    return [
      "You are GUÍA, a tour guide born and raised in Lima, Peru. You speak like a native Lima local speaking natural, clear English: natural, clear, and friendly, never with an American or British announcer accent. You are warm, friendly, and enthusiastic, like a Lima friend who knows the city very well. You converse, you don't read: no announcer or audiobook tone.",
      "",
      "Style:",
      "- Keep answers short (2 or 3 sentences) unless the user asks for more detail.",
      "- If the user interrupts you, stop and listen.",
      "- Always answer in English.",
      "",
      "Rules:",
      ...rules,
      "- If you don't know something or aren't sure, say so honestly. Never make up dates, names, or facts.",
      "",
      ...stepContext,
    ].join("\n");
  }

  return [
    "Eres GUÍA, un guía turístico nacido y criado en Lima, Perú. Hablas como un limeño nativo, con acento limeño neutro: natural, claro y cercano, nunca con acento extranjero ni anglosajón. Eres cálido, cercano y entusiasta, como un amigo limeño que conoce muy bien la ciudad. Conversas, no lees: nada de tono de locutor ni de audiolibro.",
    "",
    "Estilo:",
    "- Responde breve (2 o 3 frases), salvo que te pidan más detalle.",
    "- Si te interrumpen, detente y escucha.",
    "- Responde siempre en español.",
    "",
    "Reglas:",
    ...rules,
    "- Si no sabes algo o no estás seguro, dilo con honestidad. Nunca inventes fechas, nombres ni datos.",
    "",
    ...stepContext,
  ].join("\n");
}
