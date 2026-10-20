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

// Degradados de los cuadros de ícono; se reparten entre los íconos para
// que haya variedad en la lista.
const BLUE: DiscoveryGradient = ["#6F8CF0", "#4F63D8"];
const VIOLET: DiscoveryGradient = ["#B07CF0", "#8B4FD8"];
const PINK: DiscoveryGradient = ["#E58FC8", "#B857A8"];
const INDIGO: DiscoveryGradient = ["#8B7CF0", "#6957DF"];

// Clave del catálogo → ícono dibujado y degradado de su cuadro. Para
// agregar un ícono: la clave en DiscoveryIconKey (catalog.ts) + una
// entrada acá con su path (lienzo 24x24) y su degradado.
const discoveryIcons: Record<
  DiscoveryIconKey,
  { icon: DiscoveryIcon; gradient: DiscoveryGradient }
> = {
  pin: {
    icon: lineIcon(
      "M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"
    ),
    gradient: INDIGO,
  },
  waves: {
    icon: lineIcon(
      "M2 8q2.5-3 5 0t5 0t5 0t5 0M2 13q2.5-3 5 0t5 0t5 0t5 0M2 18q2.5-3 5 0t5 0t5 0t5 0"
    ),
    gradient: BLUE,
  },
  landmark: {
    icon: lineIcon(
      "M3 9l9-5 9 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18"
    ),
    gradient: VIOLET,
  },
  art: {
    icon: lineIcon(
      "M18 3l3 3-9 9-3-3zM9 12c-3 0-4 2-4 4s-1 3-2 4c3 1 7 0 7-4"
    ),
    gradient: VIOLET,
  },
  archaeology: {
    icon: lineIcon(
      "M2 20h20M4 20v-4h16v4M7 16v-4h10v4M10 12V8h4v4"
    ),
    gradient: PINK,
  },
  church: {
    icon: lineIcon(
      "M12 3v4M10.5 5h3M6 21V11l6-4 6 4v10M3 21h18M10 21v-5a2 2 0 0 1 4 0v5"
    ),
    gradient: INDIGO,
  },
  sunset: {
    icon: lineIcon(
      "M3 18h18M7 18a5 5 0 0 1 10 0M12 7V4M5.6 10.6L4 9M18.4 10.6L20 9"
    ),
    gradient: BLUE,
  },
  lighthouse: {
    icon: lineIcon(
      "M9 21l1.2-12h3.6L15 21zM9.6 9l.9-3h3l.9 3M10.5 6V4.5h3V6M12 4.5V3M3 21h18M3.5 8.5l4 1.2M20.5 8.5l-4 1.2"
    ),
    gradient: VIOLET,
  },
  mountain: { icon: lineIcon("M2 20l7-12 4 6 3-4 6 10z"), gradient: PINK },
  food: {
    icon: lineIcon(
      "M6 3v5a3 3 0 0 0 6 0V3M9 11v10M17 3c-2 2-2 6 0 8v10"
    ),
    gradient: INDIGO,
  },
  music: {
    icon: lineIcon(
      "M9 18V6l10-2v12M9 18a3 3 0 1 1-3-3M19 16a3 3 0 1 1-3-3"
    ),
    gradient: BLUE,
  },
  anchor: {
    icon: lineIcon(
      "M12 7v14M8 11h8M5 14a7 7 0 0 0 14 0M12 3.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z"
    ),
    gradient: VIOLET,
  },
  city: {
    icon: lineIcon(
      "M4 21V10h5v11M9 21V4h6v17M15 21V8h5v13M3 21h18"
    ),
    gradient: BLUE,
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
