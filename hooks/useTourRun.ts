import { useCallback, useEffect, useState } from "react";
import { tourApiFetch } from "../lib/tourApiConfig";

type TourRunStart = { runId: string; remainingSeconds: number | null };

// Pide /tour/start: el mismo run si este tour ya estaba iniciado y sin
// terminar, o uno nuevo. null si falla (por ejemplo, sin internet).
async function requestTourStart(tourId: string): Promise<TourRunStart | null> {
  return tourApiFetch("/tour/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tourId }),
  })
    .then((res) => res.json())
    .then((data) =>
      typeof data?.runId === "string"
        ? {
            runId: data.runId,
            remainingSeconds:
              typeof data.remainingSeconds === "number" ? data.remainingSeconds : null,
          }
        : null
    )
    .catch(() => null);
}

// Bolsa de conversación del tour (la controla el servidor: ver
// backend/conversations.js). Al abrir el tour se pide /tour/start, que
// devuelve el mismo run si este tour ya estaba iniciado y sin terminar.
// Si falla, se puede reintentar con retry() (por ejemplo, al tocar el botón
// de GUÍA); sin run no hay conversación en tiempo real.
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

    requestTourStart(tourId).then((started) => {
      if (cancelled || !started) return;
      setRunId(started.runId);
      setRemainingSeconds(started.remainingSeconds);
    });

    return () => {
      cancelled = true;
    };
  }, [tourId, enabled]);

  // Reintenta /tour/start en este momento. Devuelve el runId (también
  // queda guardado) o null si vuelve a fallar.
  const retry = useCallback(async (): Promise<string | null> => {
    const started = await requestTourStart(tourId);
    if (!started) return null;
    setRunId(started.runId);
    setRemainingSeconds(started.remainingSeconds);
    return started.runId;
  }, [tourId]);

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

  return { runId, remainingSeconds, setRemainingSeconds, retry, finish };
}
