import { tourApiFetch } from "./tourApiConfig";

export async function transcribeAudio(
  audioBase64: string,
  language: "es" | "en" = "es"
): Promise<string> {
  // tourApiFetch ya lanza TourApiError si la respuesta no es ok.
  const res = await tourApiFetch("/transcribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64, language }),
  });

  const data = await res.json();

  if (typeof data?.text !== "string") {
    throw new Error("Respuesta inválida de transcripción");
  }

  return data.text;
}
