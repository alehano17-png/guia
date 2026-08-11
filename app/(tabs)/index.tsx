import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TOUR_ACCENT_COLOR } from "../../lib/tourTheme";

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

    <View style={styles.logoWrap}>
      {/* halo de luz detrás del logo */}
      <View style={styles.logoHalo} />

      <Image
        source={require("../../assets/images/guia.png")}
        style={styles.logo}
      />
    </View>

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
      Compañía a tu modo
    </Text>

  </View>

  <Pressable
    style={styles.button}
    onPress={() => router.push("/recomendations")}
  >
    {/* brillo/vidrio sutil en la mitad superior */}
    <View style={styles.buttonShine} />

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
  paddingTop: 64,
  paddingBottom: 28,
  alignItems: "center",
  justifyContent: "space-between",

},


  button: {
  width: "100%",
  backgroundColor: TOUR_ACCENT_COLOR,
  shadowColor: TOUR_ACCENT_COLOR,
  shadowOpacity: 0.4,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  paddingVertical: 16,
  borderRadius: 20,
  overflow: "hidden",
},

buttonShine: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "50%",
  backgroundColor: "rgba(255,255,255,0.14)",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
},

  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
topBlock: {
  alignItems: "center",
},

logoWrap: {
  width: 260,
  height: 260,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 10,
},

logoHalo: {
  position: "absolute",
  width: 260,
  height: 260,
  borderRadius: 130,
  backgroundColor: "rgba(255,255,255,0.85)",
},

logo: {
  width: 160,
  height: 160,
  resizeMode: "contain",
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
  color: TOUR_ACCENT_COLOR,
},

mainTitleShadow: {
  position: "relative",
  top: 3,
  left: 3,
  fontSize: 42,
  fontWeight: "900",
  color: TOUR_ACCENT_COLOR,
},

});
