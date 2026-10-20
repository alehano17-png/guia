import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, type ComponentProps } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import LoadingSearchScreen from "../components/tour/LoadingSearchScreen";
import TourLanguageSheet from "../components/tour/TourLanguageSheet";
import GuiaStateCard from "../components/GuiaStateCard";
import { getDiscoveryItemIcon } from "../data/discovery/iconHelpers";
import { getDiscoveryItemDurationLabel } from "../data/discovery/presentation";
import { getRecommendationsCopy } from "../data/discovery/recommendationsCopy";
import { useDiscoveryContent } from "../hooks/useDiscoveryContent";
import { useDiscoveryNavigation } from "../hooks/useDiscoveryNavigation";
import { useTourLocation } from "../hooks/useTourLocation";
import { useTranslation } from "../lib/i18n/useTranslation";
import {
  TOUR_ACCENT_COLOR,
  TOUR_GRADIENT_COLORS,
  TOUR_TEXT_MUTED,
  TOUR_TEXT_PRIMARY,
  TOUR_TEXT_SECONDARY,
} from "../lib/tourTheme";
import { hasSeenTutorial } from "../lib/tutorialSeen";
import {
  FONT_BOLD,
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_SIZE_DISPLAY,
  FONT_SIZE_LG,
  FONT_SIZE_MD,
  FONT_SIZE_SM,
  FONT_SIZE_XL,
} from "../lib/typography";

type TourCardProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  desc: string;
  duration: string;
  onPress?: () => void;
};

function TourCard({ icon, title, desc, duration, onPress }: TourCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardTopRow}>
        <View style={styles.cardIconBox}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>

        <View style={styles.cardHeading}>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={styles.cardTimeRow}>
            <Ionicons name="time-outline" size={14} color={TOUR_TEXT_MUTED} />
            <Text style={styles.cardTime}>{duration}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.cardDesc}>{desc}</Text>
    </Pressable>
  );
}

export default function Recommendations() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  // Primera vez en este celular: se va al tutorial antes de mostrar nada.
  // Se evalúa una sola vez, al montar, para no pintar Recomendaciones un
  // instante antes del redirect.
  const [needsTutorial] = useState(() => !hasSeenTutorial());

  useEffect(() => {
    if (needsTutorial) {
      router.replace("/tutorial");
    }
  }, [needsTutorial]);

 const { userLocation } = useTourLocation();

const {
  detectedCity,
  detectedZone,
  hasSupportedCity,
  featuredTours,
  featuredToursInDetectedZone,
  discoverPlacesInDetectedZone,
  hasFeaturedTours,
  hasDiscoverPlaces,
} = useDiscoveryContent(userLocation);

const {
  canOpenDiscoveryItem,
  openDiscoveryItem,
  openDiscoverPlaces,
  discoverPlacesEntry,
  languageSheetProps,
} = useDiscoveryNavigation();

const showDiscoverPlacesEntry =
  hasDiscoverPlaces && discoverPlacesEntry.isVisible;






  useEffect(() => {
    let mounted = true;
    const startTime = Date.now();

    const finishLoading = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 10000 - elapsed);

      setTimeout(() => {
        if (mounted) {
          setLoading(false);
        }
      }, remaining);
    };

    finishLoading();

    return () => {
      mounted = false;
    };
  }, []);

  const cityName = detectedCity?.name ?? t.recommendations.defaultCityName;

  const hasContentInDetectedZone =
  featuredToursInDetectedZone.length > 0 ||
  discoverPlacesInDetectedZone.length > 0;

const zoneName =
  hasContentInDetectedZone && detectedZone
    ? detectedZone.name
    : null;

const { headerSubtitle } = getRecommendationsCopy({
  t,
  cityName,
  zoneName,
  hasSupportedCity,
  hasFeaturedTours,
  hasDiscoverPlaces,
});
const isEmpty = featuredTours.length === 0 && !showDiscoverPlacesEntry;
 

if (needsTutorial) {
  return null;
}

if (loading) {
    return (
      <>
        <StatusBar style="dark" />
        <LoadingSearchScreen
          title={t.recommendations.loadingTitle}
        />
      </>
    );
  }

  return (
    <LinearGradient
      colors={TOUR_GRADIENT_COLORS}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
        <View style={styles.header}>
          <Text style={styles.title}>{t.recommendations.title}</Text>
          {isEmpty ? null : <Text style={styles.subtitle}>{headerSubtitle}</Text>}
        </View>

        <View style={styles.cards}>
          {isEmpty ? (
            <GuiaStateCard
              title={t.recommendations.emptyTitle}
              message={headerSubtitle}
            />
          ) : null}
          {featuredTours.map((tour) => (
  <TourCard
    key={tour.id}
    icon={getDiscoveryItemIcon(tour)}
    title={tour.title}
    desc={tour.subtitle}
    duration={getDiscoveryItemDurationLabel(tour)}
    onPress={
      canOpenDiscoveryItem(tour)
        ? () => openDiscoveryItem(tour)
        : undefined
    }
  />
))}

          {showDiscoverPlacesEntry ? (
  <Pressable
    style={[styles.card, styles.exploreCard]}
    onPress={openDiscoverPlaces}
  >
    <View style={styles.exploreContent}>
      <Text style={styles.cardTitle}>{discoverPlacesEntry.title}</Text>
<Text style={styles.exploreDesc}>
  {discoverPlacesEntry.subtitle}
</Text>
    </View>

    <View style={styles.exploreArrow}>
      <Ionicons name="chevron-forward" size={20} color={TOUR_TEXT_PRIMARY} />
    </View>
  </Pressable>
) : null}
        </View>
        </ScrollView>
      </SafeAreaView>

      <TourLanguageSheet {...languageSheetProps} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  header: {
    paddingTop: 25,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  title: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_DISPLAY,
    color: TOUR_TEXT_PRIMARY,
    letterSpacing: -0.5,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 12,
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_LG,
    color: TOUR_TEXT_SECONDARY,
    textAlign: "center",
  },

  cards: {
    marginTop: 32,
    paddingHorizontal: 20,
    gap: 18,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: TOUR_ACCENT_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },

  cardHeading: {
    flex: 1,
  },

  cardTitle: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_XL,
    color: TOUR_TEXT_PRIMARY,
  },

  cardTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },

  cardTime: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_SM,
    color: TOUR_TEXT_MUTED,
  },

  cardDesc: {
    marginTop: 12,
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_MD,
    color: TOUR_TEXT_SECONDARY,
  },

  // "Descubre lugares": misma tarjeta, con el chevron a la derecha.
  exploreCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },

  exploreContent: {
    flex: 1,
  },

  exploreDesc: {
    marginTop: 4,
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_MD,
    color: TOUR_TEXT_SECONDARY,
  },

  exploreArrow: {
    paddingLeft: 12,
  },

});