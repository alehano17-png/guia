import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

type ActionCardData = {
  tag: string;
  title: string;
  subtitle: string;
};

type PreviewDestination = {
  title: string;
  latitude: number;
  longitude: number;
};

type Props = {
  showActionCard: boolean;
  actionCardData?: ActionCardData;
  onOpenPreviewRoute: () => void;
  locationPermissionGranted: boolean;
  mapLatitude: number;
  mapLongitude: number;
  mapLatitudeDelta: number;
  mapLongitudeDelta: number;
  previewDestination: PreviewDestination;
  previewInfoText?: string;
};

export default function TourMediaBlock({
  showActionCard,
  actionCardData,
  onOpenPreviewRoute,
  locationPermissionGranted,
  mapLatitude,
  mapLongitude,
  mapLatitudeDelta,
  mapLongitudeDelta,
  previewDestination,
  previewInfoText,
}: Props) {
  return (
    <View style={styles.mediaBlock}>
      {showActionCard && actionCardData ? (
        <View style={styles.actionCard}>
          <View style={styles.actionTag}>
            <Ionicons name="walk-outline" size={14} color="#7C8DF5" />
            <Text style={styles.actionTagText}>{actionCardData.tag}</Text>
          </View>

          <Text style={styles.actionTitle}>
            {actionCardData.title}
          </Text>

          <Text style={styles.actionSubtitle}>
            {actionCardData.subtitle}
          </Text>
        </View>
      ) : (
        <>
          <Pressable onPress={onOpenPreviewRoute} style={styles.mapCard}>
            <MapView
              mapType="standard"
              userInterfaceStyle="light"
              showsUserLocation={locationPermissionGranted}
              showsMyLocationButton={false}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              style={styles.mapInner}
              region={{
                latitude: mapLatitude,
                longitude: mapLongitude,
                latitudeDelta: mapLatitudeDelta,
                longitudeDelta: mapLongitudeDelta,
              }}
            >
              <Marker
                coordinate={{
                  latitude: previewDestination.latitude,
                  longitude: previewDestination.longitude,
                }}
                title={previewDestination.title}
              />
            </MapView>

            <BlurView
              intensity={5}
              tint="light"
              style={styles.mapPreviewOverlay}
            >
              <View style={styles.mapPreviewCta}>
                <Ionicons name="navigate-outline" size={16} color="#FFF" />
                <Text style={styles.mapPreviewCtaText}>Abrir Maps</Text>
              </View>
            </BlurView>
          </Pressable>

          <Text style={styles.previewInfoText}>
            {previewInfoText ?? " "}
          </Text>
        </>
      )}

      <View style={styles.separator} />
    </View>
  );
}

const styles = StyleSheet.create({
  mediaBlock: {
    marginTop: 42,
    height: 210,
    justifyContent: "flex-start",
  },

  mapCard: {
    height: 152,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    overflow: "hidden",
  },

  mapInner: {
    flex: 1,
    borderRadius: 16,
  },

  mapPreviewOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  mapPreviewCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#7C8DF5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },

  mapPreviewCtaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },

  previewInfoText: {
  fontSize: 13,
  lineHeight: 18,
  color: "#5D5476",
  textAlign: "center",
  marginTop: 16,
  minHeight: 18,
},

  separator: {
    height: 1,
    backgroundColor: "rgba(34,27,53,0.10)",
    marginVertical: 16,
  },

  actionCard: {
    height: 178,
    backgroundColor: "rgba(255,255,255,0.50)",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    justifyContent: "flex-start",
    marginBottom: 0,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  actionTag: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 14,
    height: 32,
  },

  actionTagText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5D5476",
  },

  actionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: "#221B35",
    textAlign: "center",
    marginBottom: 8,
    height: 48,
  },

  actionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5D5476",
    textAlign: "center",
    height: 40,
  },
});
