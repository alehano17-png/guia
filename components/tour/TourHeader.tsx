import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Ellipse, Path } from "react-native-svg";
import {
  TOUR_ACCENT_COLOR,
  TOUR_TEXT_PRIMARY,
  TOUR_TEXT_SECONDARY,
} from "../../lib/tourTheme";
import {
  FONT_BOLD,
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_SIZE_SM,
  FONT_SIZE_TITLE,
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

        <Pressable style={styles.chatButton} onPress={onOpenChat}>
          <View style={styles.chatBubbleBox}>
            <Svg
              width={46}
              height={46}
              viewBox="0 0 512 512"
              style={StyleSheet.absoluteFill}
            >
              <Ellipse
                cx={256}
                cy={212}
                rx={250}
                ry={205}
                fill={TOUR_ACCENT_COLOR}
              />
              <Path
                d="M 285 360 L 285 488 Q 285 502 297 492 L 415 368 Z"
                fill={TOUR_ACCENT_COLOR}
                stroke={TOUR_ACCENT_COLOR}
                strokeWidth={24}
                strokeLinejoin="round"
              />
            </Svg>
            <Image
              source={require("../../assets/images/guia-feliz.png")}
              style={styles.chatIconOverlayImage}
              resizeMode="contain"
            />
          </View>
        </Pressable>
      </View>

      <Text style={styles.stepTitle} numberOfLines={1}>
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
    height: 112,
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

  chatButton: {
    padding: 0,
  },

  // Globo de chat de 46x46 (misma altura que antes: círculo de 42 + 2 de
  // padding por lado), dibujado con SVG sobre un viewBox de 512.
  chatBubbleBox: {
    width: 46,
    height: 46,
  },

  // Mascota centrada en el óvalo del globo (centro del óvalo: y ~19 de 46),
  // no en el centro de la caja, porque la colita ocupa la parte de abajo.
  // 26x30 conserva la proporción real de la imagen (960x1112).
  chatIconOverlayImage: {
    position: "absolute",
    width: 26,
    height: 30,
    top: 4,
    left: 10,
  },

  // El título de este paso en particular (no el de toda la pantalla) —
  // vive en un header compacto compartiendo lugar con otros dos botones,
  // así que va en TITLE, no en DISPLAY (reservado para el título dedicado
  // de una pantalla entera, como discover.tsx o recomendations.tsx).
  stepTitle: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_TITLE,
    marginTop: 0,
    marginBottom: 12,
    color: TOUR_TEXT_PRIMARY,
    height: 42,
  },

  metaPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.30)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: -10,
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
