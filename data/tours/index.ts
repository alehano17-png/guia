import { huacaPucllana } from "./huaca-pucllana";
import { mirafloresCompleto } from "./miraflores";
import type { Tour } from "./types";

export type {
  TourStep
} from "./types";

const TOURS: Tour[] = [
  mirafloresCompleto,
  huacaPucllana,
];

export function getTourById(id: string): Tour | undefined {
  return TOURS.find((tour) => tour.id === id);
}