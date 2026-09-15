import { mergeTourContent } from "./mergeTourContent";
import type { Tour } from "./types";

import { mirafloresSkeleton } from "./skeletons/miraflores";
import { huacaPucllanaSkeleton } from "./skeletons/huaca-pucllana";
import { barrancoSkeleton } from "./skeletons/barranco";
import { centroHistoricoSkeleton } from "./skeletons/centro-historico";

import { mirafloresContentEs } from "./content/es/miraflores";
import { huacaPucllanaContentEs } from "./content/es/huaca-pucllana";
import { barrancoContentEs } from "./content/es/barranco";
import { centroHistoricoContentEs } from "./content/es/centro-historico";

export type {
  TourStep
} from "./types";

const TOURS: Tour[] = [
  mergeTourContent(mirafloresSkeleton, mirafloresContentEs),
  mergeTourContent(huacaPucllanaSkeleton, huacaPucllanaContentEs),
  mergeTourContent(barrancoSkeleton, barrancoContentEs),
  mergeTourContent(centroHistoricoSkeleton, centroHistoricoContentEs),
];

// El parámetro locale queda listo para cuando haya más de un idioma
// disponible — hoy solo existe contenido "es", así que se ignora a
// propósito y no cambia el comportamiento de ningún llamado actual
// (getTourById(tourId), con un solo argumento, en app/tour.tsx).
export function getTourById(id: string, locale: "es" = "es"): Tour | undefined {
  void locale;
  return TOURS.find((tour) => tour.id === id);
}
