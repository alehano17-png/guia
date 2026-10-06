import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "../../lib/i18n/useTranslation";
import { TOUR_GRADIENT_COLORS } from "../../lib/tourTheme";
import GuiaStateCard from "../GuiaStateCard";

export default function TourNotFoundState() {
  const { t } = useTranslation();
  const router = useRouter();

  // Si por alguna razón no hay pantalla anterior, cae a Recomendaciones.
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/recomendations");
    }
  };

  return (
    <LinearGradient
      colors={TOUR_GRADIENT_COLORS}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <GuiaStateCard
            title={t.tour.notFound}
            message={t.tour.notFoundMessage}
            buttonLabel={t.tour.notFoundBack}
            onPress={goBack}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});
