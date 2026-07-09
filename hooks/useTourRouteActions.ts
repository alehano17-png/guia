import { useCallback } from "react";
import { Linking, Platform } from "react-native";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type StartRoute =
  | {
      latitude: number;
      longitude: number;
    }
  | undefined;

type Params = {
  startRoute?: StartRoute;
  previewDestination: Coordinates;
  isGuidedStart: boolean;
  onStartMapViewed: () => void;
};

function getWalkingRouteUrl(destination: Coordinates) {
  return Platform.OS === "ios"
    ? `http://maps.apple.com/?daddr=${destination.latitude},${destination.longitude}&dirflg=w`
    : `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=walking`;
}

export function useTourRouteActions({
  startRoute,
  previewDestination,
  isGuidedStart,
  onStartMapViewed,
}: Params) {
  const openStartRoute = useCallback(async () => {
    if (!startRoute) return;

    try {
      await Linking.openURL(getWalkingRouteUrl(startRoute));
      onStartMapViewed();
    } catch (error) {
      console.log("Error abriendo ruta:", error);
    }
  }, [startRoute, onStartMapViewed]);

  const openPreviewRoute = useCallback(async () => {
    try {
      await Linking.openURL(getWalkingRouteUrl(previewDestination));

      if (isGuidedStart) {
        onStartMapViewed();
      }
    } catch (error) {
      console.log("Error abriendo ruta:", error);
    }
  }, [previewDestination, isGuidedStart, onStartMapViewed]);

  return {
    openStartRoute,
    openPreviewRoute,
  };
}
