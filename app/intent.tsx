import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function IntentScreen() {
  return (
    <LinearGradient
  colors={["#F3E8FF", "#D8B4FE", "#A78BFA"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 0, y: 1 }}
  style={styles.container}
>
      {/* Header */}
      <Text style={styles.title}>¿Qué te provoca hoy?</Text>
      <Text style={styles.subtitle}>
        Elige cómo quieres vivir la experiencia.
      </Text>

      {/* Cards */}
      <View style={styles.cards}>
        <Pressable
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/recomendations",
              params: { intent: "ocio" },
            })
          }
        >
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.cardTitle}>Ocio</Text>
          <Text style={styles.cardDesc}>
            Caminar, disfrutar y dejarse llevar.
          </Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/recomendations",
              params: { intent: "aprendizaje" },
            })
          }
        >
          <Text style={styles.emoji}>📚</Text>
          <Text style={styles.cardTitle}>Aprendizaje</Text>
          <Text style={styles.cardDesc}>
            Historia, contexto y entender el lugar.
          </Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/recomendations",
              params: { intent: "familiar" },
            })
          }
        >
          <Text style={styles.emoji}>👨‍👩‍👧</Text>
          <Text style={styles.cardTitle}>Familiar</Text>
          <Text style={styles.cardDesc}>
            Ritmo tranquilo, para todos.
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  paddingHorizontal: 24,
  paddingTop: 10, 
  justifyContent: "center",
},

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 36,
  },

  cards: {
    gap:20,
  },

 card: {
  backgroundColor: "rgba(255,255,255,0.85)",
  borderRadius: 20,
  paddingVertical: 20,
  paddingHorizontal: 22,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.6)",
},

  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  cardDesc: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
});