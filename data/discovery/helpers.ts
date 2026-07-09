import { discoveryCatalog, type DiscoveryCatalogItem } from "./catalog";
import { supportedCities } from "./cities";
import { discoveryZones } from "./zones";

type UserLocation = {
  latitude: number;
  longitude: number;
} | null;

function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function sortDiscoveryItemsByDistance(
  items: DiscoveryCatalogItem[],
  userLocation: UserLocation
) {
  if (!userLocation) return items;

  return [...items].sort((a, b) => {
    const distanceA = getDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      a.latitude,
      a.longitude
    );

    const distanceB = getDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      b.latitude,
      b.longitude
    );

    return distanceA - distanceB;
  });
}

export function getCityFromCoordinates(userLocation: UserLocation): string | null {
  if (!userLocation) return null;

  const matchedCity = supportedCities.find((city) => {
    const { latitude, longitude } = userLocation;
    const { minLatitude, maxLatitude, minLongitude, maxLongitude } = city.bounds;

    return (
      latitude >= minLatitude &&
      latitude <= maxLatitude &&
      longitude >= minLongitude &&
      longitude <= maxLongitude
    );
  });

  return matchedCity?.id ?? null;
}

function isDiscoveryItemInZone(
  item: DiscoveryCatalogItem,
  zoneId: string | null
): boolean {
  if (!zoneId) return false;

  return item.zoneId === zoneId;
}

export function getDiscoveryItemsByZone(
  items: DiscoveryCatalogItem[],
  zoneId: string | null
): DiscoveryCatalogItem[] {
  if (!zoneId) return [];

  return items.filter((item) =>
    isDiscoveryItemInZone(item, zoneId)
  );
}

export function getDiscoveryContentByCity(
  cityId: string | null,
  userLocation: UserLocation
): {
  featuredTours: DiscoveryCatalogItem[];
  discoverPlaces: DiscoveryCatalogItem[];
} {
  if (!cityId) {
    return {
      featuredTours: [],
      discoverPlaces: [],
    };
  }

  const cityItems = discoveryCatalog.filter((item) => item.cityId === cityId);

  const featuredTours = cityItems.filter(
    (item) => item.section === "featured_tours"
  );

  const discoverPlaces = cityItems.filter(
    (item) => item.section === "discover_places"
  );

  return {
    featuredTours: sortDiscoveryItemsByDistance(featuredTours, userLocation),
    discoverPlaces: sortDiscoveryItemsByDistance(discoverPlaces, userLocation),
  };
}

export function getDiscoveryAvailabilityByCity(cityId: string | null) {
  if (!cityId) {
    return {
      hasFeaturedTours: false,
      hasDiscoverPlaces: false,
    };
  }

  const cityItems = discoveryCatalog.filter((item) => item.cityId === cityId);

  return {
    hasFeaturedTours: cityItems.some((item) => item.section === "featured_tours"),
    hasDiscoverPlaces: cityItems.some((item) => item.section === "discover_places"),
  };
}

export function getDiscoveryZoneFromCoordinates(
  cityId: string | null,
  userLocation: UserLocation
): string | null {
  if (!cityId || !userLocation) return null;

  const matchedZone = discoveryZones.find((zone) => {
    if (zone.cityId !== cityId) return false;

    const { latitude, longitude } = userLocation;
    const { minLatitude, maxLatitude, minLongitude, maxLongitude } =
      zone.bounds;

    return (
      latitude >= minLatitude &&
      latitude <= maxLatitude &&
      longitude >= minLongitude &&
      longitude <= maxLongitude
    );
  });

  return matchedZone?.id ?? null;
}
