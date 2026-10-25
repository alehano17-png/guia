import type { DiscoveryMediaKey } from "./media";
export type DiscoverySection = "featured_tours" | "discover_places";
export type DiscoveryKind = "tour" | "place";
export type DiscoveryAvailability = "available" | "coming_soon";
// Ícono de la tarjeta del tour (ver iconHelpers.ts). Fácil de ampliar:
// agregar una clave acá y su ícono en iconHelpers.ts.
export type DiscoveryIconKey =
  | "pin" // por defecto
  | "waves" // mar y costa
  | "landmark" // historia y arquitectura
  | "art" // arte y bohemia
  | "archaeology" // arqueología
  | "church" // iglesias y fe
  | "sunset" // vistas y atardeceres
  | "lighthouse" // faro y malecón
  | "mountain" // acantilados y naturaleza
  | "food" // gastronomía
  | "music" // música y cultura
  | "anchor" // puerto y mar abierto
  | "city"; // ciudad moderna

export type DiscoveryCatalogItem = {
  id: string;
  // Español: title/subtitle. Otros idiomas, opcionales (si faltan, cae al
  // español; ver getDiscoveryItemTexts).
  title: string;
  subtitle: string;
  en?: { title: string; subtitle: string };
  durationMinutes: number;
  durationMaxMinutes?: number;
  // Sin uso desde que las tarjetas no llevan foto (ver mediaHelpers.ts).
  imageKey?: DiscoveryMediaKey;
  icon?: DiscoveryIconKey;
 cityId: string;
  zoneId: string;
  zone: string;
  section: DiscoverySection;
  kind: DiscoveryKind;
  availability: DiscoveryAvailability;
  isPlayable: boolean;
  tourId?: string;
  latitude: number;
  longitude: number;
};

export const discoveryCatalog: DiscoveryCatalogItem[] = [
  {
    id: "miraflores-card",
    title: "Miraflores",
    subtitle: "Mar, caminatas y vistas únicas.",
    en: { title: "Miraflores", subtitle: "Sea, walks and unique views." },
    durationMinutes: 75,
    durationMaxMinutes: 90,
    icon: "waves",
    cityId: "lima",
    zoneId: "miraflores",
    zone: "Miraflores",
    section: "featured_tours",
    kind: "tour",
    availability: "available",
    isPlayable: true,
    tourId: "miraflores-completo",
    latitude: -12.123722,
    longitude: -77.040097,
  },
  {
    id: "centro-card",
    title: "Centro Histórico",
    subtitle: "Historia, plazas y arquitectura.",
    en: { title: "Historic Center", subtitle: "History, squares and architecture." },
    durationMinutes: 75,
    durationMaxMinutes: 90,
    icon: "landmark",
    cityId: "lima",
    zoneId: "centro-historico",
    zone: "Centro Histórico",
    section: "featured_tours",
    kind: "tour",
    availability: "available",
    isPlayable: true,
    tourId: "centro-historico",
    latitude: -12.046374,
    longitude: -77.042793,
  },
  {
    id: "barranco-card",
    title: "Barranco",
    subtitle: "Arte, bohemia y cultura.",
    en: { title: "Barranco", subtitle: "Art, bohemia and culture." },
    durationMinutes: 75,
    durationMaxMinutes: 90,
    icon: "art",
   cityId: "lima",
    zoneId: "barranco",
    zone: "Barranco",
    section: "featured_tours",
    kind: "tour",
    availability: "available",
    isPlayable: true,
    tourId: "barranco",
    latitude: -12.14961,
    longitude: -77.02018,
  },
  {
    id: "parque-del-amor-card",
    title: "Parque del Amor",
    subtitle: "Mirador frente al mar",
    en: { title: "Parque del Amor", subtitle: "Viewpoint facing the sea" },
    durationMinutes: 15,
    durationMaxMinutes: 25,
    icon: "sunset",
    cityId: "lima",
    zoneId: "miraflores",
    zone: "Miraflores",
    section: "discover_places",
    kind: "place",
    availability: "coming_soon",
    isPlayable: false,
    latitude: -12.1314,
    longitude: -77.0307,
  },
  {
    id: "faro-de-la-marina-card",
    title: "Faro de la Marina",
    subtitle: "Punto icónico del malecón",
    en: { title: "La Marina Lighthouse", subtitle: "An iconic spot on the Malecón" },
    durationMinutes: 10,
    durationMaxMinutes: 20,
    icon: "lighthouse",
    cityId: "lima",
    zoneId: "miraflores",
    zone: "Miraflores",
    section: "discover_places",
    kind: "place",
    availability: "coming_soon",
    isPlayable: false,
    latitude: -12.1167,
    longitude: -77.0466,
  },
  {
    id: "larcomar-card",
    title: "Larcomar",
    subtitle: "Spot urbano frente al acantilado",
    en: { title: "Larcomar", subtitle: "Urban spot on the cliffs" },
    durationMinutes: 20,
    durationMaxMinutes: 35,
    icon: "city",
    cityId: "lima",
    zoneId: "miraflores",
    zone: "Miraflores",
    section: "discover_places",
    kind: "place",
    availability: "coming_soon",
    isPlayable: false,
    latitude: -12.1319,
    longitude: -77.0302,
  },
];