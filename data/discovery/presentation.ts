import type { Locale } from "../../lib/i18n";
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

// Nombre y descripción de la tarjeta en el idioma de la interfaz; si el
// ítem no tiene ese idioma, en español.
export function getDiscoveryItemTexts(
  item: DiscoveryCatalogItem,
  locale: Locale
): { title: string; subtitle: string } {
  if (locale !== "es" && item[locale]) return item[locale];
  return { title: item.title, subtitle: item.subtitle };
}
