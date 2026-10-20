import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { HOME_BUTTON_TEXT_COLOR } from "../../lib/homeTheme";
import { useTranslation } from "../../lib/i18n/useTranslation";
import {
  TOUR_ACCENT_COLOR,
  TOUR_TEXT_MUTED,
  TOUR_TEXT_PRIMARY,
} from "../../lib/tourTheme";
import {
  FONT_BOLD,
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_SIZE_MD,
  FONT_SIZE_SM,
  FONT_SIZE_XL,
  FONT_SIZE_XS,
} from "../../lib/typography";

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
  previewDestination: PreviewDestination;
  walkTime?: string;
  actionCard?: ActionCardData;
  buttonLabel: string;
  onPress: () => void;
  onOpenPreviewRoute: () => void;
  locationPermissionGranted: boolean;
  mapLatitude: number;
  mapLongitude: number;
  mapLatitudeDelta: number;
  mapLongitudeDelta: number;
};

// Tarjeta "Siguiente parada" pegada abajo de la pantalla del tour. En los
// pasos de confirmación (actionCard) muestra su título y subtítulo en vez
// del destino y el tiempo a pie; la etiqueta, el mapa y el botón no cambian.
export default function TourNextStopCard({
  previewDestination,
  walkTime,
  actionCard,
  buttonLabel,
  onPress,
  onOpenPreviewRoute,
  locationPermissionGranted,
  mapLatitude,
  mapLongitude,
  mapLatitudeDelta,
  mapLongitudeDelta,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Pressable
          style={styles.mapBox}
          onPress={onOpenPreviewRoute}
          accessibilityRole="button"
          accessibilityLabel={t.tour.openMaps}
        >
          {/* pointerEvents "none": el toque lo recibe el Pressable, no el mapa. */}
          <MapView
            pointerEvents="none"
            mapType="standard"
            userInterfaceStyle="light"
            showsUserLocation={locationPermissionGranted}
            showsMyLocationButton={false}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            style={StyleSheet.absoluteFill}
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
        </Pressable>

        <View style={styles.textColumn}>
          <Text style={styles.label}>{t.tour.nextStopLabel}</Text>

          <Text style={styles.title} numberOfLines={2}>
            {actionCard ? actionCard.title : previewDestination.title}
          </Text>

          {actionCard ? (
            <Text style={styles.secondaryText}>{actionCard.subtitle}</Text>
          ) : (
            <View style={styles.walkRow}>
              <Ionicons name="walk-outline" size={16} color={TOUR_TEXT_MUTED} />
              <Text style={styles.secondaryText}>
                {walkTime ?? t.tour.walkTimeUnknown}
              </Text>
            </View>
          )}

          <Pressable onPress={onOpenPreviewRoute} hitSlop={8}>
            <Text style={styles.mapsLink}>{t.tour.openMapsLink}</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{buttonLabel}</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 14,
    shadowColor: TOUR_ACCENT_COLOR,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  mapBox: {
    width: 96,
    height: 96,
    borderRadius: 18,
    overflow: "hidden",
  },

  textColumn: {
    flex: 1,
  },

  label: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_XS,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: TOUR_ACCENT_COLOR,
    marginBottom: 4,
  },

  title: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_XL,
    color: TOUR_TEXT_PRIMARY,
    marginBottom: 4,
  },

  walkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  secondaryText: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_SM,
    color: TOUR_TEXT_MUTED,
  },

  mapsLink: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_SM,
    color: HOME_BUTTON_TEXT_COLOR,
    textDecorationLine: "underline",
    marginTop: 6,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: TOUR_ACCENT_COLOR,
    borderRadius: 999,
    paddingVertical: 16,
    marginTop: 12,
  },

  buttonText: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_MD,
    color: "#FFFFFF",
  },
});
