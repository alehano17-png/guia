import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getDiscoveryItemStatus
} from "../data/discovery/behavior";
import { discoveryCopy } from "../data/discovery/copy";
import { getDiscoveryItemMetaLabel } from "../data/discovery/presentation";
import { useDiscoveryNavigation } from "../hooks/useDiscoveryNavigation";

import { useDiscoveryContent } from "../hooks/useDiscoveryContent";
import { useTourLocation } from "../hooks/useTourLocation";

type PlaceCardProps = {
  title: string;
  subtitle: string;
  meta: string;
  status?: string;
  onPress?: () => void;
};

function PlaceCard({ title, subtitle, meta, status, onPress }: PlaceCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle}>{title}</Text>

          {status ? (
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.cardSubtitle}>{subtitle}</Text>
        <Text style={styles.cardMeta}>{meta}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#221B35" />
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const { userLocation } = useTourLocation();
  const { discoverPlaces } = useDiscoveryContent(userLocation);

  const { canOpenDiscoveryItem, openDiscoveryItem } = useDiscoveryNavigation();

  return (
    <LinearGradient
      colors={["#F3E8FF", "#D8B4FE", "#A78BFA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable style={styles.topAction} onPress={() => router.back()}>
            <Ionicons name="close" size={16} color="#5D5476" />
            <Text style={styles.topActionText}>{discoveryCopy.discover.backLabel}</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.title}>{discoveryCopy.discover.title}</Text>
          <Text style={styles.subtitle}>
  {discoveryCopy.discover.subtitle}
</Text>

          <View style={styles.sectionPill}>
            <Text style={styles.sectionPillText}>{discoveryCopy.discover.sectionLabel}</Text>
          </View>

          <View style={styles.cards}>
            {discoverPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                title={place.title}
                subtitle={place.subtitle}
                meta={getDiscoveryItemMetaLabel(place)}
                status={getDiscoveryItemStatus(place)}
onPress={
  canOpenDiscoveryItem(place)
    ? () => openDiscoveryItem(place)
    : undefined
}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 6,
    marginBottom: 8,
  },

  topAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },

  topActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5D5476",
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#221B35",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: "#5D5476",
    marginBottom: 22,
  },

  sectionPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.30)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 14,
  },

  sectionPillText: {
    fontSize: 13,
    color: "#221B35",
  },

  cards: {
    gap: 14,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.42)",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },

  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#221B35",
  },

  cardSubtitle: {
    fontSize: 15,
    color: "#5D5476",
    marginBottom: 6,
  },

  cardMeta: {
    fontSize: 13,
    color: "#5D5476",
  },

  statusPill: {
    backgroundColor: "rgba(255,255,255,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#221B35",
  },
});