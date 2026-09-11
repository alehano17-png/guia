import React, { useEffect } from "react";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { TOUR_ACCENT_COLOR } from "../../lib/tourTheme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Centro y radios de los 3 anillos concéntricos, dentro de un viewBox de
// 160x160.
const CENTER = { x: 80, y: 80 };
const RING_RADIUS_OUTER = 60;
const RING_RADIUS_MIDDLE = 42;
const RING_RADIUS_INNER = 24;

// Segundo tono de la marca, más oscuro que TOUR_ACCENT_COLOR — en este
// diseño puntual solo lo usa el punto interior de (80,104).
const POINT_SECONDARY_COLOR = "#5F4ED0";

// Posición exacta sobre un círculo dado su ángulo (en radianes; 0 = eje
// +x, creciendo en sentido horario porque el eje Y de SVG crece hacia
// abajo) — mismo enfoque que getPointOnWavePath en WaveTravelerAnimation:
// matemática real, no una aproximación a ojo.
function getPointOnCircle(angle: number, radius: number) {
  "worklet";
  return {
    x: CENTER.x + radius * Math.cos(angle),
    y: CENTER.y + radius * Math.sin(angle),
  };
}

// Los 3 anillos fijos (nunca se mueven) — solo cambian su patrón de
// guiones y opacidad entre sí.
const RINGS: { radius: number; strokeDasharray?: string; opacity: number }[] = [
  { radius: RING_RADIUS_OUTER, strokeDasharray: "4 4", opacity: 0.45 },
  { radius: RING_RADIUS_MIDDLE, opacity: 0.6 },
  { radius: RING_RADIUS_INNER, strokeDasharray: "3 3", opacity: 0.8 },
];

// Los 4 puntos: cada uno orbita el anillo que le corresponde, partiendo
// de su ángulo original en el diseño estático — calculado exacto con
// atan2 sobre su posición dada (0 = eje +x/derecha, -π/2 = arriba,
// π/2 = abajo, π = izquierda), no puesto a ojo.
const ORBIT_POINTS: {
  ringRadius: number;
  startAngle: number;
  durationMs: number;
  pointRadius: number;
  color: string;
  opacity: number;
}[] = [
  // (80,20), sobre el anillo de afuera — una vuelta cada 6s.
  {
    ringRadius: RING_RADIUS_OUTER,
    startAngle: -Math.PI / 2,
    durationMs: 6000,
    pointRadius: 3,
    color: TOUR_ACCENT_COLOR,
    opacity: 0.5,
  },
  // (122,80), sobre el anillo del medio — una vuelta cada 4s.
  {
    ringRadius: RING_RADIUS_MIDDLE,
    startAngle: 0,
    durationMs: 4000,
    pointRadius: 4,
    color: TOUR_ACCENT_COLOR,
    opacity: 1,
  },
  // (80,104), sobre el anillo de adentro — una vuelta cada 3s.
  {
    ringRadius: RING_RADIUS_INNER,
    startAngle: Math.PI / 2,
    durationMs: 3000,
    pointRadius: 5,
    color: POINT_SECONDARY_COLOR,
    opacity: 1,
  },
  // (56,80), también sobre el anillo de adentro — misma velocidad que el
  // punto de arriba, pero arrancando desde el lado opuesto.
  {
    ringRadius: RING_RADIUS_INNER,
    startAngle: Math.PI,
    durationMs: 3000,
    pointRadius: 3,
    color: TOUR_ACCENT_COLOR,
    opacity: 0.7,
  },
];

function OrbitDot({
  ringRadius,
  startAngle,
  durationMs,
  pointRadius,
  color,
  opacity,
}: (typeof ORBIT_POINTS)[number]) {
  // Mismo patrón que `progress` en WaveTravelerAnimation: un shared value
  // que avanza linealmente y se reinicia solo (withRepeat sin reverse) —
  // acá en vez de 0→1 va de startAngle a startAngle + 2π (una vuelta
  // completa), así que el "reinicio" es visualmente invisible: la
  // posición a +2π es idéntica a la de partida.
  const angle = useSharedValue(startAngle);

  useEffect(() => {
    angle.value = withRepeat(
      withTiming(startAngle + Math.PI * 2, {
        duration: durationMs,
        easing: Easing.linear,
      }),
      -1
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const point = getPointOnCircle(angle.value, ringRadius);
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
// contrato que WaveTravelerAnimation (ver ./index.ts).
export default function CircleOrbitAnimation() {
  return (
    <Svg width={160} height={160} viewBox="0 0 160 160">
      {RINGS.map((ring, index) => (
        <Circle
          key={index}
          cx={CENTER.x}
          cy={CENTER.y}
          r={ring.radius}
          stroke={TOUR_ACCENT_COLOR}
          strokeWidth={1.5}
          strokeDasharray={ring.strokeDasharray}
          opacity={ring.opacity}
          fill="none"
        />
      ))}

      {ORBIT_POINTS.map((point, index) => (
        <OrbitDot key={index} {...point} />
      ))}
    </Svg>
  );
}
