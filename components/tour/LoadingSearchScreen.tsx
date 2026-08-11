import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { TOUR_ACCENT_COLOR } from "../../lib/tourTheme";

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Longitud de trazo aproximada, holgada respecto al largo real de las
// curvas de abajo — alcanza con que sea mayor o igual al largo real para
// que el truco de stroke-dasharray/offset dibuje la línea completa.
const DASH_LENGTH = 500;

// Tres curvas tipo "ruta de mapa" dentro de un viewBox de 320x240.
const ROUTES = [
  {
    d: "M 20,40 C 80,10 140,90 200,50 C 240,25 280,70 300,40",
    dot: { cx: 300, cy: 40 },
    delay: 0,
    duration: 4000,
  },
  {
    d: "M 10,120 C 70,150 130,80 190,130 C 230,160 270,110 310,140",
    dot: { cx: 310, cy: 140 },
    delay: 500,
    duration: 4500,
  },
  {
    d: "M 15,200 C 75,170 135,230 195,190 C 235,165 275,210 305,185",
    dot: { cx: 305, cy: 185 },
    delay: 1000,
    duration: 5000,
  },
];

function RouteLine({
  d,
  delay,
  duration,
}: {
  d: string;
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

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [DASH_LENGTH, 0]),
    opacity: interpolate(progress.value, [0, 0.08, 1], [0, 1, 1], "clamp"),
  }));

  return (
    <AnimatedPath
      d={d}
      stroke={TOUR_ACCENT_COLOR}
      strokeOpacity={0.5}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
      strokeDasharray={[DASH_LENGTH, DASH_LENGTH]}
      animatedProps={animatedProps}
    />
  );
}

type Props = {
  // Ciudad a mostrar en la píldora inferior — "Tours disponibles en {locationLabel}".
  locationLabel?: string;
};

export default function LoadingSearchScreen({
  locationLabel = "Lima",
}: Props) {
  return (
    <LinearGradient
      colors={["#F3E8FF", "#D8B4FE", "#A78BFA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill}>
        <View style={styles.routesWrap}>
          <Svg width="100%" height={220} viewBox="0 0 320 240">
            {ROUTES.map((route, index) => (
              <RouteLine
                key={index}
                d={route.d}
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
        </View>

        <View style={styles.bottomBlock}>
          <Text style={styles.title}>Buscando tours para ti</Text>

          <View style={styles.pill}>
            <Ionicons name="location" size={16} color={TOUR_ACCENT_COLOR} />
            <Text style={styles.pillText}>
              Tours disponibles en {locationLabel}
            </Text>
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

  routesWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#221B35",
    textAlign: "center",
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.55)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },

  pillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
});
