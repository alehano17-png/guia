import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LOADING_ANIMATIONS } from "./loadingAnimations";
import { TOUR_GRADIENT_COLORS } from "../../lib/tourTheme";

type Props = {
  tourTitle: string;
};

export default function TourLoadingScreen({ tourTitle }: Props) {
  const headline = `Preparando tu recorrido por ${tourTitle}`;

  // Una sola vez por montaje (inicializador perezoso de useState, mismo
  // patrón que ya se usa en el resto de la migración) — no se vuelve a
  // elegir otra en cada re-render mientras la pantalla sigue abierta.
  const [LoadingAnimation] = useState(
    () => LOADING_ANIMATIONS[Math.floor(Math.random() * LOADING_ANIMATIONS.length)]
  );

  return (
    <LinearGradient
      colors={TOUR_GRADIENT_COLORS}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <LoadingAnimation />

          <View style={styles.titleWrap}>
            {/* sombra/base, desplazada para simular profundidad — color
                distinto al del texto principal, si no el efecto no se ve */}
            <Text style={styles.titleShadow}>{headline}</Text>
            {/* texto principal */}
            <Text style={styles.title}>{headline}</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  titleWrap: {
    alignItems: "center",
    marginTop: 24,
  },

  titleShadow: {
    position: "relative",
    top: 3,
    left: 3,
    width: 300,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    fontSize: 24,
    color: "#C9B3EF",
    textAlign: "center",
  },

  title: {
    position: "absolute",
    top: 0,
    width: 300,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    fontSize: 24,
    color: "#4B3F8F",
    textAlign: "center",
  },
});
