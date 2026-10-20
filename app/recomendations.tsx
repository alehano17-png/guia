import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Animated,
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
import ScrollIndicator from "../components/ScrollIndicator";
import { getDiscoveryItemStatus } from "../data/discovery/behavior";
import type { DiscoveryCatalogItem } from "../data/discovery/catalog";
import {
  getDiscoveryItemGradient,
  getDiscoveryItemIcon,
  type DiscoveryGradient,
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
  FONT_SIZE_SM,
} from "../lib/typography";

type TourCardProps = {
  icon: DiscoveryIcon;
  gradient: DiscoveryGradient;
  title: string;
  desc: string;
  duration: string;
  // Lugares "próximamente": la tarjeta se ve atenuada.
  dimmed?: boolean;
  onPress?: () => void;
};

function TourCard({
  icon: Icon,
  gradient,
  title,
  desc,
  duration,
  dimmed,
  onPress,
}: TourCardProps) {
  return (
    <Pressable
      style={[styles.card, styles.tourCard, dimmed && styles.tourCardDimmed]}
      onPress={onPress}
    >
      {/* La sombra va en este View y no en el degradado: en iOS el
          LinearGradient recortado pierde la sombra. */}
      <View style={styles.tourIconShadow}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tourIconBox}
        >
          <Icon size={36} color="#FFFFFF" strokeWidth={1.75} />
        </LinearGradient>
      </View>

      <View style={styles.tourTexts}>
        <Text style={styles.tourTitle}>{title}</Text>
        <Text style={styles.tourDesc}>{desc}</Text>
        <Text style={styles.tourTime}>{duration}</Text>
      </View>
    </Pressable>
  );
}

export default function Recommendations() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  // Medidas para la barra de scroll propia (ScrollIndicator).
  const scrollY = useState(() => new Animated.Value(0))[0];
  const [contentHeight, setContentHeight] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);
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
  discoverPlaces,
  featuredToursInDetectedZone,
  discoverPlacesInDetectedZone,
  hasFeaturedTours,
  hasDiscoverPlaces,
} = useDiscoveryContent(userLocation);

const {
  canOpenDiscoveryItem,
  openDiscoveryItem,
  languageSheetProps,
} = useDiscoveryNavigation();

// Tours y lugares van en la misma lista, con la misma tarjeta: primero los
// tours, después los lugares. Los que no se pueden abrir (próximamente) se
// ven atenuados y muestran su estado en vez de la duración.
const listItems: DiscoveryCatalogItem[] = [...featuredTours, ...discoverPlaces];






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
const isEmpty = listItems.length === 0;
 

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
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          onContentSizeChange={(_, height) => setContentHeight(height)}
          onLayout={(e) => setViewHeight(e.nativeEvent.layout.height)}
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
          {listItems.map((item) => {
            const canOpen = canOpenDiscoveryItem(item);
            return (
              <TourCard
                key={item.id}
                icon={getDiscoveryItemIcon(item)}
                gradient={getDiscoveryItemGradient(item)}
                title={item.title}
                desc={item.subtitle}
                duration={
                  canOpen
                    ? getDiscoveryItemDurationLabel(item)
                    : getDiscoveryItemStatus(item, t) ??
                      getDiscoveryItemDurationLabel(item)
                }
                dimmed={!canOpen}
                onPress={canOpen ? () => openDiscoveryItem(item) : undefined}
              />
            );
          })}
        </View>
        </ScrollView>

        {/* Encima del ScrollView, a la derecha; termina antes del home
            indicator. */}
        <ScrollIndicator
          scrollY={scrollY}
          contentHeight={contentHeight}
          viewHeight={viewHeight}
          style={{ top: 8, bottom: insets.bottom + 8 }}
        />
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

  tourCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  tourCardDimmed: {
    opacity: 0.6,
  },

  tourIconShadow: {
    borderRadius: 22,
    shadowColor: "#6957DF",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  tourIconBox: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  tourTexts: {
    flex: 1,
  },

  tourTitle: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: 21,
    color: TOUR_TEXT_PRIMARY,
  },

  tourDesc: {
    marginTop: 2,
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: 15,
    color: TOUR_TEXT_SECONDARY,
  },

  tourTime: {
    marginTop: 6,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_SM,
    color: HOME_BUTTON_TEXT_COLOR,
  },

});