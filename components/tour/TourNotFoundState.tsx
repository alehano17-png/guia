import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "../../lib/i18n/useTranslation";

export default function TourNotFoundState() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <Text>{t.tour.notFound}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});