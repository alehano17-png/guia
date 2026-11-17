// Geometría plana para medir lugares de pocos cientos de metros: todo se
// proyecta a metros en un plano local alrededor del punto del paso (el
// error es mínimo a esta escala).

export type XY = { x: number; y: number };

// Metros por grado de latitud (radio medio de la Tierra, el mismo que la app
// usa en lib/geo.ts y data/tours/arrival.ts).
const METERS_PER_DEGREE_LAT = (Math.PI / 180) * 6371000;

export function makeProjection(originLat: number, originLng: number) {
  const metersPerDegreeLng =
    METERS_PER_DEGREE_LAT * Math.cos((originLat * Math.PI) / 180);
  return (lat: number, lng: number): XY => ({
    x: (lng - originLng) * metersPerDegreeLng,
    y: (lat - originLat) * METERS_PER_DEGREE_LAT,
  });
}

// Punto dentro de un anillo (cruce de rayos).
export function isInsideRing(p: XY, ring: XY[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

function distanceToSegment(p: XY, a: XY, b: XY): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

// Distancia del punto al anillo: 0 si está adentro; si no, al borde más
// cercano.
export function distanceToRing(p: XY, ring: XY[]): number {
  if (isInsideRing(p, ring)) return 0;
  let best = Infinity;
  for (let i = 0; i < ring.length; i++) {
    best = Math.min(best, distanceToSegment(p, ring[i], ring[(i + 1) % ring.length]));
  }
  return best;
}

export function ringArea(ring: XY[]): number {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

function convexHull(points: XY[]): XY[] {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (sorted.length < 3) return sorted;
  const cross = (o: XY, a: XY, b: XY) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: XY[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: XY[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

// Largo y ancho del lugar: los lados del rectángulo más chico (en área) que
// lo contiene, girado según cada lado de su envolvente convexa.
export function lengthAndWidth(ring: XY[]): { length: number; width: number } {
  const hull = convexHull(ring);
  let best = { area: Infinity, length: 0, width: 0 };
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of hull) {
      const x = p.x * cos - p.y * sin;
      const y = p.x * sin + p.y * cos;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    const w = maxX - minX;
    const h = maxY - minY;
    if (w * h < best.area) {
      best = { area: w * h, length: Math.max(w, h), width: Math.min(w, h) };
    }
  }
  return { length: best.length, width: best.width };
}

// Douglas-Peucker sobre un tramo abierto: índices que se conservan.
function simplifyPath(points: XY[], first: number, last: number, tolerance: number, keep: Set<number>) {
  let maxDistance = 0;
  let index = -1;
  for (let i = first + 1; i < last; i++) {
    const d = distanceToSegment(points[i], points[first], points[last]);
    if (d > maxDistance) {
      maxDistance = d;
      index = i;
    }
  }
  if (index !== -1 && maxDistance > tolerance) {
    keep.add(index);
    simplifyPath(points, first, index, tolerance, keep);
    simplifyPath(points, index, last, tolerance, keep);
  }
}

// Simplifica un anillo cerrado (sin repetir el primer punto): devuelve los
// índices de los vértices que se conservan, en orden.
function simplifyRingIndices(ring: XY[], tolerance: number): number[] {
  if (ring.length <= 4) return ring.map((_, i) => i);
  // Se corta el anillo en el vértice 0 y en el más lejano a él.
  let far = 0;
  let farDistance = -1;
  for (let i = 1; i < ring.length; i++) {
    const d = Math.hypot(ring[i].x - ring[0].x, ring[i].y - ring[0].y);
    if (d > farDistance) {
      farDistance = d;
      far = i;
    }
  }
  const closed = [...ring, ring[0]];
  const keep = new Set<number>([0, far]);
  simplifyPath(closed, 0, far, tolerance, keep);
  simplifyPath(closed, far, ring.length, tolerance, keep);
  keep.delete(ring.length);
  return [...keep].sort((a, b) => a - b);
}

// Simplifica con ~1 m de tolerancia (para que no se deforme) y, si todavía
// quedan más de maxPoints, sube la tolerancia de a poco hasta entrar.
export function simplifyRing(
  ring: XY[],
  maxPoints: number,
  startTolerance: number
): { indices: number[]; tolerance: number } {
  let tolerance = startTolerance;
  let indices = simplifyRingIndices(ring, tolerance);
  while (indices.length > maxPoints) {
    tolerance *= 1.25;
    indices = simplifyRingIndices(ring, tolerance);
  }
  return { indices, tolerance };
}
