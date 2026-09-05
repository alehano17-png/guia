import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import {
  TOUR_ACCENT_COLOR,
  TOUR_GRADIENT_COLORS,
} from "../../lib/tourTheme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Onda decorativa de arriba: un path sinusoide punteado, dentro de un
// viewBox de 300x100.
const WAVE_D = "M 10,50 Q 55,10 100,50 T 190,50 T 280,50";

// Las 3 curvas de Bézier cuadráticas que arma el "d" de arriba
// (M 10,50 Q 55,10 100,50 T 190,50 T 280,50) — cada "T" refleja el
// control de la curva anterior respecto a su punto de unión, así que las
// reconstruimos a mano para poder ubicar un punto exacto sobre la curva
// real (no un atajo en línea recta entre puntos).
const WAVE_CURVES = [
  { p0: { x: 10, y: 50 }, c: { x: 55, y: 10 }, p2: { x: 100, y: 50 } },
  { p0: { x: 100, y: 50 }, c: { x: 145, y: 90 }, p2: { x: 190, y: 50 } },
  { p0: { x: 190, y: 50 }, c: { x: 235, y: 10 }, p2: { x: 280, y: 50 } },
];

// Posición exacta en t (0 a 1) sobre una curva de Bézier cuadrática.
function quadraticBezierPoint(
  t: number,
  p0: { x: number; y: number },
  c: { x: number; y: number },
  p2: { x: number; y: number }
) {
  "worklet";
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * c.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * c.y + t * t * p2.y,
  };
}

// Progress (0 a 1) → posición real sobre el trazo: 3 tramos iguales, uno
// por curva, cada uno resuelto con la fórmula de arriba sobre SU curva.
function getPointOnWavePath(progress: number) {
  "worklet";
  const segment = Math.min(Math.floor(progress * 3), 2);
  const localT = progress * 3 - segment;
  const curve = WAVE_CURVES[segment];

  return quadraticBezierPoint(localT, curve.p0, curve.c, curve.p2);
}

// Los 4 puntos marcados sobre el trazo, ubicados en t = 0.2, 0.4, 0.6, 0.8
// del recorrido total — su x,y sale de la curva real (getPointOnWavePath),
// no puesto a ojo.
const WAVE_POINT_STOPS = [0.2, 0.4, 0.6, 0.8];
const WAVE_POINTS = WAVE_POINT_STOPS.map((t) => ({
  ...getPointOnWavePath(t),
  t,
}));

type Props = {
  tourTitle: string;
};

const WAVE_POINT_RADIUS = 5;
const WAVE_TRAVELER_RADIUS = 6;

function WaveDot({
  x,
  y,
  threshold,
  progress,
}: {
  x: number;
  y: number;
  threshold: number;
  progress: SharedValue<number>;
}) {
  // Apagado hasta que la bolita pasa por este punto (progress llega a su
  // t), ahí se pone morado — un cambio limpio, no gradual. Como la
  // opacity se recalcula en base a progress en tiempo real, al reiniciar
  // el loop (progress vuelve a 0) el punto se apaga solo.
  const animatedProps = useAnimatedProps(() => ({
    opacity: interpolate(
      progress.value,
      [threshold - 0.001, threshold],
      [0.25, 1],
      "clamp"
    ),
  }));

  return (
    <AnimatedCircle
      cx={x}
      cy={y}
      r={WAVE_POINT_RADIUS}
      fill={TOUR_ACCENT_COLOR}
      animatedProps={animatedProps}
    />
  );
}

function TravelerDot({ progress }: { progress: SharedValue<number> }) {
  // Opacidad: se apaga entre 0.85 y 0.95, se mantiene invisible hasta 0.1
  // del siguiente ciclo (pausa real, no un cruce instantáneo) y recién
  // ahí reaparece, terminando de aparecer en 0.2 — tapa de sobra el salto
  // de posición que hace progress al reiniciar de 1 a 0.
  const animatedProps = useAnimatedProps(() => {
    // travelT: avance real sobre la curva, separado de progress (que
    // controla la opacidad) — coincide EXACTO con la ventana de
    // visibilidad (0.1 a 0.95), así que se mueve de forma continua
    // durante todo el tiempo que se ve (incluso mientras aparece/
    // desaparece gradualmente), y solo queda fija en la ventana 100%
    // invisible (0 a 0.1 y 0.95 a 1), donde no importa.
    const travelT = interpolate(progress.value, [0.1, 0.95], [0, 1], "clamp");
    const point = getPointOnWavePath(travelT);

    return {
      cx: point.x,
      cy: point.y,
      opacity: interpolate(
        progress.value,
        [0, 0.1, 0.2, 0.85, 0.95, 1],
        [0, 0, 1, 1, 0, 0],
        "clamp"
      ),
    };
  });

  return (
    <AnimatedCircle
      r={WAVE_TRAVELER_RADIUS}
      fill={TOUR_ACCENT_COLOR}
      animatedProps={animatedProps}
    />
  );
}

function WaveVisual() {
  // Aparición suave al montar — no hace falta que sea más compleja que eso.
  const opacity = useSharedValue(0);
  // Único shared value: progress de 0 a 1, sin reverse. progress 0 =
  // inicio real del trazo, progress 1 = final real del trazo.
  const progress = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.ease),
    });

    progress.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.linear }),
      -1
    );
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={fadeStyle}>
      <Svg width={260} height={90} viewBox="0 0 300 100">
        <Path
          d={WAVE_D}
          stroke={TOUR_ACCENT_COLOR}
          strokeWidth={2}
          strokeDasharray="4,4"
          strokeLinecap="round"
          fill="none"
        />
        {WAVE_POINTS.map((point, index) => (
          <WaveDot
            key={index}
            x={point.x}
            y={point.y}
            threshold={point.t}
            progress={progress}
          />
        ))}
        <TravelerDot progress={progress} />
      </Svg>
    </Animated.View>
  );
}

export default function TourLoadingScreen({ tourTitle }: Props) {
  const headline = `Preparando tu recorrido por ${tourTitle}`;

  return (
    <LinearGradient
      colors={TOUR_GRADIENT_COLORS}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <WaveVisual />

          <View style={styles.titleWrap}>
            {/* sombra/base, desplazada para simular profundidad — color
                distinto al del texto principal, si no el efecto no se ve */}
            <Text style={styles.titleShadow}>{headline}</Text>
            {/* texto principal */}
            <Text style={styles.title}>{headline}</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  titleWrap: {
    alignItems: "center",
    marginTop: 24,
  },

  titleShadow: {
    position: "relative",
    top: 3,
    left: 3,
    width: 300,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    fontSize: 24,
    color: "#C9B3EF",
    textAlign: "center",
  },

  title: {
    position: "absolute",
    top: 0,
    width: 300,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    fontSize: 24,
    color: "#4B3F8F",
    textAlign: "center",
  },
});
