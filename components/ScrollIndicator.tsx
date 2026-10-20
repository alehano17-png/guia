import React, { useState } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";
import { TOUR_ACCENT_COLOR } from "../lib/tourTheme";

type Props = {
  scrollY: Animated.Value;
  contentHeight: number;
  viewHeight: number;
  // Trayecto del pulgar (top/bottom) dentro del contenedor del scroll.
  style?: ViewStyle;
};

const MIN_THUMB_HEIGHT = 36;

// Indicador de scroll propio, siempre visible: en iPhone la barra nativa
// solo aparece mientras se desliza. Solo se ve el pulgar, y solo si el
// contenido no cabe.
export default function ScrollIndicator({
  scrollY,
  contentHeight,
  viewHeight,
  style,
}: Props) {
  const [trackHeight, setTrackHeight] = useState(0);

  if (contentHeight <= viewHeight || viewHeight <= 0) return null;

  // Alto del pulgar proporcional a la parte visible de la lista.
  const thumbHeight = Math.max(
    MIN_THUMB_HEIGHT,
    (trackHeight * viewHeight) / contentHeight
  );
  const maxScroll = contentHeight - viewHeight;
  const maxThumbOffset = Math.max(0, trackHeight - thumbHeight);

  // clamp: con el rebote de iOS el pulgar no sale de su trayecto.
  const translateY = scrollY.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [0, maxThumbOffset],
    extrapolate: "clamp",
  });

  return (
    <View
      pointerEvents="none"
      style={[styles.track, style]}
      onLayout={(e) => setTrackHeight(e.nativeEvent.layout.height)}
    >
      {/* Contenedor invisible: solo mide el trayecto. */}
      {trackHeight > 0 ? (
        <Animated.View
          style={[
            styles.thumb,
            { height: thumbHeight, transform: [{ translateY }] },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: "absolute",
    right: 4,
    top: 0,
    bottom: 0,
    width: 4,
  },

  thumb: {
    width: 4,
    borderRadius: 2,
    backgroundColor: TOUR_ACCENT_COLOR,
    opacity: 0.55,
  },
});
