import type { TourSkeleton } from "../skeleton-types";

export const barrancoSkeleton: TourSkeleton = {
  id: "barranco",
  steps: [
    {
      id: "inicio-barranco",
      latitude: -12.14958,
      longitude: -77.02124,
      startRoute: {
        latitude: -12.14958,
        longitude: -77.02124,
        nextStepId: "parque-municipal",
      },
    },

    {
      id: "parque-municipal",
      nextId: "murales",
      latitude: -12.14958,
      longitude: -77.02124,
    },

    {
      id: "murales",
      nextId: "puente-suspiros",
      latitude: -12.14936,
      longitude: -77.021932,
    },

    {
      id: "puente-suspiros",
      nextId: "ermita",
      latitude: -12.14914,
      longitude: -77.022624,
    },

    {
      id: "ermita",
      nextId: "mirador",
      hasActionCard: true,
    },

    {
      id: "mirador",
      nextId: "bajada-banos",
      hasActionCard: true,
    },

    {
      id: "bajada-banos",
      nextId: "fin-tour-barranco",
      latitude: -12.149187,
      longitude: -77.022453,
    },

    {
      id: "fin-tour-barranco",
      end: true,
    },
  ],
};
