export type PathPoint = { x: number; y: number };

// Posición exacta sobre una polilínea (segmentos rectos) en un progress
// dado (0 a 1): ubica en qué tramo cae según `breakpoints` (el progress
// acumulado en cada vértice, proporcional al largo REAL de cada tramo —
// no tramos iguales) e interpola linealmente entre sus dos extremos. No
// es una aproximación — mismo enfoque que getPointOnWavePath en
// WaveTravelerAnimation, adaptado a segmentos rectos de largo desigual en
// vez de curvas de Bézier.
//
// Compartida entre StepPathAnimation y ZigzagPathAnimation (y cualquier
// otra animación de "punto viajero sobre segmentos rectos" que se agregue
// a la biblioteca) — los puntos y breakpoints de cada diseño quedan
// locales a su propio archivo, esto es solo el algoritmo genérico.
export function getPointOnPolyline(
  progress: number,
  points: PathPoint[],
  breakpoints: number[]
): PathPoint {
  "worklet";
  let segment = breakpoints.length - 2;
  for (let i = 0; i < breakpoints.length - 1; i++) {
    if (progress <= breakpoints[i + 1]) {
      segment = i;
      break;
    }
  }

  const segStart = breakpoints[segment];
  const segEnd = breakpoints[segment + 1];
  const localT =
    segEnd > segStart ? (progress - segStart) / (segEnd - segStart) : 0;

  const p0 = points[segment];
  const p1 = points[segment + 1];

  return {
    x: p0.x + (p1.x - p0.x) * localT,
    y: p0.y + (p1.y - p0.y) * localT,
  };
}
