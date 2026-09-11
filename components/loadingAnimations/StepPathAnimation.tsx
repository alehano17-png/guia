import React, { useEffect } from "react";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { TOUR_ACCENT_COLOR } from "../../lib/tourTheme";
import { getPointOnPolyline } from "./polylinePath";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const LOOP_DURATION_MS = 3000;

// Línea principal (la que recorre el punto viajero): 4 tramos rectos, de
// largo real DISTINTO (52 + 52 + 44 + 52 = 200 unidades) — por eso los
// progress de sus codos, abajo, no son 0.25/0.5/0.75 parejos, sino
// proporcionales al largo real de cada tramo.
const MAIN_PATH_D = "M 28,124 L 28,72 L 80,72 L 80,28 L 132,28";
const MAIN_PATH_POINTS = [
  { x: 28, y: 124 },
  { x: 28, y: 72 },
  { x: 80, y: 72 },
  { x: 80, y: 28 },
  { x: 132, y: 28 },
];
// Progress (0 a 1) acumulado en cada codo: 52/200, 104/200, 148/200.
const MAIN_PATH_BREAKPOINTS = [0, 0.26, 0.52, 0.74, 1];

// Línea secundaria: completamente fija, sin animar — solo fondo visual,
// como en el diseño original.
const SECONDARY_PATH_D = "M 44,136 L 116,136 L 116,60 L 140,60";

// Segundo tono de la marca — mismo que en CircleOrbitAnimation, lo usa el
// punto de (80,72).
const POINT_SECONDARY_COLOR = "#5F4ED0";

// Los 3 puntos sobre los codos de la línea principal — el `threshold` de
// cada uno coincide con los codos de MAIN_PATH_BREAKPOINTS de arriba, y
// `litOpacity` es su opacidad "encendida" (la del diseño original: 0.6,
// 1, 0.8 — no siempre 1) una vez que el viajero lo cruza.
const MAIN_PATH_DOTS: {
  x: number;
  y: number;
  threshold: number;
  radius: number;
  litOpacity: number;
  color: string;
}[] = [
  { x: 28, y: 72, threshold: 0.26, radius: 3.5, litOpacity: 0.6, color: TOUR_ACCENT_COLOR },
  { x: 80, y: 72, threshold: 0.52, radius: 5, litOpacity: 1, color: POINT_SECONDARY_COLOR },
  { x: 80, y: 28, threshold: 0.74, radius: 3.5, litOpacity: 0.8, color: TOUR_ACCENT_COLOR },
];

// Los 2 puntos de la línea secundaria — también fijos, sin animar.
const SECONDARY_PATH_DOTS: {
  x: number;
  y: number;
  radius: number;
  opacity: number;
}[] = [
  { x: 116, y: 136, radius: 3, opacity: 0.5 },
  { x: 116, y: 60, radius: 4, opacity: 1 },
];

function StepDot({
  x,
  y,
  threshold,
  radius,
  litOpacity,
  color,
  progress,
}: {
  x: number;
  y: number;
  threshold: number;
  radius: number;
  litOpacity: number;
  color: string;
  progress: SharedValue<number>;
}) {
  // Apagado (a una fracción de su opacidad final) hasta que el viajero
  // pasa por este punto — mismo patrón que WaveDot en
  // WaveTravelerAnimation, pero acá cada punto "enciende" a su propia
  // opacidad de diseño (0.6 / 1 / 0.8), no siempre a 1.
  const animatedProps = useAnimatedProps(() => ({
    opacity: interpolate(
      progress.value,
      [threshold - 0.001, threshold],
      [litOpacity * 0.25, litOpacity],
      "clamp"
    ),
  }));

  return (
    <AnimatedCircle
      cx={x}
      cy={y}
      r={radius}
      fill={color}
      animatedProps={animatedProps}
    />
  );
}

const TRAVELER_RADIUS = 6;

function TravelerDot({ progress }: { progress: SharedValue<number> }) {
  // A diferencia de la onda (un trazo donde el punto viajero termina
  // volviendo cerca de su inicio), acá el camino es abierto: el extremo
  // final (132,28) no coincide con el inicial (28,124), así que el
  // reinicio de progress (1 → 0) es un salto real de posición. Se tapa
  // con el mismo truco que TravelerDot: el punto se vuelve invisible
  // justo antes/después de ese salto.
  const animatedProps = useAnimatedProps(() => {
    const point = getPointOnPolyline(
      progress.value,
      MAIN_PATH_POINTS,
      MAIN_PATH_BREAKPOINTS
    );

    return {
      cx: point.x,
      cy: point.y,
      opacity: interpolate(
        progress.value,
        [0, 0.05, 0.95, 1],
        [0, 1, 1, 0],
        "clamp"
      ),
    };
  });

  return (
    <AnimatedCircle
      r={TRAVELER_RADIUS}
      fill={TOUR_ACCENT_COLOR}
      animatedProps={animatedProps}
    />
  );
}

// Auto-contenida, sin props — maneja su propio loop internamente. Mismo
// contrato que WaveTravelerAnimation (ver ./index.ts).
export default function StepPathAnimation() {
  // Aparición suave al montar, igual que WaveTravelerAnimation.
  const opacity = useSharedValue(0);
  // Único shared value: progress de 0 a 1, sin reverse, a velocidad
  // constante real (no por tramos iguales) — ver getPointOnPolyline.
  const progress = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.ease),
    });

    progress.value = withRepeat(
      withTiming(1, { duration: LOOP_DURATION_MS, easing: Easing.linear }),
      -1
    );
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={fadeStyle}>
      <Svg width={160} height={160} viewBox="0 0 160 160">
        {/* Línea secundaria, fija, de fondo — primero en el árbol para
            quedar detrás de la línea principal. */}
        <Path
          d={SECONDARY_PATH_D}
          stroke={TOUR_ACCENT_COLOR}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.4}
          fill="none"
        />
        {SECONDARY_PATH_DOTS.map((dot, index) => (
          <Circle
            key={index}
            cx={dot.x}
            cy={dot.y}
            r={dot.radius}
            fill={TOUR_ACCENT_COLOR}
            opacity={dot.opacity}
          />
        ))}

        <Path
          d={MAIN_PATH_D}
          stroke={TOUR_ACCENT_COLOR}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
          fill="none"
        />
        {MAIN_PATH_DOTS.map((dot, index) => (
          <StepDot
            key={index}
            x={dot.x}
            y={dot.y}
            threshold={dot.threshold}
            radius={dot.radius}
            litOpacity={dot.litOpacity}
            color={dot.color}
            progress={progress}
          />
        ))}
        <TravelerDot progress={progress} />
      </Svg>
    </Animated.View>
  );
}
