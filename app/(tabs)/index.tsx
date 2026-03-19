import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StartScreen() {
  return (
    <LinearGradient
  colors={["#F3E8FF", "#D8B4FE", "#A78BFA"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 0, y: 1 }}
  style={{ flex: 1 }}
>
<SafeAreaView style={styles.container}>
      {/* Título */}
      <Text style={styles.hello}>👊 ¡Hola!</Text>
      <Text style={styles.title}>Soy GUÍA</Text>

      {/* Bloque central */}
      <View style={styles.centerBlock}>
        <Text style={styles.subtitle}>
  Tu guía para descubrir lugares
  como si caminaras con un local.
</Text>

        

        
      </View>

      {/* Botón */}
      <Pressable
        style={styles.button}
        onPress={() => router.push("/intent")}
      >
        <Text style={styles.buttonText}>Empezar</Text>
      </Pressable>


    </SafeAreaView>
</LinearGradient>
  );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  paddingHorizontal: 24,
  justifyContent: "center",
  alignItems: "center",
},

  hello: {
    fontSize: 28,
    marginBottom: 6,
  },

  title: {
    fontSize: 38,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },

 centerBlock: {
  alignItems: "center",
  marginTop: 20,
},

  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 4,
    textAlign: "center",
  },

  question: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 28,
  },

  

  



  button: {
  width: "100%",
  backgroundColor: "rgba(255,255,255,0.6)",
  paddingVertical: 16,
  borderRadius: 20,
  marginTop: 30,
},

  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
});