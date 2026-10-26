import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TOUR_ACCENT_COLOR } from "../../lib/tourTheme";
import { FONT_BOLD, FONT_SIZE_XS } from "../../lib/typography";

type Props = {
  label: string;
};

// Capa sobre un mapa pequeño: blur suave con tinte blanco y, al centro, la
// píldora morada "Abrir mapa". La usan la tarjeta "Siguiente parada" del
// tour y su demo en el tutorial, para que se vean iguales. No intercepta
// toques: el toque lo recibe el contenedor del mapa.
export default function MapOpenOverlay({ label }: Props) {
  return (
    <>
      {/* En Android, si el blur no difumina, queda al menos el tinte. */}
      <BlurView
        intensity={15}
        tint="light"
        style={[StyleSheet.absoluteFill, styles.tint]}
        pointerEvents="none"
      />

      <View style={styles.pillWrap} pointerEvents="none">
        <View style={styles.pill}>
          <Text style={styles.pillText} numberOfLines={1} adjustsFontSizeToFit>
            {label}
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tint: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  pillWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  pill: {
    maxWidth: "100%",
    backgroundColor: TOUR_ACCENT_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    shadowColor: TOUR_ACCENT_COLOR,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  pillText: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_XS,
    color: "#FFFFFF",
  },
});
