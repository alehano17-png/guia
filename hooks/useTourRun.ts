import { useCallback, useEffect, useState } from "react";
import { tourApiFetch } from "../lib/tourApiConfig";

// Bolsa de conversación del tour (la controla el servidor: ver
// backend/conversations.js). Al abrir el tour se pide /tour/start, que
// devuelve el mismo run si este tour ya estaba iniciado y sin terminar.
// Si falla, la conversación en tiempo real no está disponible en este tour;
// el resto del tour funciona igual.
export function useTourRun({
  tourId,
  enabled,
}: {
  tourId: string;
  // true cuando el tour ya está cargado.
  enabled: boolean;
}) {
  const [runId, setRunId] = useState<string | null>(null);
  // Lo que queda de la bolsa según el servidor; se actualiza después de
  // cada conversación con lo que devuelve /realtime/end.
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    tourApiFetch("/tour/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tourId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (typeof data?.runId === "string") {
          setRunId(data.runId);
          setRemainingSeconds(
            typeof data.remainingSeconds === "number" ? data.remainingSeconds : null
          );
        }
      })
      .catch(() => {
        // Sin bolsa: el botón de GUÍA usa el modo de voz anterior.
      });

    return () => {
      cancelled = true;
    };
  }, [tourId, enabled]);

  // Cierra la bolsa: solo desde el "Terminar" del último paso. No bloquea
  // la salida: si falla la red, el tour queda abierto en el servidor y la
  // próxima vez se retoma con lo que quedaba.
  const finish = useCallback(() => {
    if (!runId) return;
    tourApiFetch("/tour/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId }),
    }).catch(() => {});
  }, [runId]);

  return { runId, remainingSeconds, setRemainingSeconds, finish };
}
