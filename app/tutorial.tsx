import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  cancelAnimation,
  Easing,
  type SharedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import VoiceBlob from "../components/tour/VoiceBlob";
import { HOME_BUTTON_TEXT_COLOR } from "../lib/homeTheme";
import type { TranslationDictionary } from "../lib/i18n";
import { useTranslation } from "../lib/i18n/useTranslation";
import {
  TOUR_ACCENT_COLOR,
  TOUR_GRADIENT_COLORS,
  TOUR_TEXT_MUTED,
  TOUR_TEXT_PRIMARY,
  TOUR_TEXT_SECONDARY,
} from "../lib/tourTheme";
import { markTutorialSeen } from "../lib/tutorialSeen";
import {
  FONT_BOLD,
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_SIZE_MD,
  FONT_SIZE_SM,
} from "../lib/typography";

// Misma escala que la pantalla de inicio (lienzo de 390x844): el botón y
// los puntitos se anclan abajo exactamente igual que "EMPEZAR".
const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 844;

const STEP_COUNT = 3;

const BUTTON_HEIGHT = 60;
const DOT_SIZE = 8;
const DOTS_GAP = 20; // entre los puntitos y el botón
const TEXT_GAP = 20; // entre el texto y los puntitos
// Alto reservado para el texto: título de hasta 2 líneas (34 c/u) +
// separación + descripción de hasta 3 líneas (24 c/u). Reservado fijo para
// que el título arranque a la misma altura en los 3 pasos.
const TEXT_BLOCK_HEIGHT = 34 * 2 + 10 + 24 * 3;
const SKIP_HEIGHT = 24;

// Mascota + tarjeta ("hero"). En pantallas bajas (ej. 375x667) no entran a
// tamaño completo: la tarjeta se achica hasta MIN_CARD_SCALE y la mascota
// cede el resto del espacio, hasta MIN_MASCOT_SIZE.
const MASCOT_SIZE = 150;
// 56 (no 64) para que, con la tarjeta de 222, mascota + tarjeta sigan
// entrando en 375x667 sin comerse el espacio que las separa del texto.
const MIN_MASCOT_SIZE = 56;
const MASCOT_GAP = 8;
const CARD_WIDTH = 300;
// Alto fijo para los 3 pasos, así nada salta al cambiar de paso: el del
// paso más alto (el 2: etiqueta + título + halo de 86 + píldora, más el
// padding de 18 arriba y abajo). Los otros dos se centran adentro.
const CARD_HEIGHT = 222;
const MIN_CARD_SCALE = 0.85;

// Bola de voz del paso 2: la misma VoiceBlob del tour, en chiquito.
const BLOB_RADIUS = 30;
const BLOB_AMPLITUDE = 7;
const BLOB_BOX = (BLOB_RADIUS + BLOB_AMPLITUDE) * 2;
const HALO_SIZE = BLOB_BOX + 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type DemoTexts = TranslationDictionary["tutorial"]["demo"];

export default function TutorialScreen() {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ from?: string }>();
  // Desde "Cómo funciona" (home) se vuelve atrás; la primera vez (llegó
  // redirigido desde Recomendaciones) se sigue a Recomendaciones.
  const fromHome = params.from === "home";

  const [step, setStep] = useState(0);
  const fade = useState(() => new Animated.Value(1))[0];
  const isChangingStepRef = useRef(false);

  const finish = useCallback(() => {
    markTutorialSeen();
    if (fromHome && router.canGoBack()) {
      router.back();
    } else {
      router.replace("/recomendations");
    }
  }, [fromHome]);

  // Botón/gesto de atrás de Android: la primera vez cuenta como "Saltar"
  // (marca el tutorial como visto y sigue a Recomendaciones). Desde el
  // home, atrás se comporta normal.
  useEffect(() => {
    if (fromHome) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        finish();
        return true;
      }
    );
    return () => subscription.remove();
  }, [fromHome, finish]);

  // Fade corto entre pasos; ignora toques repetidos mientras dura.
  const goToStep = (nextStep: number) => {
    if (isChangingStepRef.current) return;
    isChangingStepRef.current = true;

    Animated.timing(fade, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      Animated.timing(fade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        isChangingStepRef.current = false;
      });
    });
  };

  const isLastStep = step === STEP_COUNT - 1;
  const onPrimaryPress = () => {
    if (isLastStep) {
      finish();
    } else {
      goToStep(step + 1);
    }
  };

  // Energía simulada para la bola de voz del paso 2: no hay audio real,
  // así que oscila con tiempos irregulares para que parezca alguien
  // hablando y no un latido. Solo corre mientras ese paso está visible.
  const voiceEnergy = useSharedValue(0.3);
  const isVoiceStep = step === 1;

  useEffect(() => {
    if (!isVoiceStep) return;

    const ease = Easing.inOut(Easing.ease);
    voiceEnergy.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 260, easing: ease }),
        withTiming(0.35, { duration: 340, easing: ease }),
        withTiming(0.7, { duration: 220, easing: ease }),
        withTiming(0.25, { duration: 450, easing: ease }),
        withTiming(0.9, { duration: 300, easing: ease }),
        withTiming(0.45, { duration: 200, easing: ease }),
        withTiming(0.75, { duration: 380, easing: ease }),
        withTiming(0.3, { duration: 290, easing: ease })
      ),
      -1
    );

    return () => cancelAnimation(voiceEnergy);
  }, [isVoiceStep, voiceEnergy]);

  // Posiciones verticales, de abajo hacia arriba: botón (igual que en el
  // home), puntitos, bloque de texto; arriba de todo "Saltar". El hero se
  // centra en el espacio que queda entre "Saltar" y el texto.
  const scale = Math.max(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
  const buttonBottom = 68 * scale;
  const dotsBottom = buttonBottom + BUTTON_HEIGHT + DOTS_GAP;
  const textTop = height - (dotsBottom + DOT_SIZE + TEXT_GAP) - TEXT_BLOCK_HEIGHT;
  const skipTop = insets.top + 16;
  const heroTop = skipTop + SKIP_HEIGHT + 8;
  const heroAvailable = textTop - 16 - heroTop;

  const cardScale = clamp(
    (heroAvailable - MASCOT_GAP - MASCOT_SIZE) / CARD_HEIGHT,
    MIN_CARD_SCALE,
    1
  );
  const cardHeight = CARD_HEIGHT * cardScale;
  const mascotSize = clamp(
    heroAvailable - MASCOT_GAP - cardHeight,
    MIN_MASCOT_SIZE,
    MASCOT_SIZE
  );
  const heroHeight = mascotSize + MASCOT_GAP + cardHeight;
  const heroOffset = heroTop + Math.max(0, (heroAvailable - heroHeight) / 2);

  const steps = [
    { title: t.tutorial.step1Title, body: t.tutorial.step1Body },
    { title: t.tutorial.step2Title, body: t.tutorial.step2Body },
    { title: t.tutorial.step3Title, body: t.tutorial.step3Body },
  ];
  const current = steps[step];
  const demo = t.tutorial.demo;

  return (
    <LinearGradient
      colors={TOUR_GRADIENT_COLORS}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <StatusBar style="dark" />
      {/* La primera vez, el gesto de volver de iOS tampoco debe sacar a la
          persona sin marcar el tutorial como visto: se desactiva. */}
      <Stack.Screen options={{ gestureEnabled: fromHome }} />

      <Animated.View
        pointerEvents="none"
        style={[styles.hero, { top: heroOffset, opacity: fade }]}
      >
        <Image
          source={require("../assets/images/guia.png")}
          style={{ width: mascotSize, height: mascotSize }}
          resizeMode="contain"
        />

        {/* El lugar ocupa el tamaño ya escalado; la tarjeta adentro se
            dibuja a tamaño natural y se achica con transform. */}
        <View
          style={{
            width: CARD_WIDTH * cardScale,
            height: cardHeight,
            marginTop: MASCOT_GAP,
          }}
        >
          <View
            style={[
              styles.card,
              {
                left: (CARD_WIDTH * cardScale - CARD_WIDTH) / 2,
                top: (cardHeight - CARD_HEIGHT) / 2,
                transform: [{ scale: cardScale }],
              },
            ]}
          >
            {step === 0 ? <LanguageDemo demo={demo} /> : null}
            {step === 1 ? <VoiceDemo demo={demo} energy={voiceEnergy} /> : null}
            {step === 2 ? <ChatDemo demo={demo} /> : null}
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={[styles.textBlock, { top: textTop, opacity: fade }]}
      >
        <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>
          {current.title}
        </Text>
        <Text style={styles.body} numberOfLines={3} adjustsFontSizeToFit>
          {current.body}
        </Text>
      </Animated.View>

      <View style={[styles.dots, { bottom: dotsBottom }]}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === step && styles.dotActive]}
          />
        ))}
      </View>

      <Pressable
        style={[styles.button, { bottom: buttonBottom }]}
        accessibilityRole="button"
        onPress={onPrimaryPress}
      >
        <Text style={styles.buttonText}>
          {isLastStep ? t.tutorial.done : t.tutorial.next}
        </Text>
        {isLastStep ? null : (
          <Ionicons
            name="arrow-forward"
            size={18}
            color={HOME_BUTTON_TEXT_COLOR}
          />
        )}
      </Pressable>

      <Pressable
        style={[styles.skip, { top: skipTop }]}
        accessibilityRole="button"
        hitSlop={12}
        onPress={finish}
      >
        <Text style={styles.skipText}>{t.tutorial.skip}</Text>
      </Pressable>
    </LinearGradient>
  );
}

// Paso 1: el tour elegido y la elección de idioma, como en la hoja real.
function LanguageDemo({ demo }: { demo: DemoTexts }) {
  return (
    <View>
      {/* La caja recorta la foto con sus propias esquinas redondeadas. */}
      <View style={styles.tourRow}>
        <Image
          source={require("../assets/images/barranco.jpg")}
          style={styles.tourImage}
        />
        <View style={styles.tourTexts}>
          <Text style={styles.tourName}>{demo.tourName}</Text>
          <Text style={styles.tourDesc}>{demo.tourDesc}</Text>
        </View>
      </View>

      <Text style={styles.languageQuestion}>{demo.languageQuestion}</Text>

      {/* Los nombres de idioma no se traducen, igual que en la hoja real. */}
      <View style={styles.chips}>
        <View style={[styles.chip, styles.chipSelected]}>
          <Text style={[styles.chipText, styles.chipTextSelected]}>Español</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>English</Text>
        </View>
      </View>
    </View>
  );
}

// Paso 2: la parada actual con la bola de voz real hablando.
function VoiceDemo({
  demo,
  energy,
}: {
  demo: DemoTexts;
  energy: SharedValue<number>;
}) {
  return (
    <View style={styles.voiceDemo}>
      <Text style={styles.stopLabel}>{demo.stopLabel}</Text>
      <Text style={styles.stopTitle}>{demo.stopTitle}</Text>

      <View style={styles.voiceStage}>
        <View style={styles.voiceHalo} />
        <VoiceBlob
          energy={energy}
          mode="reactive"
          color={TOUR_ACCENT_COLOR}
          radius={BLOB_RADIUS}
          amplitude={BLOB_AMPLITUDE}
          style={styles.voiceBlob}
        />
      </View>

      <View style={styles.nextPill}>
        <Text style={styles.nextPillText}>{`${demo.nextPill}  →`}</Text>
      </View>
    </View>
  );
}

// Paso 3: una pregunta, la respuesta y la misma barra de entrada del chat.
function ChatDemo({ demo }: { demo: DemoTexts }) {
  return (
    <View>
      <View style={[styles.bubble, styles.bubbleUser]}>
        <Text style={styles.bubbleTextUser}>{demo.question}</Text>
      </View>

      <View style={[styles.bubble, styles.bubbleGuide]}>
        <Text style={styles.bubbleTextGuide}>{demo.answer}</Text>
      </View>

      {/* Copia visual de chatInputBar de TourChatSheet (decorativa, no es
          un TextInput). */}
      <View style={styles.chatInputBar}>
        <Ionicons name="mic" size={18} color={TOUR_TEXT_MUTED} />
        <Text style={styles.chatInputPlaceholder} numberOfLines={1}>
          {demo.inputPlaceholder}
        </Text>
        <Ionicons name="send" size={18} color={TOUR_ACCENT_COLOR} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  skip: {
    position: "absolute",
    right: 24,
  },

  skipText: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_MD,
    color: "#4A3F8F",
  },

  hero: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },

  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 18,
    justifyContent: "center",
    shadowColor: "#1E145A",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  // Paso 1
  tourRow: {
    flexDirection: "row",
    backgroundColor: "#F6F2FF",
    borderRadius: 18,
    overflow: "hidden",
    height: 84,
  },

  tourImage: {
    width: 84,
    height: 84,
  },

  tourTexts: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },

  tourName: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: 16,
    color: TOUR_TEXT_PRIMARY,
  },

  tourDesc: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: 13,
    color: TOUR_TEXT_MUTED,
    marginTop: 2,
  },

  languageQuestion: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: 13,
    color: TOUR_TEXT_MUTED,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 10,
  },

  chips: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#F1ECFF",
  },

  chipSelected: {
    backgroundColor: TOUR_ACCENT_COLOR,
  },

  chipText: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: 14,
    color: "#5B4BC4",
  },

  chipTextSelected: {
    color: "#FFFFFF",
  },

  // Paso 2
  voiceDemo: {
    alignItems: "center",
  },

  stopLabel: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: 12,
    color: TOUR_ACCENT_COLOR,
    textAlign: "center",
  },

  stopTitle: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: 18,
    color: TOUR_TEXT_PRIMARY,
    textAlign: "center",
    marginTop: 4,
  },

  voiceStage: {
    width: HALO_SIZE,
    height: HALO_SIZE,
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  // Halo de fondo, un poco más grande que la bola (como en
  // TourNarrationBlock).
  voiceHalo: {
    position: "absolute",
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: HALO_SIZE / 2,
    backgroundColor: "rgba(124,111,224,0.14)",
  },

  voiceBlob: {
    position: "absolute",
    top: (HALO_SIZE - BLOB_BOX) / 2,
    left: (HALO_SIZE - BLOB_BOX) / 2,
  },

  // Ancho completo de la tarjeta (stretch pisa el alignItems center del
  // contenedor).
  nextPill: {
    alignSelf: "stretch",
    marginTop: 6,
    backgroundColor: TOUR_ACCENT_COLOR,
    borderRadius: 999,
    paddingVertical: 12,
  },

  nextPillText: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
  },

  // Paso 3
  bubble: {
    padding: 12,
    borderRadius: 18,
  },

  bubbleUser: {
    alignSelf: "flex-end",
    maxWidth: 220,
    borderBottomRightRadius: 4,
    backgroundColor: TOUR_ACCENT_COLOR,
  },

  bubbleGuide: {
    alignSelf: "flex-start",
    maxWidth: 240,
    borderBottomLeftRadius: 4,
    backgroundColor: "#F1ECFF",
    marginTop: 10,
  },

  bubbleTextUser: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: 14,
    color: "#FFFFFF",
  },

  bubbleTextGuide: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: 14,
    color: TOUR_TEXT_PRIMARY,
  },

  chatInputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 26,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    marginTop: 14,
  },

  chatInputPlaceholder: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_SM,
    color: "#9CA3AF",
  },

  // Texto del paso
  textBlock: {
    position: "absolute",
    left: 0,
    right: 0,
    height: TEXT_BLOCK_HEIGHT,
    paddingHorizontal: 32,
  },

  title: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: 28,
    lineHeight: 34,
    color: TOUR_TEXT_PRIMARY,
    textAlign: "center",
  },

  body: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_MD,
    lineHeight: 24,
    color: TOUR_TEXT_SECONDARY,
    textAlign: "center",
    marginTop: 10,
  },

  dots: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: "rgba(255,255,255,0.5)",
  },

  dotActive: {
    width: 24,
    backgroundColor: "#FFFFFF",
  },

  // Igual que el botón "EMPEZAR" de app/(tabs)/index.tsx.
  button: {
    position: "absolute",
    left: 24,
    right: 24,
    height: BUTTON_HEIGHT,
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
    textTransform: "uppercase",
  },
});
