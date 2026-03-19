import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";


type TourCardProps = {
  image: any;
  title: string;
  desc: string;
  duration: string;
  onPress?: () => void;
};

function TourCard({
  image,
  title,
  desc,
  duration,
  onPress,
}: TourCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={image} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
        <Text style={styles.cardTime}>≈ {duration}</Text>
      </View>
    </Pressable>
  );
}

export default function Recommendations() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
  colors={["#F3E8FF", "#D8B4FE", "#A78BFA"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 0, y: 1 }}
  style={{ flex: 1 }}
>
  <StatusBar translucent backgroundColor="transparent" style="dark" />

  <SafeAreaView style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Genial, vamos a pasear.</Text>
          <Text style={styles.subtitle}>
            Aquí hay tours interesantes y cerca de ti:
          </Text>
        </View>

        

        {/* CARDS */}
        <View style={styles.cards}>
          {/* ✅ MIRAFLORES — NAVEGA AL TOUR */}
          <TourCard
            image={require("../assets/images/miraflores.jpg")}
            title="Miraflores"
            desc="Mar, caminatas y vistas únicas."
            duration="1 h 30 min"
            onPress={() =>
              router.push({
                pathname: "/tour",
                params: { tourId: "miraflores-completo" },
              })
            }
          />

          {/* (por ahora no navegan, solo visual) */}
          <TourCard
            image={require("../assets/images/centro.jpg")}
            title="Centro Histórico"
            desc="Historia, plazas y arquitectura."
            duration="1 h 30 min"
          />

          <TourCard
            image={require("../assets/images/barranco.jpg")}
            title="Barranco"
            desc="Arte, bohemia y cultura."
            duration="1 h 30 min"
          />

          <Pressable style={styles.card}>
  <View style={styles.cardContent}>
    <Text style={styles.cardTitle}>Exploración libre</Text>
    <Text style={styles.cardDesc}>
      Descubre lugares cercanos sin seguir un tour.
    </Text>
  </View>

  <View style={styles.exploreArrow}>
    <Ionicons name="chevron-forward" size={20} color="#111827" />
  </View>
</Pressable>
        </View>
      </SafeAreaView>
</LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
  flex: 1,
  
},
  container: {
    flex: 1,
  },

  header: {
    paddingTop: 25,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1F2937",
letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 17,
    color: "#4B5563",
    textAlign: "center",
  },

  micWrapper: {
    marginTop: 24,
    alignItems: "center",
    shadowColor: "#7C8DF5",
shadowOpacity: 0.25,
shadowRadius: 30,
shadowOffset:{width:0,height:10}
  },
  micRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  micInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  cards: {
    marginTop: 32,
    paddingHorizontal: 20,
    gap: 18,
  },

  card: {
  flexDirection: "row",
  backgroundColor: "rgba(255,255,255,0.42)",
  borderRadius: 22,
  overflow: "hidden",
  height: 125,

  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },

  elevation: 3,
},

  cardImage: {
    width: 110,
    height: "100%",
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  cardDesc: {
    marginTop: 4,
    fontSize: 15,
    color: "#4B5563",
  },
  cardTime: {
    marginTop: 6,
    fontSize: 14,
    color: "#6B7280",
  },

  footerText: {
    marginTop: 28,
    textAlign: "center",
    color:"#4B5563",
    fontSize: 15,
  },

  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
  },

  side: {
    flex: 1,
    alignItems: "center",
  },
  center: {
    width: 96,
    alignItems: "center",
  },

  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    backgroundColor: "#111827",
  },

  footerMicRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  footerMicInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  free: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  freeText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "500",
  },

  exploreArrow:{
  justifyContent:"center",
  paddingRight:16
},
});