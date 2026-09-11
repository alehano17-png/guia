import React, { useEffect } from "react";
import Svg, { Circle, Ellipse } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { TOUR_ACCENT_COLOR } from "../../lib/tourTheme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Centro y semiejes compartidos por las 2 elipses, dentro de un viewBox
// de 160x160 — ambas centradas en el mismo punto, solo cambia su
// rotación (a diferencia de CircleOrbitAnimation, acá lo que varía entre
// curvas no es el radio sino el ángulo de rotación).
const CENTER = { x: 80, y: 80 };
const ELLIPSE_RX = 64;
const ELLIPSE_RY = 24;

// Segundo tono de la marca — mismo que en el resto de la biblioteca, lo
// usa uno de los puntos de la elipse rotada 35°.
const POINT_SECONDARY_COLOR = "#5F4ED0";

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Posición exacta sobre una elipse rotada alrededor de su propio centro,
// dado un ángulo θ (radianes) y la rotación de esa elipse en particular
// (también en radianes) — fórmula estándar de elipse rotada, la misma
// que se usa para el `transform="rotate(...)"` de las <Ellipse> de abajo,
// así que los puntos caen exacto sobre la curva dibujada.
function getPointOnEllipse(angleRad: number, rotationRad: number) {
  "worklet";
  const cosT = Math.cos(angleRad);
  const sinT = Math.sin(angleRad);
  const cosR = Math.cos(rotationRad);
  const sinR = Math.sin(rotationRad);

  return {
    x: CENTER.x + ELLIPSE_RX * cosT * cosR - ELLIPSE_RY * sinT * sinR,
    y: CENTER.y + ELLIPSE_RX * cosT * sinR + ELLIPSE_RY * sinT * cosR,
  };
}

// Las 2 elipses fijas (nunca se mueven) — solo los 4 puntos orbitan.
const ELLIPSES: {
  rotationDeg: number;
  strokeWidth: number;
  strokeDasharray?: string;
  opacity: number;
}[] = [
  { rotationDeg: -25, strokeWidth: 1.5, strokeDasharray: "4 4", opacity: 0.75 },
  { rotationDeg: 35, strokeWidth: 1.2, opacity: 0.45 },
];

// Los 4 puntos: cada uno orbita la elipse que le corresponde, partiendo
// de su ángulo inicial dado — los dos de una misma elipse comparten
// velocidad (misma "órbita"), pero cada elipse tiene la suya propia.
const ORBIT_POINTS: {
  rotationDeg: number;
  startAngleDeg: number;
  durationMs: number;
  pointRadius: number;
  color: string;
  opacity: number;
}[] = [
  // Elipse rotada 35° — una vuelta cada 5s.
  {
    rotationDeg: 35,
    startAngleDeg: -170.3,
    durationMs: 5000,
    pointRadius: 3.5,
    color: TOUR_ACCENT_COLOR,
    opacity: 0.7,
  },
  {
    rotationDeg: 35,
    startAngleDeg: 39.4,
    durationMs: 5000,
    pointRadius: 5.5,
    color: POINT_SECONDARY_COLOR,
    opacity: 1,
  },
  // Elipse rotada -25° — una vuelta cada 4s.
  {
    rotationDeg: -25,
    startAngleDeg: 11.7,
    durationMs: 4000,
    pointRadius: 3,
    color: TOUR_ACCENT_COLOR,
    opacity: 0.6,
  },
  {
    rotationDeg: -25,
    startAngleDeg: -164.8,
    durationMs: 4000,
    pointRadius: 4,
    color: TOUR_ACCENT_COLOR,
    opacity: 1,
  },
];

function OrbitDot({
  rotationDeg,
  startAngleDeg,
  durationMs,
  pointRadius,
  color,
  opacity,
}: (typeof ORBIT_POINTS)[number]) {
  const rotationRad = degToRad(rotationDeg);
  const startAngleRad = degToRad(startAngleDeg);

  // Mismo patrón que en CircleOrbitAnimation: un shared value que avanza
  // linealmente de startAngle a startAngle + 2π y se reinicia solo
  // (withRepeat sin reverse) — el "reinicio" es invisible porque la
  // posición a +2π es idéntica a la de partida.
  const angle = useSharedValue(startAngleRad);

  useEffect(() => {
    angle.value = withRepeat(
      withTiming(startAngleRad + Math.PI * 2, {
        duration: durationMs,
        easing: Easing.linear,
      }),
      -1
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const point = getPointOnEllipse(angle.value, rotationRad);
    return { cx: point.x, cy: point.y };
  });

  return (
    <AnimatedCircle
      r={pointRadius}
      fill={color}
      opacity={opacity}
      animatedProps={animatedProps}
    />
  );
}

// Auto-contenida, sin props — maneja su propio loop internamente. Mismo
// contrato que el resto de la biblioteca (ver ./index.ts).
export default function EllipticalOrbitAnimation() {
  return (
    <Svg width={160} height={160} viewBox="0 0 160 160">
      {ELLIPSES.map((ellipse, index) => (
        <Ellipse
          key={index}
          cx={CENTER.x}
          cy={CENTER.y}
          rx={ELLIPSE_RX}
          ry={ELLIPSE_RY}
          transform={`rotate(${ellipse.rotationDeg} ${CENTER.x} ${CENTER.y})`}
          stroke={TOUR_ACCENT_COLOR}
          strokeWidth={ellipse.strokeWidth}
          strokeDasharray={ellipse.strokeDasharray}
          opacity={ellipse.opacity}
          fill="none"
        />
      ))}

      {/* Punto fijo en el centro exacto — no orbita nada. */}
      <Circle
        cx={CENTER.x}
        cy={CENTER.y}
        r={2.5}
        fill={TOUR_ACCENT_COLOR}
        opacity={0.4}
      />

      {ORBIT_POINTS.map((point, index) => (
        <OrbitDot key={index} {...point} />
      ))}
    </Svg>
  );
}
