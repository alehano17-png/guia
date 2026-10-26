import { getTourApiHeaders, TOUR_API_BASE_URL } from "./tourApiConfig";

export async function transcribeAudio(
  audioBase64: string,
  language: "es" | "en" = "es"
): Promise<string> {
  const res = await fetch(`${TOUR_API_BASE_URL}/transcribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getTourApiHeaders()),
    },
    body: JSON.stringify({ audioBase64, language }),
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
