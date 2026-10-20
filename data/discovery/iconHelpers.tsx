import React from "react";
import Svg, { Path } from "react-native-svg";
import type { DiscoveryCatalogItem, DiscoveryIconKey } from "./catalog";

type DiscoveryIconProps = {
  size: number;
  color: string;
  strokeWidth?: number;
};

export type DiscoveryIcon = (props: DiscoveryIconProps) => React.JSX.Element;

// Par de colores (diagonal) del cuadro del ícono en la tarjeta.
export type DiscoveryGradient = readonly [string, string];

// Un trazo de línea sobre un lienzo de 24x24; cada ícono solo define su
// path.
function lineIcon(d: string): DiscoveryIcon {
  return function LineIcon({ size, color, strokeWidth = 1.5 }: DiscoveryIconProps) {
    return (
      <Svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <Path
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  };
}

// Clave del catálogo → ícono dibujado y degradado de su cuadro. Agregar un
// ícono = una clave en DiscoveryIconKey (catalog.ts) + una entrada acá.
const discoveryIcons: Record<
  DiscoveryIconKey,
  { icon: DiscoveryIcon; gradient: DiscoveryGradient }
> = {
  pin: {
    icon: lineIcon("M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"),
    gradient: ["#8B7CF0", "#6957DF"],
  },
  waves: {
    icon: lineIcon(
      "M2 8q2.5-3 5 0t5 0t5 0t5 0M2 13q2.5-3 5 0t5 0t5 0t5 0M2 18q2.5-3 5 0t5 0t5 0t5 0"
    ),
    gradient: ["#6F8CF0", "#4F63D8"],
  },
  landmark: {
    icon: lineIcon("M3 9l9-5 9 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18"),
    gradient: ["#B07CF0", "#8B4FD8"],
  },
  bridge: {
    icon: lineIcon(
      "M2 10h20M4 10V5M8 10V5M12 10V5M16 10V5M20 10V5M3 5h18M5 10v2c0 5 3 8 7 8s7-3 7-8v-2"
    ),
    gradient: ["#8B7CF0", "#6957DF"],
  },
};

// Sin `icon` en el catálogo, la tarjeta usa el pin.
export function getDiscoveryItemIcon(item: DiscoveryCatalogItem): DiscoveryIcon {
  return discoveryIcons[item.icon ?? "pin"].icon;
}

export function getDiscoveryItemGradient(
  item: DiscoveryCatalogItem
): DiscoveryGradient {
  return discoveryIcons[item.icon ?? "pin"].gradient;
}
