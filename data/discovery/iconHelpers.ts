import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import type { DiscoveryCatalogItem, DiscoveryIconKey } from "./catalog";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

// Clave del catálogo → ícono de Ionicons. Agregar un ícono = una clave en
// DiscoveryIconKey (catalog.ts) + una línea acá.
const discoveryIcons: Record<DiscoveryIconKey, IoniconName> = {
  pin: "location-outline",
  landmark: "business-outline",
  palette: "color-palette-outline",
};

// Sin `icon` en el catálogo, la tarjeta usa el pin.
export function getDiscoveryItemIcon(item: DiscoveryCatalogItem): IoniconName {
  return discoveryIcons[item.icon ?? "pin"];
}
