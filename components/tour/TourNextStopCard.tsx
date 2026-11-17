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
  // La persona llegó al siguiente lugar (GPS): la tarjeta pregunta
  // "¿Llegaste?", con borde de acento y el botón "Escuchar".
  askingArrival?: boolean;
  // Nombre del lugar al que llegó (el mismo destino de la tarjeta).
  arrivalTitle?: string;
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
// Al llegar al siguiente lugar (askingArrival) pregunta "¿Llegaste?": misma
// tarjeta y mismo tamaño, con borde de acento y el botón "Escuchar".
export default function TourNextStopCard({
  mode,
  showMap,
  previewDestination,
  walkTime,
  actionCard,
  buttonLabel,
  onPress,
  askingArrival = false,
  arrivalTitle,
  onOpenPreviewRoute,
  locationPermissionGranted,
  mapLatitude,
  mapLongitude,
  mapLatitudeDelta,
  mapLongitudeDelta,
}: Props) {
  const { t } = useTranslation();
  const isLast = mode === "last";
  // Mientras pregunta, el texto de indicaciones (actionCard) no aplica.
  const compactCard = askingArrival ? undefined : actionCard;

  const button = (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>
        {askingArrival ? t.tour.arrivalListen : buttonLabel}
      </Text>
      <Ionicons
        name={askingArrival ? "play" : "arrow-forward"}
        size={18}
        color="#FFFFFF"
      />
    </Pressable>
  );

  if (mode === "closing") return button;

  return (
    <View style={[styles.card, askingArrival && styles.cardAsking]}>
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
            {askingArrival
              ? t.tour.arrivalQuestion
              : isLast
                ? t.tour.lastStopLabel
                : t.tour.nextStopLabel}
          </Text>

          <Text
            style={[styles.title, compactCard && styles.titleCompact]}
            numberOfLines={compactCard ? 3 : 2}
          >
            {compactCard
              ? compactCard.title
              : askingArrival
                ? (arrivalTitle ?? previewDestination.title)
                : previewDestination.title}
          </Text>

          {askingArrival ? (
            <Text style={styles.secondaryText} numberOfLines={2}>
              {t.tour.arrivalHint}
            </Text>
          ) : compactCard ? (
            <Text style={styles.secondaryText} numberOfLines={2}>
              {compactCard.subtitle}
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
  // El borde de 2 px está siempre (transparente salvo al preguntar) y el
  // padding es 12 en vez de 14: así el tamaño de la tarjeta es exactamente
  // el mismo con y sin la pregunta.
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: TOUR_ACCENT_COLOR,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  cardAsking: {
    borderColor: TOUR_ACCENT_COLOR,
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
