import { TOUR_API_BASE_URL, TOUR_API_KEY, TOUR_API_KEY_HEADER } from "./tourApiConfig";

export async function transcribeAudio(audioBase64: string): Promise<string> {
  const res = await fetch(`${TOUR_API_BASE_URL}/transcribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [TOUR_API_KEY_HEADER]: TOUR_API_KEY,
    },
    body: JSON.stringify({ audioBase64 }),
  });

  if (!res.ok) {
    throw new Error(`Transcribe request failed: ${res.status}`);
  }

  const data = await res.json();

  if (typeof data?.text !== "string") {
    throw new Error("Respuesta inválida de transcripción");
  }

  return data.text;
}
