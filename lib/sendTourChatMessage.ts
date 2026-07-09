import { TOUR_API_BASE_URL } from "./tourApiConfig";

type Params = {
  message: string;
  context?: string;
  summary?: string;
  highlights?: string[];
  tourTitle?: string;
};

export async function sendTourChatMessage({
  message,
  context,
  summary,
  highlights,
  tourTitle,
}: Params): Promise<string> {
  const res = await fetch(`${TOUR_API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      context,
      summary,
      highlights,
      tourTitle,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  const data = await res.json();

  if (!data?.text || typeof data.text !== "string") {
    throw new Error("Respuesta inválida del chat");
  }

  return data.text;
}
