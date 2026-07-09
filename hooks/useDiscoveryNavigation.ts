import { useRouter } from "expo-router";
import { discoverySectionEntries } from "../data/discovery/sections";
import type { DiscoveryCatalogItem } from "../data/discovery/catalog";
import { getDiscoveryItemRoute } from "../data/discovery/routes";

export function useDiscoveryNavigation() {
  const router = useRouter();

  const canOpenDiscoveryItem = (item: DiscoveryCatalogItem) => {
    return !!getDiscoveryItemRoute(item);
  };

  const openDiscoveryItem = (item: DiscoveryCatalogItem) => {
    const route = getDiscoveryItemRoute(item);
    if (!route) return;

    router.push(route);
  };

  const discoverPlacesEntry = discoverySectionEntries.discover_places;

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
