import { useMemo } from "react";
import { getSupportedCityById } from "../data/discovery/cities";
import {
  getCityFromCoordinates,
  getDiscoveryAvailabilityByCity,
  getDiscoveryContentByCity,
  getDiscoveryItemsByZone,
  getDiscoveryZoneFromCoordinates,
} from "../data/discovery/helpers";
import { getDiscoveryZoneById } from "../data/discovery/zones";

type UserLocation = {
  latitude: number;
  longitude: number;
} | null;

export function useDiscoveryContent(userLocation: UserLocation) {
  const detectedCityId = useMemo(
    () => getCityFromCoordinates(userLocation),
    [userLocation]
  );

  const detectedCity = useMemo(
    () => getSupportedCityById(detectedCityId),
    [detectedCityId]
  );

  const detectedZoneId = useMemo(
  () => getDiscoveryZoneFromCoordinates(detectedCityId, userLocation),
  [detectedCityId, userLocation]
);

const detectedZone = useMemo(
  () => getDiscoveryZoneById(detectedZoneId),
  [detectedZoneId]
);

  const { featuredTours, discoverPlaces } = useMemo(
    () => getDiscoveryContentByCity(detectedCityId, userLocation),
    [detectedCityId, userLocation]
  );

  const featuredToursInDetectedZone = useMemo(
  () => getDiscoveryItemsByZone(featuredTours, detectedZoneId),
  [featuredTours, detectedZoneId]
);

const discoverPlacesInDetectedZone = useMemo(
  () => getDiscoveryItemsByZone(discoverPlaces, detectedZoneId),
  [discoverPlaces, detectedZoneId]
);

  const { hasFeaturedTours, hasDiscoverPlaces } = useMemo(
    () => getDiscoveryAvailabilityByCity(detectedCityId),
    [detectedCityId]
  );

 return {
  detectedCityId,
  detectedCity,
  detectedZoneId,
  detectedZone,
  hasSupportedCity: !!detectedCity,
  featuredTours,
  discoverPlaces,
  featuredToursInDetectedZone,
  discoverPlacesInDetectedZone,
  hasFeaturedTours,
  hasDiscoverPlaces,
};
}
