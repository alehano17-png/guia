import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import {
  TOUR_ACCENT_COLOR,
  TOUR_TEXT_PRIMARY,
  TOUR_TEXT_SECONDARY,
} from "../../lib/tourTheme";

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
  return (
    <View style={styles.headerBlock}>
      <View style={styles.topBar}>
        <Pressable style={styles.topAction} onPress={onBack}>
          <Ionicons name="close" size={16} color={TOUR_TEXT_SECONDARY} />
          <Text style={styles.topActionText}>Salir</Text>
        </Pressable>

        <Pressable style={styles.chatButton} onPress={onOpenChat}>
          <View style={styles.chatIconCircle}>
            <Ionicons name="chatbubble" size={18} color="#FFF" />
            {/* TEMPORAL: superpuesta sobre el ícono a propósito, para
                verla antes de decidir si reemplaza al ícono o no. */}
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
          Narrando - Paso {stepIndex + 1} de {totalSteps}
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
    fontSize: 15,
    fontWeight: "600",
    color: TOUR_TEXT_SECONDARY,
  },

  chatButton: {
    padding: 2,
  },

  chatIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TOUR_ACCENT_COLOR,
  },

  // Sin top/left/right/bottom: RN centra los hijos position:"absolute"
  // según el alignItems/justifyContent del padre — por eso queda centrada
  // sobre el ícono sin cálculos de offset a mano. 30x34 conserva la
  // proporción real de la imagen (960x1112) y deja margen dentro del
  // círculo de 42px.
  chatIconOverlayImage: {
    position: "absolute",
    width: 30,
    height: 34,
  },

  stepTitle: {
    fontSize: 28,
    fontWeight: "700",
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
    fontSize: 13,
    fontWeight: "400",
    color: TOUR_TEXT_PRIMARY,
  },
});
