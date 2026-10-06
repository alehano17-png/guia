import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeScene } from "../../components/home/HomeScene";
import { getUserDisplayName, useAuth } from "../../hooks/useAuth";
import { useTimeOfDay } from "../../hooks/useTimeOfDay";
import {
  HOME_BUBBLE_COLOR,
  HOME_BUTTON_TEXT_COLOR,
  HOME_MOMENT_THEMES,
} from "../../lib/homeTheme";
import { interpolate } from "../../lib/i18n/interpolate";
import { useTranslation } from "../../lib/i18n/useTranslation";
import { TOUR_TEXT_PRIMARY, TOUR_TEXT_SECONDARY } from "../../lib/tourTheme";
import {
  FONT_BOLD,
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_SIZE_LG,
  FONT_SIZE_MD,
  FONT_SIZE_TITLE,
  FONT_SIZE_XL,
} from "../../lib/typography";

// La escena se diseñó sobre un lienzo de 390x844 y se ancla abajo; todo lo
// que se posiciona desde el borde inferior se multiplica por esta escala
// para que mascota, globo y botón sigan pegados a las mismas colinas en
// cualquier tamaño de pantalla.
const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 844;
const MASCOT_SIZE = 260;

export default function StartScreen() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const timeOfDay = useTimeOfDay();
  const theme = HOME_MOMENT_THEMES[timeOfDay];
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const scale = Math.max(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
  const mascotSize = MASCOT_SIZE * scale;

  // Saludo según la hora local. Con sesión y nombre guardado lleva el
  // nombre; sin nombre (cuenta anterior al campo, o sin sesión) va solo.
  const displayName = getUserDisplayName(user);
  const greetings = t.home.greeting;
  const greeting = displayName
    ? interpolate(greetings[timeOfDay], { name: displayName })
    : greetings[
        `${timeOfDay}NoName` as "morningNoName" | "afternoonNoName" | "nightNoName"
      ];

  // Mascota flotando: sube 12px y baja, ciclo 4000ms, infinito.
  const mascotTranslateY = useSharedValue(0);

  useEffect(() => {
    mascotTranslateY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, []);

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: mascotTranslateY.value }],
  }));

  return (
    <View style={styles.root}>
      <StatusBar style={theme.statusBar} />
      <HomeScene timeOfDay={timeOfDay} />

      <Text
        style={[
          styles.brand,
          { top: insets.top + 16, color: theme.brandColor },
        ]}
      >
        GUÍA
      </Text>

      {/* Globo de saludo, con la colita apuntando a la mascota */}
      <View style={[styles.bubbleWrap, { bottom: 472 * scale }]}>
        <View style={styles.bubble}>
          <Text
            style={styles.bubbleGreeting}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {greeting}
          </Text>
          <Text style={styles.bubblePrompt}>{t.home.prompt}</Text>
        </View>
        <View style={styles.bubbleTail} />
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.mascotWrap,
          {
            width: mascotSize,
            height: mascotSize,
            left: (width - mascotSize) / 2,
            bottom: 232 * scale,
          },
          mascotAnimatedStyle,
        ]}
      >
        <Image
          source={require("../../assets/images/guia.png")}
          style={{ width: mascotSize, height: mascotSize }}
          resizeMode="contain"
        />
      </Animated.View>

      <Pressable
        style={[styles.button, { bottom: 68 * scale }]}
        accessibilityRole="button"
        onPress={() => router.push(user ? "/recomendations" : "/login")}
      >
        <Text style={styles.buttonText}>{t.home.start}</Text>
        <Ionicons
          name="arrow-forward"
          size={18}
          color={HOME_BUTTON_TEXT_COLOR}
        />
      </Pressable>

      {/* Enlaces bajo el botón, en una sola fila: "Cómo funciona" siempre,
          y "Cerrar sesión" solo con sesión, separados por un punto medio. */}
      <View
        style={[
          styles.linksRow,
          { bottom: Math.max(30 * scale, insets.bottom) },
        ]}
      >
        <Pressable
          style={styles.link}
          hitSlop={8}
          onPress={() =>
            router.push({ pathname: "/tutorial", params: { from: "home" } })
          }
        >
          <Text
            style={[
              styles.linkText,
              styles.linkTextUnderlined,
              { color: theme.signOutColor },
            ]}
          >
            {t.home.howItWorks}
          </Text>
        </Pressable>

        {/* Solo de prueba: para poder probar el flujo con/sin sesión sin
            desinstalar la app. No es un elemento final de esta pantalla. */}
        {user && (
          <>
            <Text style={[styles.linkText, { color: theme.signOutColor }]}>
              ·
            </Text>
            <Pressable
              style={styles.link}
              hitSlop={8}
              onPress={() => signOut()}
            >
              <Text style={[styles.linkText, { color: theme.signOutColor }]}>
                {t.home.signOut}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  brand: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_TITLE,
    letterSpacing: 5,
  },

  bubbleWrap: {
    position: "absolute",
    left: 36,
    right: 36,
    alignItems: "center",
  },

  bubble: {
    backgroundColor: HOME_BUBBLE_COLOR,
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    alignSelf: "center",
    maxWidth: "100%",
    shadowColor: "#1E145A",
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  bubbleGreeting: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_XL,
    color: TOUR_TEXT_PRIMARY,
    textAlign: "center",
  },

  bubblePrompt: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_LG,
    color: TOUR_TEXT_SECONDARY,
    marginTop: 6,
    textAlign: "center",
  },

  // Rombo blanco que asoma bajo el globo y hace de colita.
  bubbleTail: {
    width: 22,
    height: 22,
    backgroundColor: HOME_BUBBLE_COLOR,
    transform: [{ rotate: "45deg" }],
    marginTop: -11,
  },

  mascotWrap: {
    position: "absolute",
  },

  button: {
    position: "absolute",
    left: 24,
    right: 24,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0A0532",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },

  buttonText: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_MD,
    color: HOME_BUTTON_TEXT_COLOR,
    letterSpacing: 1,
  },

  linksRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  // Padding vertical menor que el 8 de antes para que la fila no toque el
  // botón en pantallas bajas (375x667); hitSlop compensa el área táctil.
  link: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  linkText: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_MD,
  },

  linkTextUnderlined: {
    textDecorationLine: "underline",
  },
});
