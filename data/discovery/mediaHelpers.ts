import type { DiscoveryCatalogItem } from "./catalog";
import { discoveryMedia } from "./media";

export function hasDiscoveryItemImage(item: DiscoveryCatalogItem): boolean {
  return !!item.imageKey && !!discoveryMedia[item.imageKey];
}

export function getDiscoveryItemImage(item: DiscoveryCatalogItem) {
  if (!hasDiscoveryItemImage(item)) return undefined;

  return discoveryMedia[item.imageKey!];
}