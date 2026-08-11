import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { GuiaVoiceStatus } from "../../hooks/useGuiaVoiceMode";
import { TOUR_ACCENT_COLOR } from "../../lib/tourTheme";
import VoiceBlob from "./VoiceBlob";

type Props = {
  pulseAnim: Animated.Value;
  voiceEnergy: SharedValue<number>;
  summary?: string;
  guiaVoiceStatus: GuiaVoiceStatus;
  onAskGuia: () => void;
};

// Texto de la píldora según el estado del modo de voz de GUÍA.
const GUIA_STATUS_LABEL: Record<GuiaVoiceStatus, string> = {
  idle: "Toca para hablar con GUÍA",
  listening: "Escuchando...",
  thinking: "Pensando...",
  speaking: "Hablando...",
  error: "No entendí, toca para intentar de nuevo",
};

export default function TourNarrationBlock({
  pulseAnim,
  voiceEnergy,
  summary,
  guiaVoiceStatus,
  onAskGuia,
}: Props) {
  // Solo se puede tocar en reposo o tras un error — mientras escucha,
  // piensa o habla, ya hay una pregunta en curso y no debe dispararse otra.
  const isGuiaBusy =
    guiaVoiceStatus !== "idle" && guiaVoiceStatus !== "error";
  return (
    <View style={styles.centerBlock}>
      <View style={styles.voiceContainer}>
        <View style={styles.voiceOuter}>
          <View style={styles.voiceAmbientGlow} />

          <VoiceBlob
            energy={voiceEnergy}
            color={TOUR_ACCENT_COLOR}
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

      <View style={styles.summaryBlock}>
        <Text style={styles.summaryText} numberOfLines={3}>
          {summary ?? " "}
        </Text>

        <Pressable
          style={[styles.askPill, isGuiaBusy && styles.askPillDisabled]}
          onPress={onAskGuia}
          disabled={isGuiaBusy}
        >
          <Ionicons name="mic" size={16} color={TOUR_ACCENT_COLOR} />
          <Text style={styles.askTip}>{GUIA_STATUS_LABEL[guiaVoiceStatus]}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerBlock: {
    alignItems: "center",
    transform: [{ translateY: 16 }],
  },

  voiceContainer: {
    alignItems: "center",
    marginTop: 9,
  },

  voiceOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
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

  // El lienzo del VoiceBlob mide (radius + amplitude) * 2 = (55 + 14) * 2 =
  // 138 con sus valores por defecto, así que se centra igual que el resto
  // de las capas del globo.
  voiceBlobWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -69,
    marginTop: -69,
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
    marginLeft: -80,
    marginTop: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.40)",
    zIndex: 7,
  },

  voiceAmbientGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -71,
    marginTop: -71,
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: "rgba(255,255,255,0.10)",
    zIndex: 3,
  },

  summaryBlock: {
    height: 122,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  summaryText: {
    textAlign: "center",
    fontSize: 17,
    lineHeight: 24,
    paddingHorizontal: 18,
    color: "#221B35",
    height: 72,
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
  },

  askPillDisabled: {
    opacity: 0.6,
  },

  askTip: {
    fontSize: 13,
    color: "#221B35",
    fontWeight: "400",
  },
});