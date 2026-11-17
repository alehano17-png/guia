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

function isLatLngPair(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}

// Valida los contornos al cargarlos (desde un JSON generado, o más adelante
// desde el servidor): solo pasan las entradas con la forma correcta y un
// anillo de al menos 3 puntos. Una entrada inválida se descarta y ese lugar
// usa el círculo alrededor de su punto, en vez de romper la app.
export function parseTourOutlines(raw: unknown): TourOutlines {
  const outlines: TourOutlines = {};
  if (!raw || typeof raw !== "object") return outlines;

  for (const [stepId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const { name, source, outline } = value as Record<string, unknown>;
    if (typeof name !== "string" || typeof source !== "string") continue;
    if (!Array.isArray(outline) || outline.length < 3 || !outline.every(isLatLngPair)) continue;
    outlines[stepId] = { name, source, outline };
  }
  return outlines;
}
