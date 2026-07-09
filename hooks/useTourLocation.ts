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
    const loadLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationPermissionGranted(false);
          return;
        }

        setLocationPermissionGranted(true);

        const current = await Location.getCurrentPositionAsync({});

        setUserLocation({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
      } catch (error) {
        console.log("Error ubicación:", error);
      }
    };

    loadLocation();
  }, []);

  return {
    userLocation,
    locationPermissionGranted,
  };
}
