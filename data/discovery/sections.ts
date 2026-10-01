import type { TranslationDictionary } from "../../lib/i18n/es";

export type DiscoverySectionEntry = {
  title: string;
  subtitle: string;
  route: "/discover";
  isVisible: boolean;
};

export function getDiscoverySectionEntries(
  t: TranslationDictionary
): Record<string, DiscoverySectionEntry> {
  return {
    discover_places: {
      title: t.discover.title,
      subtitle: t.discover.subtitle,
      route: "/discover",
      isVisible: true,
    },
  };
}
