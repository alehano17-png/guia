import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import type { TourCardMode } from "../../data/tours/preview";
import MapOpenOverlay from "./MapOpenOverlay";
import { useTranslation } from "../../lib/i18n/useTranslation";
import {
  TOUR_ACCENT_COLOR,
  TOUR_TEXT_MUTED,
  TOUR_TEXT_PRIMARY,
} from "../../lib/tourTheme";
import {
  FONT_BOLD,
  FONT_REGULAR,
  FONT_SIZE_LG,
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
  mode: TourCardMode;
  // false: sin el cuadro del mapa ni el enlace "Abrir mapa"; el texto
  // ocupa todo el ancho.
  showMap: boolean;
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
// En "last" la etiqueta pasa a "Última parada" y no hay tiempo a pie (el
// destino ya es la propia parada); en "closing" solo queda el botón.
export default function TourNextStopCard({
  mode,
  showMap,
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
  const isLast = mode === "last";

  const button = (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{buttonLabel}</Text>
      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
    </Pressable>
  );

  if (mode === "closing") return button;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {showMap ? (
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

            <MapOpenOverlay label={t.tour.openMapsLink} />
          </Pressable>
        ) : null}

        <View style={styles.textColumn}>
          <Text style={styles.label}>
            {isLast ? t.tour.lastStopLabel : t.tour.nextStopLabel}
          </Text>

          <Text
            style={[styles.title, actionCard && styles.titleCompact]}
            numberOfLines={actionCard ? 3 : 2}
          >
            {actionCard ? actionCard.title : previewDestination.title}
          </Text>

          {actionCard ? (
            <Text style={styles.secondaryText} numberOfLines={2}>
              {actionCard.subtitle}
            </Text>
          ) : isLast || !walkTime ? null : (
            <View style={styles.walkRow}>
              <Ionicons name="walk-outline" size={16} color={TOUR_TEXT_MUTED} />
              <Text style={styles.secondaryText}>{walkTime}</Text>
            </View>
          )}

        </View>
      </View>

      <View style={styles.buttonSpacer}>{button}</View>
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

  // Indicaciones (actionCard): textos más largos, un paso más chico.
  titleCompact: {
    fontSize: FONT_SIZE_LG,
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

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: TOUR_ACCENT_COLOR,
    borderRadius: 999,
    paddingVertical: 16,
  },

  buttonSpacer: {
    marginTop: 12,
  },

  buttonText: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_MD,
    color: "#FFFFFF",
  },
});
