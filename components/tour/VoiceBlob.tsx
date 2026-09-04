import React, { useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  SharedValue,
  useAnimatedProps,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Cantidad de puntos de control que definen el contorno del blob. Más
// puntos = deformaciones más suaves y orgánicas, pero también más costo
// por frame; 8 es el punto justo para que se vea como una gota, no una
// estrella.
const POINT_COUNT = 8;

// Respiración propia del modo "idle": una onda lenta y suave, sin ningún
// audio real detrás — para pantallas donde el blob todavía no tiene
// volumen que reflejar (ej. la de carga).
const IDLE_PERIOD_SECONDS = 2.5;
const IDLE_ENERGY_BASE = 0.16;
const IDLE_ENERGY_SWING = 0.12;

type Props = {
  // Volumen normalizado (0 a 1) que empuja la deformación del contorno.
  // Requerido cuando mode es "reactive" (el default); se ignora en "idle".
  energy?: SharedValue<number>;
  // "reactive" (default): se deforma según `energy`, el volumen real de
  // la voz. "idle": ignora `energy` y respira sola con una onda propia.
  mode?: "reactive" | "idle";
  color?: string;
  // Radio del blob en reposo (energy = 0), en píxeles.
  radius?: number;
  // Cuánto puede desviarse un punto del radio base, en píxeles, cuando
  // energy = 1.
  amplitude?: number;
  // Para posicionar el lienzo SVG (que mide (radius + amplitude) * 2)
  // dentro de un layout con hermanos posicionados absolutamente.
  style?: StyleProp<ViewStyle>;
};

export default function VoiceBlob({
  energy,
  mode = "reactive",
  color = "#D9D0FF",
  radius = 55,
  amplitude = 14,
  style,
}: Props) {
  const box = (radius + amplitude) * 2;
  const center = box / 2;

  // Fase aleatoria fija por punto, asignada una sola vez al montar — así
  // cada punto respira con un desfase propio en vez de moverse todos en
  // sincronía perfecta (lo cual se vería mecánico, no orgánico).
  // useState con inicializador (no useMemo): React garantiza que corre una
  // sola vez; useMemo puede descartarse y re-generar las fases.
  const [phases] = useState(() =>
    Array.from({ length: POINT_COUNT }, () => Math.random() * Math.PI * 2)
  );

  const time = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    const deltaSeconds = (frameInfo.timeSincePreviousFrame ?? 16.67) / 1000;
    time.value += deltaSeconds;
  });

  const animatedProps = useAnimatedProps(() => {
    const t = time.value;
    // En "idle" se ignora la energía recibida y se genera una onda propia,
    // lenta y de amplitud baja, reutilizando el mismo acumulador de tiempo
    // que ya avanza cada frame por el useFrameCallback de arriba.
    const e =
      mode === "idle"
        ? IDLE_ENERGY_BASE +
          IDLE_ENERGY_SWING *
            Math.sin((t * 2 * Math.PI) / IDLE_PERIOD_SECONDS)
        : energy?.value ?? 0;

    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < POINT_COUNT; i++) {
      const angle = (i / POINT_COUNT) * Math.PI * 2;
      const phase = phases[i];
      const offset =
        e *
        amplitude *
        (Math.sin(t * 1.4 + phase) * 0.6 +
          Math.sin(t * 2.3 + phase * 2.1) * 0.4);
      const r = radius + offset;
      points.push({
        x: center + Math.cos(angle) * r,
        y: center + Math.sin(angle) * r,
      });
    }

    // Catmull-Rom → Bezier cúbica, para que el contorno sea una curva
    // cerrada y suave en vez de una línea recta entre puntos (que se
    // vería como una estrella).
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < POINT_COUNT; i++) {
      const p0 = points[(i - 1 + POINT_COUNT) % POINT_COUNT];
      const p1 = points[i];
      const p2 = points[(i + 1) % POINT_COUNT];
      const p3 = points[(i + 2) % POINT_COUNT];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    d += " Z";

    return { d };
  });

  return (
    <Svg width={box} height={box} style={style}>
      <AnimatedPath animatedProps={animatedProps} fill={color} />
    </Svg>
  );
}
