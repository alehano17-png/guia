import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type Props = {
  pulseAnim: Animated.Value;
  summary?: string;
};

export default function TourNarrationBlock({ pulseAnim, summary }: Props) {
  return (
    <View style={styles.centerBlock}>
      <View style={styles.voiceContainer}>
        <View style={styles.voiceOuter}>
          <Animated.View
            style={[
              styles.voiceHaloFar,
              {
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.25],
                      outputRange: [1, 1.28],
                    }),
                  },
                ],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.25],
                  outputRange: [0.08, 0.16],
                }),
              },
            ]}
          />

          <Animated.View
            style={[
              styles.voiceHalo,
              {
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.25],
                      outputRange: [1, 1.18],
                    }),
                  },
                ],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.25],
                  outputRange: [0.14, 0.24],
                }),
              },
            ]}
          />

          <View style={styles.voiceAmbientGlow} />

          <Animated.View
            style={[
              styles.voiceInner,
              {
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.25],
                      outputRange: [1, 1.07],
                    }),
                  },
                ],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.voiceInnerGlow,
              {
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.25],
                  outputRange: [0.22, 0.34],
                }),
              },
            ]}
          />

          <View style={styles.voiceShine} />
          <View style={styles.voiceGlass} />
        </View>
      </View>

      <View style={styles.summaryBlock}>
        <Text style={styles.summaryText} numberOfLines={3}>
          {summary ?? " "}
        </Text>

        <View style={styles.askPill}>
          <Text style={styles.askTip}>
  {"Di \"GUÍA\" para hacer una pregunta."}
</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerBlock: {
    alignItems: "center",
    transform: [{ translateY: 16 }],
  },

  voiceContainer: {
    alignItems: "center",
    marginTop: 9,
  },

  voiceOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    backgroundColor: "rgba(255,255,255,0.16)",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
  },

  voiceInner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -59,
    marginTop: -59,
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: "#D9D0FF",
    zIndex: 4,
  },

  voiceInnerGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -52,
    marginTop: -52,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(255,255,255,0.24)",
    zIndex: 5,
  },

  voiceShine: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -12,
    marginTop: -34,
    width: 42,
    height: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.28)",
    transform: [{ rotate: "-18deg" }],
    zIndex: 6,
  },

  voiceGlass: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -80,
    marginTop: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.40)",
    zIndex: 7,
  },

  voiceHalo: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -98,
    marginTop: -98,
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: "rgba(167,139,250,0.20)",
    zIndex: 2,
  },

  voiceHaloFar: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -118,
    marginTop: -118,
    width: 236,
    height: 236,
    borderRadius: 118,
    backgroundColor: "rgba(167,139,250,0.14)",
    zIndex: 1,
  },

  voiceAmbientGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -71,
    marginTop: -71,
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: "rgba(255,255,255,0.10)",
    zIndex: 3,
  },

  summaryBlock: {
    height: 122,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  summaryText: {
    textAlign: "center",
    fontSize: 17,
    lineHeight: 24,
    paddingHorizontal: 18,
    color: "#221B35",
    height: 72,
  },

  askPill: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.50)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  askTip: {
    fontSize: 13,
    color: "#221B35",
    fontWeight: "400",
  },
});