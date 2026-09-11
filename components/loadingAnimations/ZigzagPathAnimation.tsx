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

const LOOP_DURATION_MS = 3500;

// Línea principal (la que recorre el punto viajero): 4 tramos rectos, de
// largo real DISTINTO (67.08 + 74.24 + 63.53 + 40.50 ≈ 245.35 unidades)
// — por eso los progress de sus vértices, abajo, no son parejos, sino
// proporcionales al largo real de cada tramo.
const MAIN_PATH_D = "M 22,108 L 52,48 L 86,114 L 116,58 L 138,92";
const MAIN_PATH_POINTS = [
  { x: 22, y: 108 },
  { x: 52, y: 48 },
  { x: 86, y: 114 },
  { x: 116, y: 58 },
  { x: 138, y: 92 },
];
// Progress (0 a 1) acumulado en cada vértice — el primero (22,108) es el
// propio punto de partida, en t=0.
const MAIN_PATH_BREAKPOINTS = [0, 0.2734, 0.576, 0.8349, 1];

// Línea secundaria: completamente fija, sin animar y sin puntos — solo
// fondo visual, como en el diseño original.
const SECONDARY_PATH_D = "M 36,100 L 68,38 L 102,104 L 132,52";

// Segundo tono de la marca — mismo que en StepPathAnimation y
// CircleOrbitAnimation, lo usa el punto de (86,114).
const POINT_SECONDARY_COLOR = "#5F4ED0";

// Los 5 puntos sobre los vértices de la línea principal. El primero
// (22,108) es donde arranca el viajero — no se "ilumina" al cruzarlo
// porque ya empieza ahí (su opacidad queda fija, no animada); los otros 4
// sí, con el mismo mecanismo de StepDot/WaveDot: apagados hasta que el
// viajero llega a su `threshold`, ahí saltan a su opacidad de diseño.
const START_DOT = { x: 22, y: 108, radius: 3, opacity: 0.5 };

const MAIN_PATH_DOTS: {
  x: number;
  y: number;
  threshold: number;
  radius: number;
  litOpacity: number;
  color: string;
}[] = [
  { x: 52, y: 48, threshold: 0.2734, radius: 4, litOpacity: 1, color: TOUR_ACCENT_COLOR },
  { x: 86, y: 114, threshold: 0.576, radius: 5, litOpacity: 1, color: POINT_SECONDARY_COLOR },
  { x: 116, y: 58, threshold: 0.8349, radius: 3.5, litOpacity: 0.8, color: TOUR_ACCENT_COLOR },
  { x: 138, y: 92, threshold: 0.97, radius: 3, litOpacity: 0.6, color: TOUR_ACCENT_COLOR },
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
  // pasa por este punto — mismo patrón que WaveDot/StepDot.
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
  // El camino es abierto: el extremo final (138,92) no coincide con el
  // inicial (22,108), así que el reinicio de progress (1 → 0) es un
  // salto real de posición — se tapa igual que en StepPathAnimation: el
  // punto se vuelve invisible justo antes/después de ese salto.
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
// contrato que WaveTravelerAnimation/StepPathAnimation (ver ./index.ts).
export default function ZigzagPathAnimation() {
  // Aparición suave al montar, igual que el resto de la biblioteca.
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
        {/* Línea secundaria, fija, de fondo, sin puntos — primero en el
            árbol para quedar detrás de la línea principal. */}
        <Path
          d={SECONDARY_PATH_D}
          stroke={TOUR_ACCENT_COLOR}
          strokeWidth={1}
          strokeLinejoin="round"
          opacity={0.35}
          fill="none"
        />

        <Path
          d={MAIN_PATH_D}
          stroke={TOUR_ACCENT_COLOR}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.65}
          fill="none"
        />
        <Circle
          cx={START_DOT.x}
          cy={START_DOT.y}
          r={START_DOT.radius}
          fill={TOUR_ACCENT_COLOR}
          opacity={START_DOT.opacity}
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
