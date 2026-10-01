import type { TranslationDictionary } from "../../lib/i18n/es";
import { interpolate } from "../../lib/i18n/interpolate";

type Params = {
  t: TranslationDictionary;
  cityName: string;
  zoneName: string | null;
  hasSupportedCity: boolean;
  hasFeaturedTours: boolean;
  hasDiscoverPlaces: boolean;
};

export function getRecommendationsCopy({
  t,
  cityName,
  zoneName,
  hasSupportedCity,
  hasFeaturedTours,
  hasDiscoverPlaces,
}: Params) {
  const headerSubtitle =
    hasSupportedCity && hasFeaturedTours
      ? interpolate(t.recommendations.headerSupportedWithTours, { cityName })
      : hasSupportedCity && !hasFeaturedTours && hasDiscoverPlaces
        ? interpolate(t.recommendations.headerSupportedWithPlaces, { cityName })
        : hasSupportedCity && !hasFeaturedTours && !hasDiscoverPlaces
          ? interpolate(t.recommendations.headerSupportedEmpty, { cityName })
          : hasFeaturedTours || hasDiscoverPlaces
            ? t.recommendations.unsupportedButAvailable
            : t.recommendations.unsupportedLocation;

  const zoneContext = zoneName
    ? interpolate(t.recommendations.detectedZone, { zoneName })
    : "";

  return {
    headerSubtitle: zoneContext ? `${zoneContext} ${headerSubtitle}` : headerSubtitle,
  };
}
