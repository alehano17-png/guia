import { supabase } from "./supabase";

// Dirección del servidor de voz y chat. En desarrollo viene del .env de la
// raíz (EXPO_PUBLIC_TOUR_API_URL, la IP local del backend); en producción
// se configura con la URL https del servidor publicado. Si falta, queda
// vacía: las llamadas fallan y caen en su manejo de error normal, sin
// romper la app.
export const TOUR_API_BASE_URL = process.env.EXPO_PUBLIC_TOUR_API_URL ?? "";

// Headers de autorización para /voice, /transcribe y /chat: el servidor
// exige la sesión real del usuario (su access token de Supabase). Sin
// sesión devuelve un objeto vacío y el servidor responde 401, que cae en el
// mismo manejo de error que cualquier otra falla.
export async function getTourApiHeaders(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}
