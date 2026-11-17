// Contorno real de un lugar del tour (por ejemplo, el borde de una plaza o
// de un parque), para saber cuándo la persona llegó (data/tours/arrival.ts).
//
// Los contornos viven en data/tours/outlines/<tourId>.json, un archivo por
// tour, y los GENERA una herramienta aparte desde OpenStreetMap: nadie los
// edita a mano. Más adelante podrían venir del servidor con este mismo
// formato. Un paso sin contorno usa solo un círculo alrededor de su punto.
export type TourPlaceOutline = {
  // Nombre del lugar en el mapa (OpenStreetMap).
  name: string;
  // Id del lugar en OpenStreetMap (por ejemplo "way/123456").
  source: string;
  // Anillo exterior del contorno, como pares [latitud, longitud], sin
  // repetir el primer punto al final.
  outline: [number, number][];
};

// Contornos de un tour, por id de paso.
export type TourOutlines = Record<string, TourPlaceOutline>;
