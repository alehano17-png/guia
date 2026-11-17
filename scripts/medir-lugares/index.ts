// Herramienta de desarrollo: busca el contorno real de cada lugar de los
// tours en OpenStreetMap y lo guarda en data/tours/outlines/<tourId>.json
// (la app lo usa para saber cuándo la persona llegó: data/tours/arrival.ts).
// No cambia el código de la app: solo escribe esos JSON.
//
//   npm run medir-lugares                    mide solo los pasos sin contorno
//   npm run medir-lugares -- --reemplazar    recalcula todos
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
  distanceToRing,
  lengthAndWidth,
  makeProjection,
  ringArea,
  simplifyRing,
  type XY,
} from "./geometry";
import { readAreasNear, type OsmArea } from "./osm";

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

type Status = "ok" | "revisar" | "sin contorno" | "lugar largo" | "muy grande";

type Row = {
  stepId: string;
  name: string;
  size: string;
  points: string;
  status: Status | "ya tenía contorno";
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

// Nombre parecido al título del paso (sin tildes ni mayúsculas, coincidencia
// parcial): uno contiene al otro, o comparten una palabra que distingue.
function nameMatchesTitle(name: string, title: string): boolean {
  const n = normalize(name);
  const t = normalize(title);
  if (!n || !t) return false;
  if (n.includes(t) || (n.length >= 5 && t.includes(n))) return true;
  const words = new Set(significantWords(n));
  return significantWords(t).some((w) => words.has(w));
}

function areaName(area: OsmArea): string {
  return area.tags.name ?? area.tags["name:es"] ?? "(sin nombre)";
}

// Todos los nombres del lugar en el mapa: el principal y los alternativos
// (por ejemplo, el Parque del Amor se llama oficialmente "Parque Alberto
// Andrade Carmona" y tiene "Parque del Amor" como alt_name y old_name).
const NAME_KEYS = ["name", "name:es", "alt_name", "old_name", "official_name", "short_name", "loc_name"];

function areaNames(area: OsmArea): string[] {
  return NAME_KEYS.flatMap((key) => area.tags[key]?.split(";") ?? [])
    .map((name) => name.trim())
    .filter(Boolean);
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
): { row: Omit<Row, "stepId">; outline: TourPlaceOutline | null } {
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

  // a) Nombre parecido al título, con el punto dentro o a menos de 30 m.
  const byName = candidates
    .filter(
      (c) =>
        c.distance <= NAME_MATCH_MAX_DISTANCE_METERS &&
        areaNames(c.area).some((name) => nameMatchesTitle(name, title))
    )
    .sort(bySmallest);
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
  console.log("| Paso | Contorno en el mapa | Largo x ancho (m) | Puntos | Marca |");
  console.log("|---|---|---|---|---|");
  for (const r of rows) {
    console.log(`| ${r.stepId} | ${r.name} | ${r.size} | ${r.points} | ${r.status} |`);
  }
}

async function main() {
  const replaceAll = process.argv.includes("--reemplazar");
  const started = Date.now();
  const tours = await loadTours();

  // Pasos a medir: con coordenadas, y sin contorno guardado (salvo
  // --reemplazar).
  const toMeasure = tours.flatMap((tour) =>
    tour.skeleton.steps
      .filter((s) => s.latitude != null && s.longitude != null)
      .filter((s) => replaceAll || !tour.existing[s.id])
      .map((s) => ({ lat: s.latitude!, lng: s.longitude! }))
  );

  let areas: OsmArea[] = [];
  if (toMeasure.length) {
    await ensurePeruFile();
    const read = await readAreasNear(PBF_PATH, toMeasure);
    areas = read.areas;
    console.log(
      `Archivo de Perú leído en ${read.seconds.toFixed(1)} s: ${areas.length} contornos visitables cerca de ${toMeasure.length} puntos.`
    );
  } else {
    console.log("No hay pasos sin contorno: nada que medir (usa --reemplazar para recalcular).");
  }

  for (const tour of tours) {
    const next: TourOutlines = replaceAll ? {} : { ...tour.existing };
    const rows: Row[] = [];

    for (const step of tour.skeleton.steps) {
      if (step.latitude == null || step.longitude == null) continue;
      if (!replaceAll && tour.existing[step.id]) {
        const saved = tour.existing[step.id];
        rows.push({ stepId: step.id, name: saved.name, size: "-", points: String(saved.outline.length), status: "ya tenía contorno" });
        continue;
      }
      const title = tour.titles.get(step.id) ?? step.id;
      const { row, outline } = measureStep(step.latitude, step.longitude, title, areas);
      rows.push({ stepId: step.id, ...row });
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
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
