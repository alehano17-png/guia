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
  track: {
    position: "absolute",
    right: 4,
    width: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  thumb: {
    width: 4,
    borderRadius: 2,
    backgroundColor: TOUR_ACCENT_COLOR,
    opacity: 0.8,
  },
});
