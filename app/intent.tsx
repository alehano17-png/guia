import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function IntentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Qué te provoca hoy?</Text>

      <Pressable
        style={styles.card}
        onPress={() => router.replace({ pathname: "/setup", params: { intent: "ocio" } })}
      >
        <Text style={styles.cardTitle}>🎉 Ocio</Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() =>
          router.replace({ pathname: "/setup", params: { intent: "aprendizaje" } })
        }
      >
        <Text style={styles.cardTitle}>📚 Aprendizaje</Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() =>
          router.replace({ pathname: "/setup", params: { intent: "familiar" } })
        }
      >
        <Text style={styles.cardTitle}>👨‍👩‍👧 Familiar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: "#0f172a" },
  title: { fontSize: 26, fontWeight: "800", color: "#fff", marginBottom: 18 },
  card: {
    backgroundColor: "#1e293b",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
});
