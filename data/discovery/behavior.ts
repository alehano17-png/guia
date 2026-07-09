import type { DiscoveryCatalogItem } from "./catalog";
import { discoveryCopy } from "./copy";

function isDiscoveryItemPlayable(
  item: DiscoveryCatalogItem
): boolean {
  return item.availability === "available" && item.isPlayable && !!item.tourId;
}

export function getDiscoveryItemTourId(
  item: DiscoveryCatalogItem
): string | null {
  if (!isDiscoveryItemPlayable(item)) return null;
  return item.tourId ?? null;
}

export function getDiscoveryItemStatus(
  item: DiscoveryCatalogItem
): string | undefined {
  if (item.availability === "coming_soon") {
    return discoveryCopy.status.comingSoon;
  }

  return undefined;
}
