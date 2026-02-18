import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function SetupScreen() {
  const params = useLocalSearchParams();
  const intent = (params.intent as string) || "ocio";

  const [language, setLanguage] = useState<"es" | "en">("es");
  const [wakeWord, setWakeWord] = useState("GUÍA");

  const continueNext = () => {
    const ww = wakeWord.trim();

    if (ww.length < 2) {
      Alert.alert("Falta tu palabra clave", "Pon una palabra clave de al menos 2 letras.");
      return;
    }

    router.replace({
      pathname: "/",
      params: { intent, language, wakeWord: ww },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración rápida</Text>

      <Text style={styles.label}>Idioma</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.pill, language === "es" && styles.pillActive]}
          onPress={() => setLanguage("es")}
        >
          <Text style={[styles.pillText, language === "es" && styles.pillTextActive]}>
            ES
          </Text>
        </Pressable>

        <Pressable
          style={[styles.pill, language === "en" && styles.pillActive]}
          onPress={() => setLanguage("en")}
        >
          <Text style={[styles.pillText, language === "en" && styles.pillTextActive]}>
            EN
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Palabra clave</Text>
      <TextInput
        value={wakeWord}
        onChangeText={setWakeWord}
        placeholder="Ej: GUÍA"
        placeholderTextColor="#94a3b8"
        autoCapitalize="characters"
        autoCorrect={false}
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={continueNext}>
        <Text style={styles.buttonText}>Seguir</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: "#0f172a" },
  title: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 24 },
  label: { color: "#cbd5f5", fontSize: 14, marginBottom: 8, fontWeight: "600" },
  row: { flexDirection: "row", gap: 12, marginBottom: 18 },
  pill: {
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  pillActive: { backgroundColor: "#1e293b", borderColor: "#60a5fa" },
  pillText: { color: "#94a3b8", fontWeight: "700" },
  pillTextActive: { color: "#fff" },
  input: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    marginBottom: 18,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
