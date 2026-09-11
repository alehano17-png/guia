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
import {
  FONT_BOLD,
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_SIZE_MD,
  FONT_SIZE_SM,
  FONT_SIZE_XL,
} from "../../lib/typography";

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
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_XL,
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

  // Peso original (500/Medium) no existe en la fuente cargada — sube a
  // SEMIBOLD (600): es una opción tocable, se gana un poco de énfasis
  // sobre texto plano.
  optionTitle: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_MD,
    color: TOUR_TEXT_PRIMARY,
  },

  cancel: {
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 4,
  },

  // "Cancelar" es la acción de descartar — a diferencia de las opciones de
  // arriba, quiere verse más discreta: baja a REGULAR (no SEMIBOLD) y a
  // SM (no MD), reforzando que es la acción secundaria del modal.
  cancelText: {
    color: "#6B7280",
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_SM,
  },
});
