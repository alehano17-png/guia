import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TOUR_ACCENT_COLOR } from "../../lib/tourTheme";
import VoiceBlob from "./VoiceBlob";

type LoadingStep = {
  id: string;
  title: string;
};

type Props = {
  tourTitle: string;
  steps: LoadingStep[];
  readyStepIds: string[];
};

export default function TourLoadingScreen({ tourTitle, steps, readyStepIds }: Props) {
  const readySet = useMemo(() => new Set(readyStepIds), [readyStepIds]);
  const headline = `${tourTitle} tiene algo que contar`;

  return (
    <LinearGradient
      colors={["#F3E8FF", "#D8B4FE", "#A78BFA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.blobWrap}>
            {/* halo de luz detrás del blob, mismo patrón que la pantalla de inicio */}
            <View style={styles.blobHalo} />
            <VoiceBlob mode="idle" color={TOUR_ACCENT_COLOR} radius={62} amplitude={10} />
          </View>

          <View style={styles.titleWrap}>
            {/* sombra/base, desplazada para simular profundidad */}
            <Text style={styles.titleShadow}>{headline}</Text>
            {/* texto principal */}
            <Text style={styles.title}>{headline}</Text>
          </View>

          <ScrollView
            style={styles.stepsList}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {steps.map((step) => {
              const isReady = readySet.has(step.id);
              return (
                <View key={step.id} style={styles.stepRow}>
                  {isReady ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={TOUR_ACCENT_COLOR}
                    />
                  ) : (
                    <View style={styles.stepIconSpacer} />
                  )}
                  <Text
                    style={[styles.stepText, !isReady && styles.stepTextPending]}
                    numberOfLines={1}
                  >
                    {step.title}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
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

  blobWrap: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },

  blobHalo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  titleWrap: {
    alignItems: "center",
    marginTop: 24,
  },

  titleShadow: {
    position: "relative",
    top: 3,
    left: 3,
    width: 280,
    fontSize: 24,
    fontWeight: "800",
    color: TOUR_ACCENT_COLOR,
    textAlign: "center",
  },

  title: {
    position: "absolute",
    top: 0,
    width: 280,
    fontSize: 24,
    fontWeight: "800",
    color: TOUR_ACCENT_COLOR,
    textAlign: "center",
  },

  stepsList: {
    marginTop: 28,
    width: "100%",
    maxWidth: 320,
    maxHeight: 220,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },

  stepIconSpacer: {
    width: 18,
  },

  stepText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#221B35",
  },

  stepTextPending: {
    opacity: 0.45,
    fontWeight: "400",
  },
});
