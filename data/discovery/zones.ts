import type { Locale } from "../../lib/i18n";

export type DiscoveryZone = {
  id: string;
  cityId: string;
  // Nombre en español; otros idiomas, opcionales (si faltan, cae al
  // español; ver getDiscoveryZoneName).
  name: string;
  en?: { name: string };
  bounds: {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  };
};

export const discoveryZones: DiscoveryZone[] = [
  {
    id: "miraflores",
    cityId: "lima",
    name: "Miraflores",
    bounds: {
      minLatitude: -12.145,
      maxLatitude: -12.095,
      minLongitude: -77.055,
      maxLongitude: -77.015,
    },
  },
  {
    id: "barranco",
    cityId: "lima",
    name: "Barranco",
    bounds: {
      minLatitude: -12.165,
      maxLatitude: -12.135,
      minLongitude: -77.035,
      maxLongitude: -77.005,
    },
  },
  {
    id: "centro-historico",
    cityId: "lima",
    name: "Centro Histórico",
    en: { name: "Historic Center" },
    bounds: {
      minLatitude: -12.065,
      maxLatitude: -12.035,
      minLongitude: -77.055,
      maxLongitude: -77.02,
    },
  },
];

export function getDiscoveryZoneById(
  zoneId: string | null
): DiscoveryZone | null {
  if (!zoneId) return null;

  return discoveryZones.find((zone) => zone.id === zoneId) ?? null;
}

export function getDiscoveryZoneName(zone: DiscoveryZone, locale: Locale): string {
  if (locale !== "es" && zone[locale]) return zone[locale].name;
  return zone.name;
}
