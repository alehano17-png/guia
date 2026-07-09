type Coordinates = {
  latitude: number;
  longitude: number;
};

type UserLocation = Coordinates | null;

type Input = {
  userLocation: UserLocation;
  previewDestination: Coordinates;
};

type Output = {
  mapLatitude: number;
  mapLongitude: number;
  mapLatitudeDelta: number;
  mapLongitudeDelta: number;
};

export function getTourMapRegion({
  userLocation,
  previewDestination,
}: Input): Output {
  const mapLatitude = userLocation
    ? (userLocation.latitude + previewDestination.latitude) / 2
    : previewDestination.latitude;

  const mapLongitude = userLocation
    ? (userLocation.longitude + previewDestination.longitude) / 2
    : previewDestination.longitude;

  const mapLatitudeDelta = userLocation
    ? Math.max(
        Math.abs(userLocation.latitude - previewDestination.latitude) * 2.2,
        0.02
      )
    : 0.01;

  const mapLongitudeDelta = userLocation
    ? Math.max(
        Math.abs(userLocation.longitude - previewDestination.longitude) * 2.2,
        0.02
      )
    : 0.01;

  return {
    mapLatitude,
    mapLongitude,
    mapLatitudeDelta,
    mapLongitudeDelta,
  };
}
