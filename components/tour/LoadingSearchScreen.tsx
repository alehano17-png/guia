import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { TOUR_ACCENT_COLOR } from "../../lib/tourTheme";

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Longitud de trazo aproximada, holgada respecto al largo real de las
// formas de abajo — alcanza con que sea mayor o igual al largo real para
// que el truco de stroke-dasharray/offset dibuje/borre la forma completa.
const DASH_LENGTH = 900;

// Tres formas tipo "ruta de mapa" que se cruzan entre sí, dentro de un
// viewBox de 400x400.
const ROUTES = [
  {
    d: "M 50,300 Q 100,250 150,250 T 250,150 Q 300,100 350,150 L 320,280 Q 280,320 200,300 Z",
    dot: { cx: 200, cy: 300 },
    strokeWidth: 3,
    opacity: 0.8,
    delay: 0,
    duration: 4000,
  },
  {
    d: "M 80,100 L 120,180 Q 150,220 220,200 T 300,250 L 280,100 Z",
    dot: { cx: 220, cy: 200 },
    strokeWidth: 2,
    opacity: 0.6,
    delay: 500,
    duration: 4500,
  },
  {
    d: "M 200,50 Q 250,80 230,150 T 150,350 L 100,280 Z",
    dot: { cx: 150, cy: 350 },
    strokeWidth: 1.5,
    opacity: 0.4,
    delay: 1000,
    duration: 5000,
  },
];

function RouteLine({
  d,
  strokeWidth,
  opacity,
  delay,
  duration,
}: {
  d: string;
  strokeWidth: number;
  opacity: number;
  delay: number;
  duration: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Un ciclo completo: aparece dibujándose (0 → 0.5), se mantiene visible
  // y luego se borra hacia el otro extremo mientras se desvanece (→ 1).
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = interpolate(
      progress.value,
      [0, 0.5, 1],
      [DASH_LENGTH, 0, -DASH_LENGTH]
    );
    const lineOpacity = interpolate(
      progress.value,
      [0, 0.1, 0.9, 1],
      [0, opacity, opacity, 0],
      "clamp"
    );

    return { strokeDashoffset, opacity: lineOpacity };
  });

  // Aproximación del glow (React Native no soporta blur de SVG): la misma
  // forma dibujada dos veces, una copia más gruesa y tenue debajo (el
  // "halo") y la línea nítida real encima, ambas sincronizadas por el
  // mismo `progress`.
  const haloAnimatedProps = useAnimatedProps(() => {
    const strokeDashoffset = interpolate(
      progress.value,
      [0, 0.5, 1],
      [DASH_LENGTH, 0, -DASH_LENGTH]
    );
    const haloOpacity = interpolate(
      progress.value,
      [0, 0.1, 0.9, 1],
      [0, opacity * 0.35, opacity * 0.35, 0],
      "clamp"
    );

    return { strokeDashoffset, opacity: haloOpacity };
  });

  return (
    <>
      <AnimatedPath
        d={d}
        stroke={TOUR_ACCENT_COLOR}
        strokeWidth={strokeWidth + 3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={[DASH_LENGTH, DASH_LENGTH]}
        animatedProps={haloAnimatedProps}
      />
      <AnimatedPath
        d={d}
        stroke={TOUR_ACCENT_COLOR}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={[DASH_LENGTH, DASH_LENGTH]}
        animatedProps={animatedProps}
      />
    </>
  );
}

function BreathingRoutes() {
  // Respiración del conjunto completo, independiente del dibujado de cada
  // línea individual: un escalado continuo de ida y vuelta.
  const scale = useSharedValue(0.95);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={breathingStyle}>
      <Svg width={280} height={280} viewBox="0 0 400 400">
        {ROUTES.map((route, index) => (
          <RouteLine
            key={index}
            d={route.d}
            strokeWidth={route.strokeWidth}
            opacity={route.opacity}
            delay={route.delay}
            duration={route.duration}
          />
        ))}
        {ROUTES.map((route, index) => (
          <Circle
            key={`dot-${index}`}
            cx={route.dot.cx}
            cy={route.dot.cy}
            r={4}
            fill={TOUR_ACCENT_COLOR}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 250, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 250, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      )
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.Text style={[styles.title, dotStyle]}>.</Animated.Text>;
}

type Props = {
  title: string;
  subtitle: string;
};

export default function LoadingSearchScreen({ title, subtitle }: Props) {
  // Los "..." finales del copy se separan del texto base para animarse
  // en secuencia, como el indicador de "escribiendo" de un chat.
  const baseTitle = title.replace(/\.+$/, "");

  return (
    <LinearGradient
      colors={["#F3E8FF", "#D8B4FE", "#A78BFA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill}>
        <View style={styles.content}>
          <BreathingRoutes />
          <View style={styles.titleRow}>
            <Text style={styles.title}>{baseTitle}</Text>
            <TypingDot delay={0} />
            <TypingDot delay={150} />
            <TypingDot delay={300} />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    transform: [{ translateY: -30 }],
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },

  title: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    fontSize: 24,
    color: "#221B35",
    textAlign: "center",
  },
});
