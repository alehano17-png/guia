import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Tour = {
  name: string;
  title: string;
  desc: string;
  intents: Array<"ocio" | "aprendizaje" | "familiar">;
};

const TOURS: Tour[] = [
  {
    name: "Centro Histórico de Lima",
    title: "🏛 Centro Histórico",
    desc: "Historia, plazas e iglesias.",
    intents: ["aprendizaje", "familiar", "ocio"],
  },
  {
    name: "Barranco Cultural",
    title: "🎨 Barranco",
    desc: "Arte, música y vida bohemia.",
    intents: ["ocio", "aprendizaje"],
  },
  {
    name: "Miraflores Costero",
    title: "🌊 Miraflores",
    desc: "Mar, acantilados y caminatas.",
    intents: ["ocio", "familiar"],
  },
];

export default function HomeScreen() {
  const params = useLocalSearchParams();

  const intent = params.intent as "ocio" | "aprendizaje" | "familiar" | undefined;
  const language = params.language as string | undefined;
  const wakeWord = params.wakeWord as string | undefined;

  if (!intent) return <Redirect href="/intent" />;
  if (!language || !wakeWord)
    return <Redirect href={{ pathname: "/setup", params: { intent } } as any} />;

  const filtered = TOURS.filter((t) => t.intents.includes(intent));

  const intentLabel =
    intent === "ocio" ? "Ocio" : intent === "aprendizaje" ? "Aprendizaje" : "Familiar";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estoy contigo 👋</Text>
      <Text style={styles.subtitle}>
        Lima • {intentLabel} • {language.toUpperCase()} • clave: {wakeWord}
      </Text>

      <Text style={styles.guide}>Elige un tour 👇</Text>

      {filtered.map((t) => (
        <Pressable
          key={t.name}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/tour",
              params: { name: t.name, intent, language, wakeWord },
            })
          }
        >
          <Text style={styles.cardTitle}>{t.title}</Text>
          <Text>{t.desc}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 14, color: "#475569" },
  guide: { marginBottom: 16, fontWeight: "600" },
  card: { padding: 16, borderRadius: 10, backgroundColor: "#f1f1f1", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
});