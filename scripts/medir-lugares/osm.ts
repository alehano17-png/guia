// Lectura del archivo de OpenStreetMap (.osm.pbf) de Geofabrik.
//
// Datos: © colaboradores de OpenStreetMap, licencia ODbL
// (https://www.openstreetmap.org/copyright). Antes de publicar, la app debe
// mostrar esta atribución en sus créditos.
//
// Se lee en UNA sola pasada y por partes (sin cargar el archivo entero en
// memoria). En un .osm.pbf vienen primero todos los nodos, después las vías
// y al final las relaciones, así que alcanza con guardar solo lo que queda
// cerca de los puntos de los tours:
// 1) nodos a menos de KEEP_RADIUS_METERS de algún punto;
// 2) vías que tocan esos nodos;
// 3) relaciones multipolígono armadas con esas vías.

import { createReadStream } from "node:fs";
import { readOsmPbf } from "@osmix/pbf";

// Cubre de sobra cualquier lugar que pueda servir (a menos de 150 m del
// punto y de hasta 300 m de lado). Un contorno con nodos más lejos que esto
// queda incompleto y se descarta: sería "muy grande" de todos modos.
const KEEP_RADIUS_METERS = 1500;
const METERS_PER_DEGREE_LAT = (Math.PI / 180) * 6371000;

export type Tags = Record<string, string>;

// Un contorno cerrado de OpenStreetMap (vía cerrada o multipolígono), con
// sus anillos exteriores como [lat, lng].
export type OsmArea = {
  // "way/123" o "relation/456".
  source: string;
  tags: Tags;
  outerRings: [number, number][][];
};

// Solo lugares visitables: plazas, parques y jardines, edificios, iglesias,
// centros comerciales, museos, atracciones, monumentos históricos, faros,
// puentes y miradores. Nunca límites (boundary), barrios u otros "place"
// que no sean plazas, ni zonas de uso del suelo (landuse) por sí solas.
export function isVisitable(tags: Tags): boolean {
  if (tags.boundary || tags.admin_level) return false;
  if (tags.place && tags.place !== "square") return false;
  return (
    (!!tags.building && tags.building !== "no") ||
    tags.place === "square" ||
    tags.leisure === "park" ||
    tags.leisure === "garden" ||
    (tags.highway === "pedestrian" && tags.area === "yes") ||
    tags.amenity === "place_of_worship" ||
    tags.shop === "mall" ||
    tags.tourism === "museum" ||
    tags.tourism === "attraction" ||
    tags.tourism === "viewpoint" ||
    (!!tags.historic && tags.historic !== "district") ||
    tags.man_made === "lighthouse" ||
    tags.man_made === "bridge"
  );
}

type Point = { lat: number; lng: number };

const decoder = new TextDecoder("utf-8");

function tagsFrom(keys: number[], vals: number[], strings: string[]): Tags {
  const tags: Tags = {};
  for (let i = 0; i < keys.length; i++) tags[strings[keys[i]]] = strings[vals[i]];
  return tags;
}

// Une las vías exteriores de un multipolígono en anillos cerrados (pueden
// venir partidas en tramos y en cualquier sentido). null si no cierra.
function joinRings(parts: number[][]): number[][] | null {
  const pending = parts.map((p) => [...p]);
  const rings: number[][] = [];
  while (pending.length) {
    let ring = pending.shift()!;
    let guard = 0;
    while (ring[0] !== ring[ring.length - 1]) {
      const end = ring[ring.length - 1];
      const index = pending.findIndex((p) => p[0] === end || p[p.length - 1] === end);
      if (index === -1 || ++guard > 10000) return null;
      const next = pending.splice(index, 1)[0];
      ring = ring.concat((next[0] === end ? next : next.reverse()).slice(1));
    }
    rings.push(ring);
  }
  return rings;
}

export async function readAreasNear(
  pbfPath: string,
  points: Point[]
): Promise<{ areas: OsmArea[]; seconds: number }> {
  const started = Date.now();

  // Filtro rápido por recuadro y luego por distancia a cada punto.
  const pad = KEEP_RADIUS_METERS / METERS_PER_DEGREE_LAT;
  const minLat = Math.min(...points.map((p) => p.lat)) - pad;
  const maxLat = Math.max(...points.map((p) => p.lat)) + pad;
  const padLng = pad / Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const minLng = Math.min(...points.map((p) => p.lng)) - padLng;
  const maxLng = Math.max(...points.map((p) => p.lng)) + padLng;
  const isNearAnyPoint = (lat: number, lng: number) => {
    if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) return false;
    return points.some((p) => {
      const dy = (lat - p.lat) * METERS_PER_DEGREE_LAT;
      const dx = (lng - p.lng) * METERS_PER_DEGREE_LAT * Math.cos((p.lat * Math.PI) / 180);
      return dx * dx + dy * dy <= KEEP_RADIUS_METERS * KEEP_RADIUS_METERS;
    });
  };

  const nodes = new Map<number, [number, number]>();
  const ways = new Map<number, { refs: number[]; tags: Tags | null }>();
  const areas: OsmArea[] = [];

  const { blocks } = await readOsmPbf(createReadStream(pbfPath));

  for await (const block of blocks) {
    const granularity = block.granularity ?? 100;
    const latOffset = block.lat_offset ?? 0;
    const lonOffset = block.lon_offset ?? 0;
    let strings: string[] | null = null;
    const getStrings = () => (strings ??= block.stringtable.map((s) => decoder.decode(s)));

    for (const group of block.primitivegroup) {
      // Nodos densos (deltas acumulados): solo se guardan los cercanos.
      if (group.dense) {
        const { id, lat, lon } = group.dense;
        let nodeId = 0;
        let rawLat = 0;
        let rawLon = 0;
        for (let i = 0; i < id.length; i++) {
          nodeId += id[i];
          rawLat += lat[i];
          rawLon += lon[i];
          const latitude = 1e-9 * (latOffset + granularity * rawLat);
          const longitude = 1e-9 * (lonOffset + granularity * rawLon);
          if (isNearAnyPoint(latitude, longitude)) nodes.set(nodeId, [latitude, longitude]);
        }
      }
      for (const node of group.nodes) {
        const latitude = 1e-9 * (latOffset + granularity * node.lat);
        const longitude = 1e-9 * (lonOffset + granularity * node.lon);
        if (isNearAnyPoint(latitude, longitude)) nodes.set(node.id, [latitude, longitude]);
      }

      // Vías que tocan algún nodo cercano. Las cerradas y visitables ya son
      // un contorno; las demás pueden ser parte de un multipolígono.
      for (const way of group.ways) {
        const refs: number[] = [];
        let ref = 0;
        let touches = false;
        for (const delta of way.refs) {
          ref += delta;
          refs.push(ref);
          if (!touches && nodes.has(ref)) touches = true;
        }
        if (!touches) continue;

        const tags = way.keys.length ? tagsFrom(way.keys, way.vals, getStrings()) : null;
        ways.set(way.id, { refs, tags });

        const closed = refs.length >= 4 && refs[0] === refs[refs.length - 1];
        if (closed && tags && isVisitable(tags) && refs.every((r) => nodes.has(r))) {
          areas.push({
            source: `way/${way.id}`,
            tags,
            outerRings: [refs.slice(0, -1).map((r) => nodes.get(r)!)],
          });
        }
      }

      // Multipolígonos visitables, armados con las vías guardadas.
      for (const relation of group.relations) {
        const tags = tagsFrom(relation.keys, relation.vals, getStrings());
        if (tags.type !== "multipolygon" || !isVisitable(tags)) continue;

        const outerParts: number[][] = [];
        let member = 0;
        let complete = true;
        for (let i = 0; i < relation.memids.length; i++) {
          member += relation.memids[i];
          if (relation.types[i] !== 1) continue; // 1 = vía
          const role = getStrings()[relation.roles_sid[i]];
          if (role !== "outer" && role !== "") continue;
          const way = ways.get(member);
          if (!way || !way.refs.every((r) => nodes.has(r))) {
            complete = false;
            break;
          }
          outerParts.push(way.refs);
        }
        if (!complete || !outerParts.length) continue;

        const rings = joinRings(outerParts);
        if (!rings) continue;
        areas.push({
          source: `relation/${relation.id}`,
          tags,
          outerRings: rings.map((ring) => ring.slice(0, -1).map((r) => nodes.get(r)!)),
        });
      }
    }
  }

  return { areas, seconds: (Date.now() - started) / 1000 };
}
