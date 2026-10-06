// Mismo polyfill y mismo criterio que lib/i18n/index.ts: un `localStorage`
// global respaldado por SQLite. Reinstalarlo dos veces es inofensivo.
import "expo-sqlite/localStorage/install";

// Por celular, no por cuenta: si otra persona inicia sesión en el mismo
// teléfono, no vuelve a ver el tutorial (siempre lo tiene en "Cómo
// funciona", en la pantalla de inicio).
const STORAGE_KEY = "guia:tutorial-seen";

// Si localStorage falla, se asume que ya lo vio: mejor saltarse el
// tutorial que atrapar a alguien en un bucle que vuelve a mostrarlo cada
// vez que entra a Recomendaciones.
export function hasSeenTutorial(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

export function markTutorialSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Sin persistencia, el peor caso es volver a mostrarlo una vez más —
    // no rompe nada.
  }
}
