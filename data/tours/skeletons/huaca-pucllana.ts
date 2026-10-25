import type { TourSkeleton } from "../skeleton-types";

export const huacaPucllanaSkeleton: TourSkeleton = {
  id: "huaca-pucllana",
  steps: [
    {
      id: "inicio-huaca-pucllana",
      latitude: -12.110807,
      longitude: -77.034034,
      startRoute: {
        latitude: -12.110807,
        longitude: -77.034034,
        nextStepId: "huaca-exterior",
      },
    },

    {
      id: "huaca-exterior",
      latitude: -12.110807,
      longitude: -77.034034,
      nextId: "huaca-power-1",
      hasActionCard: true,
    },

    {
      id: "huaca-power-1",
      nextId: "huaca-power-2",
      hasActionCard: true,
    },

    {
      id: "huaca-power-2",
      nextId: "huaca-power-3",
      hasActionCard: true,
    },

    {
      id: "huaca-power-3",
      nextId: "huaca-power-4",
      hasActionCard: true,
    },

    {
      id: "huaca-power-4",
      nextId: "huaca-power-5",
      hasActionCard: true,
    },

    {
      id: "huaca-power-5",
      nextId: "fin-tour-huaca",
      hasActionCard: true,
    },

    {
      id: "fin-tour-huaca",
      end: true,
    },
  ],
};
