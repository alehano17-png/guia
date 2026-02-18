import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getTourById, TourStep } from "./data/tours";

export default function TourScreen() {
  const params = useLocalSearchParams<{ tourId?: string }>();
  const tourId = params.tourId ?? "miraflores-ocio";
  const tour = useMemo(() => getTourById(tourId), [tourId]);

  const [currentStepId, setCurrentStepId] = useState(
    tour?.steps[0]?.id ?? ""
  );

  const step: TourStep | undefined = useMemo(() => {
    return tour?.steps.find((s) => s.id === currentStepId);
  }, [tour, currentStepId]);

  useEffect(() => {
    if (!step) return;
    Speech.stop();
    Speech.speak(step.voiceText, {
      language: "es-PE",
      rate: 0.95,
    });
    return () => {
      Speech.stop();
    };
  }, [step]);

  if (!step) {
    return (
      <View style={styles.container}>
        <Text>No se encontró el tour.</Text>
      </View>
    );
  }

  const goNext = () => {
    if (step.nextId) setCurrentStepId(step.nextId);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{step.title}</Text>

        {step.highlights.map((h, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>{h}</Text>
          </View>
        ))}

        {step.choices && (
          <View style={styles.choices}>
            {step.choices.map((c) => (
              <Pressable
                key={c.label}
                style={styles.choiceButton}
                onPress={() => setCurrentStepId(c.nextId)}
              >
                <Text style={styles.choiceText}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step.nextId && (
          <Pressable style={styles.button} onPress={goNext}>
            <Text style={styles.buttonText}>Siguiente</Text>
          </Pressable>
        )}
        <Pressable onPress={() => router.back()}>
          <Text style={styles.exit}>Salir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 16 },

  chip: {
    backgroundColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  chipText: { color: "#fff", fontSize: 14 },

  choices: { marginTop: 24 },

  choiceButton: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  choiceText: { textAlign: "center", fontSize: 16 },

  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  exit: { textAlign: "center", color: "#555" },
});