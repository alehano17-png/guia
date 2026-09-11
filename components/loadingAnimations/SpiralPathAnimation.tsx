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

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const LOOP_DURATION_MS = 4000;

// Segundo tono de la marca — mismo que en Step/ZigzagPathAnimation, lo
// usa el punto de (38,64).
const POINT_SECONDARY_COLOR = "#5F4ED0";

// La espiral: 4 arcos de círculo consecutivos, cada uno con su propio
// centro/radio (a diferencia de CircleOrbitAnimation, que orbita un único
// centro fijo). Parámetros geométricos exactos, no puestos a ojo — cada
// arco empieza justo donde termina el anterior (verificado a mano contra
// los 5 puntos de unión antes de escribir esto).
type Arc = {
  center: { x: number; y: number };
  radius: number;
  startAngleDeg: number;
  endAngleDeg: number;
};

const ARCS: Arc[] = [
  { center: { x: 80, y: 92 }, radius: 12, startAngleDeg: -90, endAngleDeg: 0 },
  { center: { x: 68.85, y: 80.16 }, radius: 26, startAngleDeg: 27.1, endAngleDeg: 96.3 },
  { center: { x: 79.93, y: 66.38 }, radius: 42, startAngleDeg: 109.37, endAngleDeg: 183.25 },
  { center: { x: 91.85, y: 85.55 }, radius: 58, startAngleDeg: -158.19, endAngleDeg: -58.68 },
];

// El "d" real del path: un solo trazo continuo con 4 comandos de arco
// SVG (A rx,ry rotación large-arc-flag sweep-flag x,y), no 4 paths
// separados. Todos los arcos miden menos de 180° (large-arc-flag 0) y
// barren en la misma dirección (sweep-flag 1, la que da la fórmula
// cx+r·cosθ / cy+r·senθ tal cual, sin invertir nada).
const MAIN_PATH_D =
  "M 80,80" +
  " A 12,12 0 0,1 92,92" +
  " A 26,26 0 0,1 66,106" +
  " A 42,42 0 0,1 38,64" +
  " A 58,58 0 0,1 122,36";

// Progress (0 a 1) acumulado en cada unión entre arcos, proporcional al
// largo real de cada arco (no arcos iguales).
const ARC_BREAKPOINTS = [0, 0.0919, 0.245, 0.5089, 1];

// Posición exacta sobre la espiral en un progress dado (0 a 1): ubica en
// qué arco cae (mismo escaneo de breakpoints que getPointOnPolyline) y
// resuelve el ángulo real sobre ESE arco — interpolación lineal de
// ángulo, no de punto, ya que cada tramo es un arco, no una recta.
function getPointOnSpiral(progress: number) {
  "worklet";
  let segment = ARC_BREAKPOINTS.length - 2;
  for (let i = 0; i < ARC_BREAKPOINTS.length - 1; i++) {
    if (progress <= ARC_BREAKPOINTS[i + 1]) {
      segment = i;
      break;
    }
  }

  const segStart = ARC_BREAKPOINTS[segment];
  const segEnd = ARC_BREAKPOINTS[segment + 1];
  const localT =
    segEnd > segStart ? (progress - segStart) / (segEnd - segStart) : 0;

  const arc = ARCS[segment];
  const angleDeg =
    arc.startAngleDeg + (arc.endAngleDeg - arc.startAngleDeg) * localT;
  const angleRad = (angleDeg * Math.PI) / 180;

  return {
    x: arc.center.x + arc.radius * Math.cos(angleRad),
    y: arc.center.y + arc.radius * Math.sin(angleRad),
  };
}

// El punto de partida (80,80) — el viajero arranca ahí mismo, así que no
// se "ilumina" al cruzarlo (igual que en ZigzagPathAnimation): un Circle
// estático normal, sin animatedProps.
const START_DOT = { x: 80, y: 80, radius: 2.5, opacity: 0.5 };

// Los otros 4 puntos, en las uniones entre arcos — el último usa 0.97 en
// vez de 1.0 exacto, para que se quede encendido un momento antes de que
// el loop reinicie (mismo ajuste que ya se aplicó en ZigzagPathAnimation).
const MAIN_PATH_DOTS: {
  x: number;
  y: number;
  threshold: number;
  radius: number;
  litOpacity: number;
  color: string;
}[] = [
  { x: 92, y: 92, threshold: 0.0919, radius: 3.5, litOpacity: 0.7, color: TOUR_ACCENT_COLOR },
  { x: 66, y: 106, threshold: 0.245, radius: 4, litOpacity: 1, color: TOUR_ACCENT_COLOR },
  { x: 38, y: 64, threshold: 0.5089, radius: 5, litOpacity: 1, color: POINT_SECONDARY_COLOR },
  { x: 122, y: 36, threshold: 0.97, radius: 3, litOpacity: 0.6, color: TOUR_ACCENT_COLOR },
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
  // El camino es abierto: el extremo final (122,36) no coincide con el
  // inicial (80,80), así que el reinicio de progress (1 → 0) es un salto
  // real de posición — se tapa igual que en Step/ZigzagPathAnimation: el
  // punto se vuelve invisible justo antes/después de ese salto.
  const animatedProps = useAnimatedProps(() => {
    const point = getPointOnSpiral(progress.value);

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
// contrato que el resto de la biblioteca (ver ./index.ts).
export default function SpiralPathAnimation() {
  // Aparición suave al montar, igual que el resto de la biblioteca.
  const opacity = useSharedValue(0);
  // Único shared value: progress de 0 a 1, sin reverse, a velocidad
  // constante real por longitud de arco (no arcos iguales) — ver
  // getPointOnSpiral.
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
        <Path
          d={MAIN_PATH_D}
          stroke={TOUR_ACCENT_COLOR}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          strokeLinecap="round"
          opacity={0.75}
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
