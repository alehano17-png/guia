import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { TOUR_ACCENT_COLOR } from "../../lib/tourTheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PARTICLE_COUNT = 6;

type ParticleConfig = {
  id: number;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
};

function AmbientParticle({ config }: { config: ParticleConfig }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(0.8, {
            duration: config.duration * 0.25,
            easing: Easing.linear,
          }),
          withTiming(0.8, {
            duration: config.duration * 0.35,
            easing: Easing.linear,
          }),
          withTiming(0, {
            duration: config.duration * 0.4,
            easing: Easing.linear,
          })
        ),
        -1
      )
    );

    translateY.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(-100, {
          duration: config.duration,
          easing: Easing.linear,
        }),
        -1
      )
    );

    scale.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(0.5, {
          duration: config.duration,
          easing: Easing.linear,
        }),
        -1
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const particleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          top: `${config.top}%`,
          left: `${config.left}%`,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
        },
        particleStyle,
      ]}
    />
  );
}

function AmbientParticles() {
  const particles = useMemo<ParticleConfig[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, id) => ({
        id,
        top: Math.random() * 90,
        left: Math.random() * 90,
        size: 4 + Math.random() * 6, // 4-10px
        duration: 4000 + Math.random() * 3000, // 4000-7000ms
        delay: Math.random() * 2000, // hasta 2000ms
      })),
    []
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((config) => (
        <AmbientParticle key={config.id} config={config} />
      ))}
    </View>
  );
}

export default function StartScreen() {
  // 1. Logo flotando: sube 12px y baja, ciclo 4000ms, infinito, ease-in-out
  const logoTranslateY = useSharedValue(0);

  useEffect(() => {
    logoTranslateY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoTranslateY.value }],
  }));

  // 3. Brillo del botón: una sola pasada, al montar la pantalla
  const shineTranslateX = useSharedValue(-SCREEN_WIDTH);

  useEffect(() => {
    shineTranslateX.value = withTiming(SCREEN_WIDTH, {
      duration: 1500,
      easing: Easing.linear,
    });
  }, []);

  const shineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shineTranslateX.value },
      { rotate: "20deg" },
    ],
  }));

  return (
    <LinearGradient
  colors={["#F3E8FF", "#D8B4FE", "#A78BFA"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={{ flex: 1 }}
>
<SafeAreaView style={styles.container}>

  <AmbientParticles />

  <View style={styles.topBlock}>

    <Animated.View style={[styles.logoWrap, logoAnimatedStyle]}>
      <Image
        source={require("../../assets/images/guia.png")}
        style={styles.logo}
      />
    </Animated.View>

    <View style={styles.textBlock}>
      <Text style={styles.title}>
        Hola, soy
      </Text>

      <View>
        {/* sombra/base */}
        <Text style={styles.mainTitleShadow}>
          GUÍA
        </Text>

        {/* texto principal */}
        <Text style={styles.mainTitle}>
          GUÍA
        </Text>
      </View>

      <Text style={styles.subtitle}>
        Compañía a tu modo
      </Text>
    </View>

  </View>

  <Pressable
    style={styles.button}
    onPress={() => router.push("/recomendations")}
  >
    {/* brillo/vidrio sutil en la mitad superior */}
    <View style={styles.buttonShine} />

    {/* brillo animado que cruza el botón una sola vez al aparecer */}
    <Animated.View
      style={[styles.buttonSweep, shineAnimatedStyle]}
      pointerEvents="none"
    />

    <View style={styles.buttonContent}>
      <Text style={styles.buttonText}>EMPEZAR</Text>
      <Ionicons name="arrow-forward" size={18} color="#FFF" />
    </View>
  </Pressable>

</SafeAreaView>
</LinearGradient>
  );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  paddingHorizontal: 24,
  paddingTop: 20,
  paddingBottom: 110,
  alignItems: "center",
  justifyContent: "center",

},


  button: {
  alignSelf: "center",
  marginTop: 20,
  backgroundColor: TOUR_ACCENT_COLOR,
  shadowColor: TOUR_ACCENT_COLOR,
  shadowOpacity: 0.4,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 999,
  overflow: "hidden",
  transform: [{ translateY: 60 }],
},

buttonContent: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

buttonShine: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "50%",
  backgroundColor: "rgba(255,255,255,0)",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
},

buttonSweep: {
  position: "absolute",
  top: -40,
  bottom: -40,
  width: 60,
  backgroundColor: "rgba(255,255,255,0.45)",
},

  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
topBlock: {
  alignItems: "center",
},

textBlock: {
  alignItems: "center",
  transform: [{ translateY: 30 }],
},

logoWrap: {
  width: 260,
  height: 260,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: -30,
},

logo: {
  width: 260,
  height: 260,
  resizeMode: "contain",
  transform: [{ translateY: -30 }],
},

title: {
  fontSize: 22,
  color: "#374151",
  marginTop: 10,
},

subtitle: {
  fontSize: 16,
  color: "#4B5563",
  textAlign: "center",
  maxWidth: 280,
  lineHeight: 22,
},


mainTitle: {
  position: "absolute",
  fontSize: 42,
  fontWeight: "900",
  color: TOUR_ACCENT_COLOR,
},

mainTitleShadow: {
  position: "relative",
  top: 3,
  left: 3,
  fontSize: 42,
  fontWeight: "900",
  color: TOUR_ACCENT_COLOR,
},

particle: {
  position: "absolute",
  backgroundColor: "rgba(255,255,255,0.4)",
},

});
