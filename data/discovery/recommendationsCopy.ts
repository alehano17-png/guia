import { discoveryCopy } from "./copy";

type Params = {
  cityName: string;
  zoneName: string | null;
  hasSupportedCity: boolean;
  hasFeaturedTours: boolean;
  hasDiscoverPlaces: boolean;
};

function interpolate(template: string, cityName: string) {
  return template.replace("{{cityName}}", cityName);
}

export function getRecommendationsCopy({
  cityName,
  zoneName,
  hasSupportedCity,
  hasFeaturedTours,
  hasDiscoverPlaces,
}: Params) {
  const loadingSubtitle = hasSupportedCity
    ? interpolate(discoveryCopy.recommendations.loadingDetected, cityName)
    : discoveryCopy.recommendations.loadingDetecting;

  const headerSubtitle =
    hasSupportedCity && hasFeaturedTours
      ? interpolate(
          discoveryCopy.recommendations.headerSupportedWithTours,
          cityName
        )
      : hasSupportedCity && !hasFeaturedTours && hasDiscoverPlaces
        ? interpolate(
            discoveryCopy.recommendations.headerSupportedWithPlaces,
            cityName
          )
        : hasSupportedCity && !hasFeaturedTours && !hasDiscoverPlaces
          ? interpolate(
              discoveryCopy.recommendations.headerSupportedEmpty,
              cityName
            )
          : hasFeaturedTours || hasDiscoverPlaces
            ? discoveryCopy.recommendations.unsupportedButAvailable
            : discoveryCopy.recommendations.unsupportedLocation;

  const zoneContext = zoneName
  ? discoveryCopy.recommendations.detectedZone.replace(
      "{{zoneName}}",
      zoneName
    )
  : "";

return {
  loadingSubtitle,
  headerSubtitle: zoneContext
    ? `${zoneContext} ${headerSubtitle}`
    : headerSubtitle,
};
}