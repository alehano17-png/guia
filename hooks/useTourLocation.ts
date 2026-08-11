import * as Location from "expo-location";
import { useEffect, useState } from "react";

type UserLocation = {
  latitude: number;
  longitude: number;
} | null;

export function useTourLocation() {
  const [userLocation, setUserLocation] = useState<UserLocation>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    const startWatching = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationPermissionGranted(false);
          return;
        }

        if (cancelled) return;
        setLocationPermissionGranted(true);

        // Solo mientras la app está en primer plano: la detección de
        // llegada por GPS en segundo plano queda para más adelante.
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        );
      } catch (error) {
        console.log("Error ubicación:", error);
      }
    };

    startWatching();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return {
    userLocation,
    locationPermissionGranted,
  };
}
