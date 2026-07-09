export type SupportedCity = {
  id: string;
  name: string;
  bounds: {
    minLatitude: number;
    maxLatitude: number;
    minLongitude: number;
    maxLongitude: number;
  };
};

export const supportedCities: SupportedCity[] = [
  {
    id: "lima",
    name: "Lima",
    bounds: {
      minLatitude: -12.35,
      maxLatitude: -11.75,
      minLongitude: -77.20,
      maxLongitude: -76.80,
    },
  },
];

export function getSupportedCityById(cityId: string | null): SupportedCity | null {
  if (!cityId) return null;

  return supportedCities.find((city) => city.id === cityId) ?? null;
}
