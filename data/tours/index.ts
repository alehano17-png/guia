import { mergeTourContent } from "./mergeTourContent";
import type { Tour } from "./types";
import type { TourContent } from "./content-types";
import type { TourSkeleton } from "./skeleton-types";

import { mirafloresSkeleton } from "./skeletons/miraflores";
import { huacaPucllanaSkeleton } from "./skeletons/huaca-pucllana";
import { barrancoSkeleton } from "./skeletons/barranco";
import { centroHistoricoSkeleton } from "./skeletons/centro-historico";

import { mirafloresContentEs } from "./content/es/miraflores";
import { huacaPucllanaContentEs } from "./content/es/huaca-pucllana";
import { barrancoContentEs } from "./content/es/barranco";
import { centroHistoricoContentEs } from "./content/es/centro-historico";

import { mirafloresContentEn } from "./content/en/miraflores";
import { barrancoContentEn } from "./content/en/barranco";
import { centroHistoricoContentEn } from "./content/en/centro-historico";

export type {
  TourStep
} from "./types";

// Independiente del locale de la interfaz (lib/i18n) — usa los mismos
// códigos ("es"/"en") a propósito, pero sin ningún import compartido
// entre los dos sistemas: alguien puede tener el celular en inglés
// mientras el tour sigue solo en español, o viceversa.
export type TourLocale = "es" | "en";

type TourRegistryEntry = {
  skeleton: TourSkeleton;
  // Partial a propósito: un tour puede no tener todavía contenido en
  // un idioma. getTourById cae a "es" cuando falta el idioma pedido.
  content: Partial<Record<TourLocale, TourContent>>;
};

const TOUR_REGISTRY: TourRegistryEntry[] = [
  {
    skeleton: mirafloresSkeleton,
    content: { es: mirafloresContentEs, en: mirafloresContentEn },
  },
  {
    skeleton: huacaPucllanaSkeleton,
    content: { es: huacaPucllanaContentEs },
  },
  {
    skeleton: barrancoSkeleton,
    content: { es: barrancoContentEs, en: barrancoContentEn },
  },
  {
    skeleton: centroHistoricoSkeleton,
    content: { es: centroHistoricoContentEs, en: centroHistoricoContentEn },
  },
];

// Agregar un idioma nuevo a un tour = sumar su clave al "content" de
// ese tour en TOUR_REGISTRY (más el archivo content/xx/tour.ts en
// sí). Nada más cambia. Si el idioma pedido no existe para ese tour
// todavía, cae a "es" en vez de romper — mismo criterio de respaldo
// que ya usa la detección de idioma de lib/i18n.
export function getTourById(id: string, locale: TourLocale = "es"): Tour | undefined {
  const entry = TOUR_REGISTRY.find((e) => e.skeleton.id === id);
  if (!entry) return undefined;

  const content = entry.content[locale] ?? entry.content.es;
  if (!content) return undefined;

  return mergeTourContent(entry.skeleton, content);
}

// Idiomas con contenido real para un tour (las claves de su "content" en
// TOUR_REGISTRY). Para un id inexistente devuelve [].
export function getAvailableTourLocales(id: string): TourLocale[] {
  const entry = TOUR_REGISTRY.find((e) => e.skeleton.id === id);
  if (!entry) return [];

  return (Object.keys(entry.content) as TourLocale[]).filter(
    (locale) => !!entry.content[locale]
  );
}

// Normaliza un valor cualquiera (ej. un parámetro de ruta) a TourLocale:
// solo "en" exacto es inglés; todo lo demás cae a "es".
export function parseTourLocale(value: unknown): TourLocale {
  return value === "en" ? "en" : "es";
}
