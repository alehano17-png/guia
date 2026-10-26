import { notifySessionExpired } from "./sessionEvents";
import { supabase } from "./supabase";

// Dirección del servidor de voz y chat. En desarrollo viene del .env de la
// raíz (EXPO_PUBLIC_TOUR_API_URL, la IP local del backend); en producción
// se configura con la URL https del servidor publicado. Si falta, queda
// vacía: las llamadas fallan y caen en su manejo de error normal, sin
// romper la app.
export const TOUR_API_BASE_URL = process.env.EXPO_PUBLIC_TOUR_API_URL ?? "";

// Headers de autorización: el servidor exige la sesión real del usuario
// (su access token de Supabase). Sin sesión devuelve un objeto vacío y el
// servidor responde 401. Solo la usa tourApiFetch.
async function getTourApiHeaders(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

// Error de una llamada al servidor, para que quien llama pueda distinguir
// la sesión vencida y el límite de uso del resto de fallas.
export type TourApiErrorKind = "unauthorized" | "rate_limited" | "other";

export class TourApiError extends Error {
  kind: TourApiErrorKind;
  status: number;

  constructor(kind: TourApiErrorKind, status: number) {
    super(`Tour API ${kind} (${status})`);
    this.name = "TourApiError";
    this.kind = kind;
    this.status = status;
  }
}

export function isRateLimitedError(error: unknown): boolean {
  return error instanceof TourApiError && error.kind === "rate_limited";
}

// Lo mínimo que comparten fetch y expo/fetch (/chat usa expo/fetch por el
// streaming): así tourApiFetch sirve con cualquiera de los dos.
export type TourApiInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

type FetchLike<R> = (url: string, init: TourApiInit) => Promise<R>;

// Renueva la sesión una vez; true si quedó una sesión válida.
async function tryRefreshSession(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    return !error && !!data.session;
  } catch {
    return false;
  }
}

// Único punto de salida hacia el servidor (/voice, /transcribe, /chat y
// las que vengan). Agrega la sesión del usuario y, ante un 401, intenta
// renovarla en silencio y reintenta UNA vez; si no se puede, avisa que la
// sesión terminó (notifySessionExpired) y lanza TourApiError
// "unauthorized". 429 -> "rate_limited"; otro error -> "other". Si todo
// sale bien, devuelve la respuesta tal cual.
export async function tourApiFetch<R extends { ok: boolean; status: number } = Response>(
  path: string,
  init: TourApiInit = {},
  fetchImpl: FetchLike<R> = fetch as unknown as FetchLike<R>
): Promise<R> {
  const send = async () =>
    fetchImpl(`${TOUR_API_BASE_URL}${path}`, {
      ...init,
      headers: { ...init.headers, ...(await getTourApiHeaders()) },
    });

  let res = await send();

  if (res.status === 401) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      res = await send();
    }
    if (!refreshed || res.status === 401) {
      notifySessionExpired();
      throw new TourApiError("unauthorized", 401);
    }
  }

  if (res.status === 429) {
    throw new TourApiError("rate_limited", 429);
  }

  if (!res.ok) {
    throw new TourApiError("other", res.status);
  }

  return res;
}
