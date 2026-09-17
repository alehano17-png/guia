// Mismo polyfill que ya usa lib/supabase.ts para persistir la sesión de
// Supabase (expo-sqlite/localStorage/install instala un `localStorage`
// global respaldado por SQLite). Se reimporta acá para que este módulo no
// dependa en silencio de que algún otro archivo lo haya importado antes —
// reinstalar el mismo global dos veces es inofensivo.
import "expo-sqlite/localStorage/install";
import * as Localization from "expo-localization";
import { es } from "./es";
import { en } from "./en";

export type { TranslationDictionary } from "./es";

// Agregar un idioma nuevo = un archivo lib/i18n/xx.ts (tipado contra
// TranslationDictionary) + una línea acá. Nada más se reestructura.
export const translations = { es, en };

export type Locale = keyof typeof translations;

const STORAGE_KEY = "guia:locale";

function isSupportedLocale(value: string | null | undefined): value is Locale {
  return !!value && value in translations;
}

// Idioma del celular en el primer uso. Si no coincide con ninguno de los
// idiomas soportados (ej. el celular está en francés y todavía no existe
// fr.ts), cae a "es" — nunca a un idioma que no tiene diccionario.
function detectDeviceLocale(): Locale {
  const languageCode = Localization.getLocales()[0]?.languageCode;
  return isSupportedLocale(languageCode) ? languageCode : "es";
}

function readPersistedLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isSupportedLocale(stored) ? stored : null;
  } catch {
    // localStorage puede fallar en algún entorno raro — sin persistencia,
    // simplemente se vuelve a detectar el idioma del celular cada vez, no
    // rompe la app.
    return null;
  }
}

// La elección manual del usuario (si existe) siempre gana sobre la
// detección automática del celular — se resuelve una sola vez, al cargar
// el módulo.
let currentLocale: Locale = readPersistedLocale() ?? detectDeviceLocale();

const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return currentLocale;
}

// Cambia el idioma de la interfaz y lo persiste — a partir de acá gana
// siempre sobre el idioma del celular, incluso si la persona cambia el
// idioma de su teléfono más adelante.
export function setLocale(locale: Locale): void {
  if (locale === currentLocale) return;

  currentLocale = locale;

  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Igual que en readPersistedLocale: si falla, el cambio sigue
    // funcionando en esta sesión, solo no sobrevive a reabrir la app.
  }

  listeners.forEach((listener) => listener());
}

// Usado por useTranslation() (useSyncExternalStore) para re-renderizar
// cualquier componente que lea el idioma cuando setLocale() lo cambia.
export function subscribeToLocaleChanges(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
