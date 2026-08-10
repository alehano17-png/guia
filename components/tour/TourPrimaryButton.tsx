import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TOUR_ACCENT_COLOR } from "../../lib/tourTheme";

type Props = {
  label: string;
  onPress: () => void;
};

export default function TourPrimaryButton({ label, onPress }: Props) {
  return (
    <View style={styles.buttons}>
      <Pressable style={styles.primaryButton} onPress={onPress}>
        <Text style={styles.primaryButtonText}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttons: {
    marginTop: 12,
  },

  primaryButton: {
    backgroundColor: TOUR_ACCENT_COLOR,
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});