import type { DiscoveryCatalogItem } from "./catalog";
import type { TranslationDictionary } from "../../lib/i18n/es";

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
  item: DiscoveryCatalogItem,
  t: TranslationDictionary
): string | undefined {
  if (item.availability === "coming_soon") {
    return t.status.comingSoon;
  }

  return undefined;
}
