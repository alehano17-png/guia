import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TOUR_ACCENT_COLOR } from "../../lib/tourTheme";

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
          <Ionicons name="close" size={16} color="#4B5563" />
          <Text style={styles.topActionText}>Salir</Text>
        </Pressable>

        <Pressable style={styles.chatButton} onPress={onOpenChat}>
          <View style={styles.chatIconCircle}>
            <Ionicons name="chatbubble" size={18} color="#FFF" />
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
    color: "#5D5476",
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

  stepTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 0,
    marginBottom: 12,
    color: "#221B35",
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
    color: "#221B35",
  },
});
