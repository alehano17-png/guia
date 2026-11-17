// Herramienta de desarrollo: busca el contorno real de cada lugar de los
// tours en OpenStreetMap y lo guarda en data/tours/outlines/<tourId>.json
// (la app lo usa para saber cuándo la persona llegó: data/tours/arrival.ts).
// No cambia el código de la app: solo escribe esos JSON.
//
//   npm run medir-lugares                    mide solo los pasos sin contorno
//   npm run medir-lugares -- --reemplazar    recalcula todos
//
// Además revisa TODOS los pasos (también los que ya tenían contorno) por si
// su punto quedó corrido: busca a menos de 1 km cualquier elemento del mapa
// con un nombre parecido al título del paso y, si el más cercano está a más
// de 50 m del punto, lo marca "punto corrido?" en la tabla. Solo informa: no
// edita ningún archivo .ts.
//
// Datos: © colaboradores de OpenStreetMap, licencia ODbL
// (https://www.openstreetmap.org/copyright), del archivo de Perú de
// Geofabrik. Antes de publicar, la app debe mostrar esta atribución en sus
// créditos. No se usa el servidor público de Overpass: su política pide
// servidor propio o de pago para proyectos comerciales.

import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { pathToFileURL } from "node:url";
import type { TourContent } from "../../data/tours/content-types";
import type { TourOutlines, TourPlaceOutline } from "../../data/tours/outline-types";
import type { TourSkeleton } from "../../data/tours/skeleton-types";
import {
  distanceToLine,
  distanceToRing,
  lengthAndWidth,
  makeProjection,
  ringArea,
  simplifyRing,
  type XY,
} from "./geometry";
import { NAME_KEYS, readAreasNear, type NamedFeature, type OsmArea, type Tags } from "./osm";

const ROOT = process.cwd();
const SKELETONS_DIR = path.join(ROOT, "data/tours/skeletons");
const CONTENT_ES_DIR = path.join(ROOT, "data/tours/content/es");
const OUTLINES_DIR = path.join(ROOT, "data/tours/outlines");
const PBF_URL = "https://download.geofabrik.de/south-america/peru-latest.osm.pbf";
const PBF_PATH = path.join(ROOT, ".cache/osm/peru-latest.osm.pbf");

// Reglas de selección.
const SEARCH_RADIUS_METERS = 150; // contornos a considerar alrededor del punto
const NAME_MATCH_MAX_DISTANCE_METERS = 30; // coincidencia por nombre: dentro o a menos de esto
const MAX_SIDE_METERS = 300; // "muy grande"
const MAX_ELONGATION = 3; // "lugar largo": largo > 3 veces el ancho
const MAX_POINTS = 40;
const SIMPLIFY_TOLERANCE_METERS = 1;

// Revisión de puntos corridos.
const POINT_CHECK_RADIUS_METERS = 1000; // dónde buscar un nombre parecido
const POINT_CHECK_MAX_OFFSET_METERS = 50; // más lejos que esto: "punto corrido?"

type Status = "ok" | "revisar" | "sin contorno" | "lugar largo" | "muy grande";

type Row = {
  stepId: string;
  name: string;
  size: string;
  points: string;
  status: Status | "ya tenía contorno";
  pointCheck: string;
};

// Palabras que no sirven para reconocer un lugar por su nombre (son de
// muchos lugares a la vez).
const GENERIC_WORDS = new Set([
  "parque", "plaza", "calle", "calles", "casa", "iglesia", "puente", "pasaje",
  "jiron", "avenida", "museo", "centro", "historico", "mirador", "convento",
  "catedral", "basilica", "malecon", "lima", "miraflores", "barranco", "rimac",
  "del", "las", "los", "con", "para", "santa", "santo", "san",
]);

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function significantWords(text: string): string[] {
  return text.split(" ").filter((w) => w.length >= 4 && !GENERIC_WORDS.has(w));
}

// Qué tan parecido es un nombre al título del paso (sin tildes ni
// mayúsculas): 2 si uno contiene al otro; 1 si solo comparten una palabra
// que distingue; 0 si nada. El 2 gana al 1: con el punto en el centro de la
// Plaza San Martín, "Plaza San Martín" debe ganarle al monumento "General
// José de San Martín", que es más chico y también contiene el punto.
function nameMatchScore(name: string, title: string): number {
  const n = normalize(name);
  const t = normalize(title);
  if (!n || !t) return 0;
  if (n.includes(t) || (n.length >= 5 && t.includes(n))) return 2;
  const words = new Set(significantWords(n));
  return significantWords(t).some((w) => words.has(w)) ? 1 : 0;
}

function areaName(area: OsmArea): string {
  return area.tags.name ?? area.tags["name:es"] ?? "(sin nombre)";
}

// Todos los nombres del lugar en el mapa: el principal y los alternativos
// (ver NAME_KEYS en osm.ts).
function namesOf(tags: Tags): string[] {
  return NAME_KEYS.flatMap((key) => tags[key]?.split(";") ?? [])
    .map((name) => name.trim())
    .filter(Boolean);
}

// Palabras que no cuentan al comparar un nombre con el título.
const CONNECTOR_WORDS = new Set(["a", "al", "con", "de", "del", "e", "el", "en", "la", "las", "los", "y"]);

// Para la revisión de puntos corridos el nombre debe tener TODAS las palabras
// del título (sin contar "de", "la", "los"...). Es más estricto que
// nameMatchScore porque busca a 1 km, donde hay muchos lugares que
// comparten una sola palabra con el título (por ejemplo, una tienda "San
// Martín" más cerca del punto que la Plaza San Martín).
function nameHasAllTitleWords(name: string, titleWords: string[]): boolean {
  const words = new Set(normalize(name).split(" "));
  return titleWords.every((w) => words.has(w));
}

// "punto corrido? (X m) Nombre, id" si el elemento con nombre parecido más
// cercano (a menos de 1 km) está a más de 50 m del punto; "-" si no.
function checkPoint(latitude: number, longitude: number, title: string, named: NamedFeature[]): string {
  const normalizedTitle = normalize(title);
  // Un título sin ninguna palabra que distinga un lugar (por ejemplo, el
  // nombre del barrio en el paso de inicio, o solo "Mirador") no se busca.
  if (!significantWords(normalizedTitle).length) return "-";
  const titleWords = normalizedTitle.split(" ").filter((w) => !CONNECTOR_WORDS.has(w));

  const project = makeProjection(latitude, longitude);
  const origin: XY = { x: 0, y: 0 };
  const toXY = (coords: [number, number][]) => coords.map(([lat, lng]) => project(lat, lng));

  let best: { distance: number; name: string; source: string } | null = null;
  for (const feature of named) {
    const name = namesOf(feature.tags).find((n) => nameHasAllTitleWords(n, titleWords));
    if (!name) continue;
    let distance = Infinity;
    for (const ring of feature.rings) distance = Math.min(distance, distanceToRing(origin, toXY(ring)));
    for (const line of feature.lines) distance = Math.min(distance, distanceToLine(origin, toXY(line)));
    if (distance <= POINT_CHECK_RADIUS_METERS && (!best || distance < best.distance)) {
      best = { distance, name, source: feature.source };
    }
  }

  if (!best || best.distance <= POINT_CHECK_MAX_OFFSET_METERS) return "-";
  return `punto corrido? (${Math.round(best.distance)} m) ${best.name}, ${best.source}`;
}

type Candidate = {
  area: OsmArea;
  ringIndex: number;
  ringXY: XY[];
  distance: number;
  areaM2: number;
};

function measureStep(
  latitude: number,
  longitude: number,
  title: string,
  areas: OsmArea[]
): { row: Omit<Row, "stepId" | "pointCheck">; outline: TourPlaceOutline | null } {
  const project = makeProjection(latitude, longitude);
  const origin: XY = { x: 0, y: 0 };

  const candidates: Candidate[] = [];
  for (const area of areas) {
    let best: Candidate | null = null;
    area.outerRings.forEach((ring, ringIndex) => {
      const ringXY = ring.map(([lat, lng]) => project(lat, lng));
      const distance = distanceToRing(origin, ringXY);
      if (!best || distance < best.distance) {
        best = { area, ringIndex, ringXY, distance, areaM2: ringArea(ringXY) };
      }
    });
    if (best && (best as Candidate).distance <= SEARCH_RADIUS_METERS) candidates.push(best);
  }

  const bySmallest = (a: Candidate, b: Candidate) =>
    (a.distance > 0 ? 1 : 0) - (b.distance > 0 ? 1 : 0) || a.areaM2 - b.areaM2;

  // a) Nombre parecido al título, con el punto dentro o a menos de 30 m. Gana
  // el nombre más parecido; entre iguales, el que contiene el punto y luego
  // el más chico.
  const byName = candidates
    .filter((c) => c.distance <= NAME_MATCH_MAX_DISTANCE_METERS)
    .map((c) => ({ c, score: Math.max(0, ...namesOf(c.area.tags).map((name) => nameMatchScore(name, title))) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || bySmallest(a.c, b.c))
    .map(({ c }) => c);
  // b) Si no, el más chico que contenga el punto (para revisar a mano).
  const containing = candidates.filter((c) => c.distance === 0).sort(bySmallest);

  const chosen = byName[0] ?? containing[0];
  if (!chosen) {
    return { row: { name: "-", size: "-", points: "0", status: "sin contorno" }, outline: null };
  }

  const name = areaName(chosen.area);
  const { length, width } = lengthAndWidth(chosen.ringXY);
  const size = `${Math.round(length)} x ${Math.round(width)}`;

  if (length > MAX_SIDE_METERS) {
    return { row: { name, size, points: "0", status: "muy grande" }, outline: null };
  }
  if (length > MAX_ELONGATION * width) {
    return { row: { name, size, points: "0", status: "lugar largo" }, outline: null };
  }

  const ring = chosen.area.outerRings[chosen.ringIndex];
  const { indices } = simplifyRing(chosen.ringXY, MAX_POINTS, SIMPLIFY_TOLERANCE_METERS);
  const round = (v: number) => Math.round(v * 1e7) / 1e7;
  const outline: TourPlaceOutline = {
    name,
    source: chosen.area.source,
    outline: indices.map((i) => [round(ring[i][0]), round(ring[i][1])]),
  };

  return {
    row: { name, size, points: String(outline.outline.length), status: byName[0] ? "ok" : "revisar" },
    outline,
  };
}

// Primer export del módulo que tenga la forma pedida.
function findExport<T>(mod: Record<string, unknown>, isMatch: (value: unknown) => boolean): T | null {
  for (const value of Object.values(mod)) if (isMatch(value)) return value as T;
  return null;
}

type TourToMeasure = {
  skeleton: TourSkeleton;
  titles: Map<string, string>;
  existing: TourOutlines;
};

async function loadTours(): Promise<TourToMeasure[]> {
  const tours: TourToMeasure[] = [];
  for (const file of readdirSync(SKELETONS_DIR).filter((f) => f.endsWith(".ts")).sort()) {
    const skeletonModule = (await import(pathToFileURL(path.join(SKELETONS_DIR, file)).href)) as Record<string, unknown>;
    const skeleton = findExport<TourSkeleton>(
      skeletonModule,
      (v) => !!v && typeof v === "object" && "id" in v && "steps" in v
    );
    if (!skeleton) continue;

    const titles = new Map<string, string>();
    const contentPath = path.join(CONTENT_ES_DIR, file);
    if (existsSync(contentPath)) {
      const contentModule = (await import(pathToFileURL(contentPath).href)) as Record<string, unknown>;
      const content = findExport<TourContent>(
        contentModule,
        (v) => !!v && typeof v === "object" && "title" in v && "steps" in v
      );
      content?.steps.forEach((s) => titles.set(s.id, s.title));
    }

    const outlinesPath = path.join(OUTLINES_DIR, `${skeleton.id}.json`);
    const existing = existsSync(outlinesPath)
      ? (JSON.parse(readFileSync(outlinesPath, "utf8")) as TourOutlines)
      : {};
    tours.push({ skeleton, titles, existing });
  }
  return tours;
}

async function ensurePeruFile() {
  if (existsSync(PBF_PATH)) return;
  console.log(`No está el archivo de Perú. Bajándolo de ${PBF_URL} ...`);
  const started = Date.now();
  const res = await fetch(PBF_URL);
  if (!res.ok || !res.body) throw new Error(`No se pudo bajar el archivo (HTTP ${res.status})`);
  mkdirSync(path.dirname(PBF_PATH), { recursive: true });
  const partial = `${PBF_PATH}.parcial`;
  await pipeline(
    Readable.fromWeb(res.body as unknown as NodeReadableStream<Uint8Array>),
    createWriteStream(partial)
  );
  renameSync(partial, PBF_PATH);
  console.log(`Listo en ${Math.round((Date.now() - started) / 1000)} s.`);
}

// JSON legible: un par [lat, lng] por línea.
function formatOutlines(outlines: TourOutlines): string {
  return (
    JSON.stringify(outlines, null, 2).replace(
      /\[\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*\]/g,
      "[$1, $2]"
    ) + "\n"
  );
}

function printTable(tourId: string, rows: Row[]) {
  console.log(`\n${tourId}`);
  console.log("| Paso | Contorno en el mapa | Largo x ancho (m) | Puntos | Marca | Revisión del punto |");
  console.log("|---|---|---|---|---|---|");
  for (const r of rows) {
    console.log(`| ${r.stepId} | ${r.name} | ${r.size} | ${r.points} | ${r.status} | ${r.pointCheck} |`);
  }
}

async function main() {
  const replaceAll = process.argv.includes("--reemplazar");
  const started = Date.now();
  const tours = await loadTours();

  // Todos los pasos con coordenadas se revisan (punto corrido); se miden
  // solo los que no tienen contorno guardado (salvo --reemplazar).
  const steps = tours.flatMap((tour) =>
    tour.skeleton.steps.filter((s) => s.latitude != null && s.longitude != null).map((s) => ({ tour, s }))
  );
  const toMeasure = steps.filter(({ tour, s }) => replaceAll || !tour.existing[s.id]).length;
  if (!steps.length) {
    console.log("No hay pasos con coordenadas: nada que revisar.");
    return;
  }

  await ensurePeruFile();
  const read = await readAreasNear(
    PBF_PATH,
    steps.map(({ s }) => ({ lat: s.latitude!, lng: s.longitude! }))
  );
  const { areas, named } = read;
  console.log(
    `Archivo de Perú leído en ${read.seconds.toFixed(1)} s: ${areas.length} contornos visitables y ${named.length} elementos con nombre cerca de ${steps.length} puntos (${toMeasure} por medir).`
  );

  for (const tour of tours) {
    const next: TourOutlines = replaceAll ? {} : { ...tour.existing };
    const rows: Row[] = [];

    for (const step of tour.skeleton.steps) {
      if (step.latitude == null || step.longitude == null) continue;
      const title = tour.titles.get(step.id) ?? step.id;
      const pointCheck = checkPoint(step.latitude, step.longitude, title, named);
      if (!replaceAll && tour.existing[step.id]) {
        const saved = tour.existing[step.id];
        rows.push({ stepId: step.id, name: saved.name, size: "-", points: String(saved.outline.length), status: "ya tenía contorno", pointCheck });
        continue;
      }
      const { row, outline } = measureStep(step.latitude, step.longitude, title, areas);
      rows.push({ stepId: step.id, ...row, pointCheck });
      if (outline) next[step.id] = outline;
      else delete next[step.id];
    }

    // Mismo orden que los pasos del tour.
    const ordered: TourOutlines = {};
    for (const step of tour.skeleton.steps) if (next[step.id]) ordered[step.id] = next[step.id];
    for (const [id, value] of Object.entries(next)) if (!ordered[id]) ordered[id] = value;

    writeFileSync(path.join(OUTLINES_DIR, `${tour.skeleton.id}.json`), formatOutlines(ordered), "utf8");
    printTable(tour.skeleton.id, rows);
  }

  console.log(`\nTotal: ${((Date.now() - started) / 1000).toFixed(1)} s.`);
  console.log("Revisa a mano solo los marcados \"revisar\" (y, si quieres, los demás que no son \"ok\").");
  console.log("Si un paso dice \"punto corrido?\", revisa sus coordenadas en el esqueleto (esta herramienta no lo corrige).");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
