import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  TOUR_ACCENT_COLOR,
  TOUR_TEXT_PRIMARY,
  TOUR_TEXT_SECONDARY,
} from "../../lib/tourTheme";
import {
  FONT_BOLD,
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_SIZE_DISPLAY,
  FONT_SIZE_SM,
  FONT_SIZE_XS,
} from "../../lib/typography";
import { interpolate } from "../../lib/i18n/interpolate";
import { useTranslation } from "../../lib/i18n/useTranslation";

type Props = {
  title: string;
  stepIndex: number;
  totalSteps: number;
  onBack: () => void;
  onOpenChat: () => void;
};

export default function TourHeader({
  title,
  stepIndex,
  totalSteps,
  onBack,
  onOpenChat,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.headerBlock}>
      <View style={styles.topBar}>
        <Pressable style={styles.topAction} onPress={onBack}>
          <Ionicons name="close" size={16} color={TOUR_TEXT_SECONDARY} />
          <Text style={styles.topActionText}>{t.tour.exit}</Text>
        </Pressable>

        <Pressable
          style={styles.chatButton}
          onPress={onOpenChat}
          accessibilityRole="button"
          accessibilityLabel={t.tour.openChat}
        >
          <Image
            source={require("../../assets/images/guia-feliz.png")}
            style={styles.chatButtonImage}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <Text style={styles.stepTitle} numberOfLines={2}>
        {title}
      </Text>

      <View style={styles.metaPill}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>
          {interpolate(t.tour.stepProgress, {
            current: stepIndex + 1,
            total: totalSteps,
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    alignItems: "stretch",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  topAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },

  topActionText: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_SM,
    color: TOUR_TEXT_SECONDARY,
  },

  // Botón de chat cuadrado redondeado con la esquina inferior derecha
  // casi recta, que lo hace leer como globo de diálogo.
  chatButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TOUR_ACCENT_COLOR,
    borderRadius: 24,
    borderBottomRightRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    shadowColor: "rgba(124,111,224,0.35)",
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  // 28x32 conserva la proporción real de la imagen (960x1112).
  chatButtonImage: {
    width: 28,
    height: 32,
  },

  // Título del paso, centrado y en DISPLAY: es el protagonista del header.
  stepTitle: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_DISPLAY,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12,
    color: TOUR_TEXT_PRIMARY,
  },

  metaPill: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.30)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 14,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#221B35",
  },

  liveText: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_XS,
    color: TOUR_TEXT_PRIMARY,
  },
});
