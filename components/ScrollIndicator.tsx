import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { TOUR_ACCENT_COLOR } from "../lib/tourTheme";

type Props = {
  scrollY: Animated.Value;
  contentHeight: number;
  viewHeight: number;
  // Posición y alto de la pista en la pantalla (fija, no se mueve con el
  // scroll), medidos por la pantalla que la usa.
  trackTop: number;
  trackHeight: number;
};

const MIN_THUMB_HEIGHT = 36;

// Indicador de scroll propio, siempre visible: en iPhone la barra nativa
// solo aparece mientras se desliza. Una pista fija con un pulgar que baja
// según el scroll; solo se muestra si el contenido no cabe.
export default function ScrollIndicator({
  scrollY,
  contentHeight,
  viewHeight,
  trackTop,
  trackHeight,
}: Props) {
  if (contentHeight <= viewHeight || viewHeight <= 0 || trackHeight <= 0) {
    return null;
  }

  // Alto del pulgar proporcional a la parte visible de la lista.
  const thumbHeight = Math.min(
    trackHeight,
    Math.max(MIN_THUMB_HEIGHT, (trackHeight * viewHeight) / contentHeight)
  );
  const maxScroll = contentHeight - viewHeight;
  const maxThumbOffset = trackHeight - thumbHeight;

  // clamp: con el rebote de iOS el pulgar no sale de la pista.
  const translateY = scrollY.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [0, maxThumbOffset],
    extrapolate: "clamp",
  });

  return (
    <View
      pointerEvents="none"
      style={[styles.track, { top: trackTop, height: trackHeight }]}
    >
      <Animated.View
        style={[
          styles.thumb,
          { height: thumbHeight, transform: [{ translateY }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // right 10: en el pasillo entre las tarjetas (a 20 del borde) y el borde
  // de la pantalla. Sin overflow hidden, para no recortar la sombra del
  // pulgar.
  track: {
    position: "absolute",
    right: 10,
    width: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  // Sólido con un brillo suave del mismo color.
  thumb: {
    width: 4,
    borderRadius: 999,
    backgroundColor: TOUR_ACCENT_COLOR,
    shadowColor: TOUR_ACCENT_COLOR,
    shadowOpacity: 0.45,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
});
