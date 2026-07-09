import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
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

  <View style={styles.topBlock}>

    <Image
      source={require("../../assets/images/guia.png")}
      style={styles.logo}
    />

    <Text style={styles.title}>
      Hola, soy
    </Text>

   <View>
  {/* sombra/base */}
  <Text style={styles.mainTitleShadow}>
    GUÍA
  </Text>

  {/* texto principal */}
  <Text style={styles.mainTitle}>
    GUÍA
  </Text>
</View>

    <Text style={styles.subtitle}>
      Tu guía para descubrir lugares como si caminaras con un local.
    </Text>

  </View>

  <Pressable
    style={styles.button}
    onPress={() => router.push("/recomendations")}
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
  alignItems: "center",
  justifyContent: "center",
  
},


  button: {
  width: "100%",
  backgroundColor: "#7C3AED",
  shadowColor: "#7C3AED",
  shadowOpacity: 0.4,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  paddingVertical: 16,
  borderRadius: 20,
  marginTop: 30, // 👈 ESTE ES CLAVE
},

  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
topBlock: {
  alignItems: "center",
  marginTop: 20,
},

logo: {
  width: 160,
  height: 160,
  resizeMode: "contain",
  marginBottom: 10,
},

title: {
  fontSize: 22,
  color: "#374151",
  marginTop: 10,
},

subtitle: {
  fontSize: 16,
  color: "#4B5563",
  textAlign: "center",
  maxWidth: 280,
  lineHeight: 22,
},


mainTitle: {
  position: "absolute",
  fontSize: 42,
  fontWeight: "900",
  color: "#9333EA", // más vivo
},

mainTitleShadow: {
  fontSize: 42,
  fontWeight: "900",
  color: "#C084FC", // más claro (simula luz)
},

});