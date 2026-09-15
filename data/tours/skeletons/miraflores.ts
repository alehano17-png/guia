import type { TourSkeleton } from "../skeleton-types";

export const mirafloresSkeleton: TourSkeleton = {
  id: "miraflores-completo",
  steps: [
    {
      id: "inicio-miraflores",
      latitude: -12.123722,
      longitude: -77.040097,
      startRoute: {
        latitude: -12.123722,
        longitude: -77.040097,
        nextStepId: "faro",
      },
    },

    {
      id: "faro",
      nextId: "malecon",
      latitude: -12.123722,
      longitude: -77.040097,
    },

    {
      id: "malecon",
      nextId: "parque-amor",
      latitude: -12.1245,
      longitude: -77.03869,
    },

    {
      id: "parque-amor",
      nextId: "villena",
      latitude: -12.1267984,
      longitude: -77.0365665,
    },

    {
      id: "villena",
      nextId: "larcomar",
      latitude: -12.127552,
      longitude: -77.035575,
    },

    {
      id: "larcomar",
      nextId: "fin-tour-miraflores",
      latitude: -12.1322691,
      longitude: -77.0301446,
    },

    {
      id: "fin-tour-miraflores",
      end: true,
    },
  ],
};
