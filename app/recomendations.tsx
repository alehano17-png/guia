import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingSearchScreen from "../components/tour/LoadingSearchScreen";
import { discoveryCopy } from "../data/discovery/copy";
import { getDiscoveryItemImage, hasDiscoveryItemImage } from "../data/discovery/mediaHelpers";
import { getDiscoveryItemDurationLabel } from "../data/discovery/presentation";
import { getRecommendationsCopy } from "../data/discovery/recommendationsCopy";
import { useDiscoveryContent } from "../hooks/useDiscoveryContent";
import { useDiscoveryNavigation } from "../hooks/useDiscoveryNavigation";
import { useTourLocation } from "../hooks/useTourLocation";

type TourCardProps = {
  image?: any;
  hasImage: boolean;
  title: string;
  desc: string;
  duration: string;
  onPress?: () => void;
};

function TourCard({
  image,
  hasImage,
  title,
  desc,
  duration,
  onPress,
}: TourCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {hasImage ? (
        <Image source={image} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImageFallback}>
          <Text style={styles.cardImageFallbackText}>
            {title.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
        <Text style={styles.cardTime}>{duration}</Text>
      </View>
    </Pressable>
  );
}

export default function Recommendations() {
  const [loading, setLoading] = useState(true);

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

  const cityName = detectedCity?.name ?? "tu ciudad";

  const hasContentInDetectedZone =
  featuredToursInDetectedZone.length > 0 ||
  discoverPlacesInDetectedZone.length > 0;

const zoneName =
  hasContentInDetectedZone && detectedZone
    ? detectedZone.name
    : null;

const { loadingSubtitle, headerSubtitle } = getRecommendationsCopy({
  cityName,
  zoneName,
  hasSupportedCity,
  hasFeaturedTours,
  hasDiscoverPlaces,
});
 

if (loading) {
    return (
      <>
        <StatusBar translucent backgroundColor="transparent" style="dark" />
        <LoadingSearchScreen
          title={discoveryCopy.recommendations.loadingTitle}
          subtitle={loadingSubtitle}
        />
      </>
    );
  }

  return (
    <LinearGradient
      colors={["#F3E8FF", "#D8B4FE", "#A78BFA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar translucent backgroundColor="transparent" style="dark" />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{discoveryCopy.recommendations.title}</Text>
          <Text style={styles.subtitle}>{headerSubtitle}</Text>
        </View>

        <View style={styles.cards}>
          {featuredTours.map((tour) => (
  <TourCard
    key={tour.id}
    image={getDiscoveryItemImage(tour)}
    hasImage={hasDiscoveryItemImage(tour)}
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
    style={styles.card}
    onPress={openDiscoverPlaces}
  >
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{discoverPlacesEntry.title}</Text>
<Text style={styles.cardDesc}>
  {discoverPlacesEntry.subtitle}
</Text>
    </View>

    <View style={styles.exploreArrow}>
      <Ionicons name="chevron-forward" size={20} color="#111827" />
    </View>
  </Pressable>
) : null}
        </View>
      </SafeAreaView>
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

  exploreArrow: {
    justifyContent: "center",
    paddingRight: 16,
  },

  cardImageFallback: {
    width: 110,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  cardImageFallbackText: {
    fontSize: 34,
    fontWeight: "700",
    color: "#6D28D9",
  },

});