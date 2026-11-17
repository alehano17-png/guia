import * as Location from "expo-location";
import { useEffect, useState } from "react";

type UserLocation = {
  latitude: number;
  longitude: number;
} | null;

export function useTourLocation() {
  const [userLocation, setUserLocation] = useState<UserLocation>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  // Margen de error (en metros) que informa el celular para la última
  // posición. Para la futura narración automática: si el margen de error es
  // grande, solo preguntar.
  const [locationAccuracyMeters, setLocationAccuracyMeters] = useState<number | null>(null);

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
        // llegada por GPS en segundo plano (modo bolsillo) queda para más
        // adelante. Precisión alta y actualizaciones frecuentes: la llegada
        // se mide con un margen de 15 m (data/tours/arrival.ts).
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 5,
          },
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setLocationAccuracyMeters(position.coords.accuracy ?? null);
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
    locationAccuracyMeters,
  };
}
