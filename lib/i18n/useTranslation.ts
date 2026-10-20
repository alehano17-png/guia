import {
  createContext,
  createElement,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getLocale,
  setLocale,
  subscribeToLocaleChanges,
  translations,
  type Locale,
} from "./index";

// useSyncExternalStore (no Context/Provider): el idioma actual vive en un
// store externo simple (lib/i18n/index.ts), no en el árbol de React — así
// no hace falta envolver la app en un <LocaleProvider> todavía para que
// esto funcione. Cualquier componente que llame a este hook se
// re-renderiza solo cuando setLocale() cambia el idioma.
//
// Acceso a los textos por objeto tipado (t.auth.login.title), no por
// string ("auth.login.title") — un typo en una ruta de objeto es un error
// de compilación con autocompletado; un typo en un string-key sería un bug
// silencioso que recién se nota en pantalla.
// Idioma forzado para un subárbol (ej. la pantalla del tour, que va en el
// idioma elegido para el tour y no en el del celular). null = sin forzar:
// se usa el idioma global de la app.
const LocaleOverrideContext = createContext<Locale | null>(null);

export function LocaleOverride({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return createElement(LocaleOverrideContext.Provider, { value: locale }, children);
}

export function useTranslation() {
  const globalLocale = useSyncExternalStore(subscribeToLocaleChanges, getLocale);
  const overrideLocale = useContext(LocaleOverrideContext);
  const locale = overrideLocale ?? globalLocale;

  return {
    t: translations[locale],
    locale,
    setLocale,
  };
}

export type { Locale };
