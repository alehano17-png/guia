import { discoveryCopy } from "./copy";

export type DiscoverySectionEntry = {
  title: string;
  subtitle: string;
  route: "/discover";
  isVisible: boolean;
};

export const discoverySectionEntries = {
  discover_places: {
    title: discoveryCopy.discover.title,
    subtitle: discoveryCopy.discover.subtitle,
    route: "/discover",
    isVisible: true,
  },
} satisfies Record<string, DiscoverySectionEntry>;