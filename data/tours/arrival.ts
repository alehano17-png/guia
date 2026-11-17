import type { TourPlaceOutline } from "./outline-types";
import type { TourStep } from "./types";

// "Llegar" a un lugar = estar a ARRIVAL_MARGIN_METERS o menos de su
// contorno (o dentro de él), o a ARRIVAL_MARGIN_METERS o menos de su punto.
// Si el lugar no tiene contorno, solo cuenta el punto (un círculo).
export const ARRIVAL_MARGIN_METERS = 15;

// El lugar al que se acerca la persona: el SIGUIENTE del recorrido.
export type TourArrivalTarget = {
  // Paso al que lleva "Escuchar" al llegar.
  nextStepId: string;
  title: string;
  latitude: number;
  longitude: number;
  outline?: TourPlaceOutline;
};

type TargetInput = {
  steps?: TourStep[];
  step?: TourStep;
  isGuidedStart: boolean;
  startRoute?: TourStep["startRoute"];
  // Tour dentro de un recinto cerrado.
  enclosed?: boolean;
};

// Qué lugar vigila el GPS en este paso, o null si en este paso no se
// pregunta "¿Llegaste?":
// - Inicio guiado: el punto de inicio (startRoute), con el contorno del
//   primer lugar (startRoute.nextStepId) si lo tiene.
// - Tour cerrado (enclosed): solo en el inicio guiado; dentro del recinto el
//   GPS no distingue zonas ni pisos.
// - Paso con decisión (choices), paso final (end), o siguiente paso sin
//   coordenadas, de cierre o noMap: no se pregunta.
// - El resto (incluidos los pasos con actionCard): el siguiente paso.
export function getTourArrivalTarget({
  steps,
  step,
  isGuidedStart,
  startRoute,
  enclosed,
}: TargetInput): TourArrivalTarget | null {
  if (!step || !steps) return null;

  if (isGuidedStart && startRoute) {
    const firstPlace = steps.find((s) => s.id === startRoute.nextStepId);
    return {
      nextStepId: startRoute.nextStepId,
      title: startRoute.destinationTitle,
      latitude: startRoute.latitude,
      longitude: startRoute.longitude,
      outline: firstPlace?.outline,
    };
  }

  if (enclosed) return null;
  if (step.choices?.length || step.end || !step.nextId) return null;

  const next = steps.find((s) => s.id === step.nextId);
  if (
    !next ||
    next.end ||
    next.noMap ||
    next.latitude == null ||
    next.longitude == null
  ) {
    return null;
  }

  return {
    nextStepId: next.id,
    title: next.title,
    latitude: next.latitude,
    longitude: next.longitude,
    outline: next.outline,
  };
}

type Point = { x: number; y: number };

// Metros por grado de latitud (radio medio de la Tierra, el mismo que
// lib/geo.ts).
const METERS_PER_DEGREE_LAT = (Math.PI / 180) * 6371000;

// Punto dentro de un polígono, por cruce de rayos.
function isInsidePolygon(p: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (
      a.y > p.y !== b.y > p.y &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

// Distancia de un punto a un segmento.
function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

// true si la persona llegó al lugar: a ARRIVAL_MARGIN_METERS o menos del
// punto, o dentro del contorno, o a ARRIVAL_MARGIN_METERS o menos de su
// borde. Las distancias se miden en un plano local (metros) alrededor del
// punto del lugar: para lugares de cientos de metros el error es mínimo.
export function isWithinArrival(
  user: { latitude: number; longitude: number },
  target: TourArrivalTarget
): boolean {
  const metersPerDegreeLng =
    METERS_PER_DEGREE_LAT * Math.cos((target.latitude * Math.PI) / 180);
  const toPoint = (latitude: number, longitude: number): Point => ({
    x: (longitude - target.longitude) * metersPerDegreeLng,
    y: (latitude - target.latitude) * METERS_PER_DEGREE_LAT,
  });

  const p = toPoint(user.latitude, user.longitude);
  if (Math.hypot(p.x, p.y) <= ARRIVAL_MARGIN_METERS) return true;

  const ring = target.outline?.outline;
  if (!ring || ring.length < 3) return false;

  const polygon = ring.map(([latitude, longitude]) => toPoint(latitude, longitude));
  if (isInsidePolygon(p, polygon)) return true;

  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    if (distanceToSegment(p, a, b) <= ARRIVAL_MARGIN_METERS) return true;
  }
  return false;
}
