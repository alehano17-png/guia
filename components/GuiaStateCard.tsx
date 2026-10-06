import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { TOUR_ACCENT_COLOR, TOUR_TEXT_PRIMARY } from "../lib/tourTheme";
import {
  FONT_BOLD,
  FONT_REGULAR,
  FONT_SIZE_MD,
  FONT_SIZE_XL,
} from "../lib/typography";

type Props = {
  title: string;
  message: string;
  buttonLabel?: string;
  onPress?: () => void;
};

// Tarjeta de GUÍA triste para cualquier estado de "algo no salió bien" o
// "no hay nada que mostrar". Reutiliza la imagen guia-sin-internet.png (el
// nombre es histórico, nació para el aviso de sin internet). El botón es
// opcional: solo aparece si se pasan buttonLabel y onPress.
export default function GuiaStateCard({
  title,
  message,
  buttonLabel,
  onPress,
}: Props) {
  const hasButton = !!buttonLabel && !!onPress;

  return (
    <View style={styles.card}>
      <Image
        source={require("../assets/images/guia-sin-internet.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>{title}</Text>

      <Text style={[styles.message, !hasButton && styles.messageNoButton]}>
        {message}
      </Text>

      {hasButton ? (
        <Pressable style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 26,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
  },

  image: {
    width: 120,
    height: 139,
    marginBottom: 8,
  },

  title: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_XL,
    textAlign: "center",
    marginBottom: 8,
    color: TOUR_TEXT_PRIMARY,
  },

  message: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_MD,
    lineHeight: 21,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 20,
  },

  messageNoButton: {
    marginBottom: 0,
  },

  button: {
    backgroundColor: TOUR_ACCENT_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
  },

  buttonText: {
    color: "#FFF",
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_MD,
  },
});
