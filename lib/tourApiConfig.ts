export const TOUR_API_BASE_URL = "http://192.168.18.5:3000";

// Llave compartida que autoriza a esta app (y solo a esta app) a usar el
// backend — el mismo valor vive en el .env de la raíz
// (EXPO_PUBLIC_GUIA_BACKEND_KEY) y en el backend/.env (BACKEND_SECRET_KEY).
// Centralizados acá para que las llamadas a /voice, /transcribe y /chat no
// repitan el nombre del header a mano y se desincronicen entre sí.
export const TOUR_API_KEY_HEADER = "x-guia-key";
export const TOUR_API_KEY = process.env.EXPO_PUBLIC_GUIA_BACKEND_KEY ?? "";
