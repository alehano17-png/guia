import type { DiscoveryCatalogItem } from "./catalog";
import { getDiscoveryItemTourId } from "./behavior";

export function getDiscoveryItemRoute(
  item: DiscoveryCatalogItem
):
  | {
      pathname: "/tour";
      params: { tourId: string };
    }
  | null {
  const tourId = getDiscoveryItemTourId(item);

  if (!tourId) return null;

  return {
    pathname: "/tour",
    params: { tourId },
  };
}
