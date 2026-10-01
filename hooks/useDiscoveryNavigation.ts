import { useRouter } from "expo-router";
import { getDiscoverySectionEntries } from "../data/discovery/sections";
import type { DiscoveryCatalogItem } from "../data/discovery/catalog";
import { getDiscoveryItemRoute } from "../data/discovery/routes";
import { useTranslation } from "../lib/i18n/useTranslation";

export function useDiscoveryNavigation() {
  const router = useRouter();
  const { t } = useTranslation();

  const canOpenDiscoveryItem = (item: DiscoveryCatalogItem) => {
    return !!getDiscoveryItemRoute(item);
  };

  const openDiscoveryItem = (item: DiscoveryCatalogItem) => {
    const route = getDiscoveryItemRoute(item);
    if (!route) return;

    router.push(route);
  };

  const discoverPlacesEntry = getDiscoverySectionEntries(t).discover_places;

  const canOpenDiscoverPlaces = () => {
    return discoverPlacesEntry.isVisible;
  };

  const openDiscoverPlaces = () => {
    if (!canOpenDiscoverPlaces()) return;

    router.push(discoverPlacesEntry.route);
  };

  return {
    canOpenDiscoveryItem,
    openDiscoveryItem,
    canOpenDiscoverPlaces,
    openDiscoverPlaces,
    discoverPlacesEntry,
  };
}
