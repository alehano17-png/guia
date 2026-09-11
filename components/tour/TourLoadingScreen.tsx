import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LOADING_ANIMATIONS } from "../loadingAnimations";
import { FONT_BOLD, FONT_SIZE_TITLE } from "../../lib/typography";
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
          <View style={styles.animationFrame}>
            <LoadingAnimation />
          </View>

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

  // Tamaño fijo compartido por las 6 animaciones de la biblioteca (5 de
  // las 6 ya son 160x160; la onda, más angosta y bajita, queda centrada
  // acá adentro con aire alrededor en vez de estirarse).
  animationFrame: {
    width: 260,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
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
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_TITLE,
    color: "#C9B3EF",
    textAlign: "center",
  },

  title: {
    position: "absolute",
    top: 0,
    width: 300,
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_TITLE,
    color: "#4B3F8F",
    textAlign: "center",
  },
});
