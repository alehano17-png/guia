import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TOUR_TEXT_PRIMARY } from "../../lib/tourTheme";

type ChoiceOption = {
  label: string;
  nextId: string;
};

type Props = {
  visible: boolean;
  decisionAnim: Animated.Value;
  choices?: ChoiceOption[];
  onSelectChoice: (nextId: string) => void;
  onClose: () => void;
};

export default function TourDecisionModal({
  visible,
  decisionAnim,
  choices,
  onSelectChoice,
  onClose,
}: Props) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              {
                scale: decisionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.92, 1],
                }),
              },
            ],
            opacity: decisionAnim,
          },
        ]}
      >
        <Text style={styles.title}>Elige cómo continuar</Text>

        {choices?.map((choice) => (
          <Pressable
            key={choice.nextId}
            style={styles.option}
            onPress={() => onSelectChoice(choice.nextId)}
          >
            <View style={styles.optionRow}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#FFF"
                />
              </View>

              <View style={styles.optionTexts}>
                <Text style={styles.optionTitle}>{choice.label}</Text>
              </View>
            </View>
          </Pressable>
        ))}

        <Pressable style={styles.cancel} onPress={onClose}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.38)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: TOUR_TEXT_PRIMARY,
  },

  option: {
    backgroundColor: "rgba(255,255,255,0.75)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 14,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8E7BFF",
  },

  optionTexts: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: TOUR_TEXT_PRIMARY,
  },

  cancel: {
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 4,
  },

  cancelText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "500",
  },
});