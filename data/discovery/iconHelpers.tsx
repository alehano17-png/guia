import React from "react";
import Svg, { Path } from "react-native-svg";
import type { DiscoveryCatalogItem, DiscoveryIconKey } from "./catalog";

type DiscoveryIconProps = {
  size: number;
  color: string;
};

export type DiscoveryIcon = (props: DiscoveryIconProps) => React.JSX.Element;

// Un trazo de línea sobre un lienzo de 24x24; cada ícono solo define su
// path.
function lineIcon(d: string): DiscoveryIcon {
  return function LineIcon({ size, color }: DiscoveryIconProps) {
    return (
      <Svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <Path
          d={d}
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  };
}

// Clave del catálogo → ícono dibujado. Agregar un ícono = una clave en
// DiscoveryIconKey (catalog.ts) + una línea acá.
const discoveryIcons: Record<DiscoveryIconKey, DiscoveryIcon> = {
  pin: lineIcon("M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"),
  landmark: lineIcon("M3 9l9-5 9 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18"),
  palette: lineIcon(
    "M12 3a9 9 0 1 0 0 18c1.4 0 2-1 1.6-2-.5-1.2.3-2.3 1.6-2.3H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"
  ),
};

// Sin `icon` en el catálogo, la tarjeta usa el pin.
export function getDiscoveryItemIcon(item: DiscoveryCatalogItem): DiscoveryIcon {
  return discoveryIcons[item.icon ?? "pin"];
}
