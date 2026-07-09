import type { DiscoveryCatalogItem } from "./catalog";

export function getDiscoveryItemDurationLabel(item: DiscoveryCatalogItem): string {
  if (
    item.durationMaxMinutes &&
    item.durationMaxMinutes > item.durationMinutes
  ) {
    return `${item.durationMinutes}–${item.durationMaxMinutes} min`;
  }

  return `${item.durationMinutes} min`;
}

export function getDiscoveryItemMetaLabel(item: DiscoveryCatalogItem): string {
  const durationLabel = getDiscoveryItemDurationLabel(item);

  if (item.experienceLabel) {
    return `${durationLabel} · ${item.experienceLabel}`;
  }

  return durationLabel;
}
