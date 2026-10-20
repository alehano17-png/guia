import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
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
import {
  getDiscoveryItemIcon,
  type DiscoveryIcon,
} from "../data/discovery/iconHelpers";
import { getDiscoveryItemDurationLabel } from "../data/discovery/presentation";
import { getRecommendationsCopy } from "../data/discovery/recommendationsCopy";
import { useDiscoveryContent } from "../hooks/useDiscoveryContent";
import { useDiscoveryNavigation } from "../hooks/useDiscoveryNavigation";
import { useTourLocation } from "../hooks/useTourLocation";
import { HOME_BUTTON_TEXT_COLOR } from "../lib/homeTheme";
import { useTranslation } from "../lib/i18n/useTranslation";
import {
  TOUR_ACCENT_COLOR,
  TOUR_GRADIENT_COLORS,
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

// Ícono de fondo de la tarjeta de tour: grande, tenue y cortado por el
// borde derecho.
const TOUR_ICON_SIZE = 120;

type TourCardProps = {
  icon: DiscoveryIcon;
  title: string;
  desc: string;
  duration: string;
  onPress?: () => void;
};

function TourCard({ icon: Icon, title, desc, duration, onPress }: TourCardProps) {
  return (
    <Pressable style={[styles.card, styles.tourCard]} onPress={onPress}>
      {/* Marca de agua: va primero para quedar detrás del texto. El recorte
          va en esta capa y no en la tarjeta, porque en iOS overflow hidden
          en la vista con sombra la hace desaparecer. */}
      <View style={styles.tourIconClip} pointerEvents="none">
        <View style={styles.tourIcon}>
          <Icon size={TOUR_ICON_SIZE} color={TOUR_ACCENT_COLOR} />
        </View>
      </View>

      <View style={styles.tourTexts}>
        <Text style={styles.tourTitle}>{title}</Text>
        <Text style={styles.tourDesc}>{desc}</Text>
        <View style={styles.tourTimeRow}>
          <Ionicons name="time-outline" size={14} color={HOME_BUTTON_TEXT_COLOR} />
          <Text style={styles.tourTime}>{duration}</Text>
        </View>
      </View>
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

  cardTitle: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_XL,
    color: TOUR_TEXT_PRIMARY,
  },

  tourCard: {
    padding: 18,
    minHeight: 112,
    justifyContent: "center",
  },

  tourIconClip: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    overflow: "hidden",
  },

  // Centrado vertical y subido 10px; right -14 lo recorta solo con el
  // borde derecho.
  tourIcon: {
    position: "absolute",
    right: -14,
    top: "50%",
    marginTop: -TOUR_ICON_SIZE / 2 - 10,
    opacity: 0.22,
  },

  // paddingRight 70: el texto no llega a la zona visible del ícono.
  tourTexts: {
    paddingRight: 70,
  },

  tourTitle: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: 22,
    color: TOUR_TEXT_PRIMARY,
  },

  tourDesc: {
    marginTop: 4,
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_MD,
    color: TOUR_TEXT_SECONDARY,
  },

  tourTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },

  tourTime: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_SM,
    color: HOME_BUTTON_TEXT_COLOR,
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