import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SharedValue } from "react-native-reanimated";
import { GuiaVoiceStatus } from "../../hooks/useGuiaVoiceMode";
import { useTranslation } from "../../lib/i18n/useTranslation";
import { TOUR_ACCENT_COLOR, TOUR_TEXT_PRIMARY } from "../../lib/tourTheme";
import { FONT_REGULAR, FONT_SIZE_XS } from "../../lib/typography";
import VoiceBlob from "./VoiceBlob";

// El globo va siempre a tamaño completo (GLOBE_SIZE, = voiceOuter); la
// escala es solo un respaldo de emergencia para cuando físicamente no cabe
// (pantallas muy chicas), y se aplica SOLO al globo: la píldora queda
// siempre a tamaño normal para que se lea y se pueda tocar.
const GLOBE_SIZE = 200;
// Alto de la píldora "Toca para hablar": paddingVertical 8 + 8 más una
// línea de texto XS (~18). Margen entre globo y píldora = askPill.marginTop.
const ASK_PILL_HEIGHT = 34;
const ASK_PILL_GAP = 20;
// Respiro mínimo arriba y abajo del bloque (16 c/u), para que la tarjeta
// de abajo nunca quede pegada a la píldora. Escala mínima: el globo no
// llega a desaparecer.
const BREATHING_SPACE = 16;
const MIN_SCALE = 0.5;

type Props = {
  pulseAnim: Animated.Value;
  voiceEnergy: SharedValue<number>;
  guiaVoiceStatus: GuiaVoiceStatus;
  onAskGuia: () => void;
};

export default function TourNarrationBlock({
  pulseAnim,
  voiceEnergy,
  guiaVoiceStatus,
  onAskGuia,
}: Props) {
  const { t } = useTranslation();
  // Texto de la píldora según el estado del modo de voz de GUÍA.
  const guiaStatusLabel: Record<GuiaVoiceStatus, string> = {
    idle: t.guia.statusIdle,
    listening: t.guia.statusListening,
    thinking: t.guia.statusThinking,
    speaking: t.guia.statusSpeaking,
    error: t.guia.statusError,
  };

  // Solo se puede tocar en reposo o tras un error — mientras escucha,
  // piensa o habla, ya hay una pregunta en curso y no debe dispararse otra.
  const isGuiaBusy =
    guiaVoiceStatus !== "idle" && guiaVoiceStatus !== "error";

  const [scale, setScale] = useState(1);
  const handleLayout = (e: LayoutChangeEvent) => {
    const availableForGlobe =
      e.nativeEvent.layout.height -
      BREATHING_SPACE * 2 -
      ASK_PILL_HEIGHT -
      ASK_PILL_GAP;
    const next = Math.max(
      MIN_SCALE,
      Math.min(1, availableForGlobe / GLOBE_SIZE)
    );
    setScale((prev) => (Math.abs(prev - next) > 0.01 ? next : prev));
  };

  return (
    <View style={styles.centerBlock} onLayout={handleLayout}>
      {/* transform no cambia el espacio que ocupa: esta caja toma el tamaño
          ya escalado, y el globo (a tamaño natural) se achica centrado
          adentro. Así la píldora queda pegada al globo con su margen. */}
      <View
        style={[
          styles.globeBox,
          { width: GLOBE_SIZE * scale, height: GLOBE_SIZE * scale },
        ]}
      >
        <View style={{ transform: [{ scale }] }}>
          <View style={styles.voiceContainer}>
            <View style={styles.voiceOuter}>
              <View style={styles.voiceAmbientGlow} />

              <VoiceBlob
                energy={voiceEnergy}
                color={TOUR_ACCENT_COLOR}
                radius={52}
                amplitude={12}
                style={styles.voiceBlobWrap}
              />

              <Animated.View
                style={[
                  styles.voiceInnerGlow,
                  {
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [1, 1.3],
                          outputRange: [1, 1.3],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.3],
                      outputRange: [0.14, 0.22],
                      extrapolate: "clamp",
                    }),
                  },
                ]}
              />

              <View style={styles.voiceShine} />
              <View style={styles.voiceGlass} />
            </View>
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.askPill, isGuiaBusy && styles.askPillDisabled]}
        onPress={onAskGuia}
        disabled={isGuiaBusy}
      >
        <Ionicons name="mic" size={16} color={TOUR_ACCENT_COLOR} />
        <Text style={styles.askTip}>{guiaStatusLabel[guiaVoiceStatus]}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // flex: 1 + justifyContent center: el globo y su píldora quedan
  // centrados en el espacio libre entre el header y lo de abajo.
  centerBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  globeBox: {
    alignItems: "center",
    justifyContent: "center",
  },

  voiceContainer: {
    alignItems: "center",
  },

  voiceOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    backgroundColor: "rgba(255,255,255,0.16)",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
  },

  // El lienzo del VoiceBlob mide (radius + amplitude) * 2 = (52 + 12) * 2 =
  // 128, así que se centra igual que el resto de las capas del globo.
  voiceBlobWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -64,
    marginTop: -64,
    zIndex: 5,
  },

  // Por debajo del blob (zIndex 4 < 5): actúa como halo de fondo, no como
  // capa translúcida que lava el color sólido de la gota.
  voiceInnerGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -52,
    marginTop: -52,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(255,255,255,0.24)",
    zIndex: 4,
  },

  voiceShine: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -12,
    marginTop: -34,
    width: 42,
    height: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.28)",
    transform: [{ rotate: "-18deg" }],
    zIndex: 6,
  },

  voiceGlass: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -100,
    marginTop: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.40)",
    zIndex: 7,
  },

  voiceAmbientGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -89,
    marginTop: -89,
    width: 178,
    height: 178,
    borderRadius: 89,
    backgroundColor: "rgba(255,255,255,0.10)",
    zIndex: 3,
  },

  askPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.50)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 20,
  },

  askPillDisabled: {
    opacity: 0.6,
  },

  askTip: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_XS,
    color: TOUR_TEXT_PRIMARY,
  },
});
