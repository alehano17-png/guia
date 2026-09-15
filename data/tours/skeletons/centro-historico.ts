import type { TourSkeleton } from "../skeleton-types";

export const centroHistoricoSkeleton: TourSkeleton = {
  id: "centro-historico",
  steps: [
    {
      id: "inicio-centro",
      latitude: -12.051389,
      longitude: -77.030556,
      startRoute: {
        latitude: -12.051389,
        longitude: -77.030556,
        nextStepId: "plaza-san-martin",
      },
    },

    {
      id: "plaza-san-martin",
      nextId: "plaza-mayor",
      latitude: -12.051389,
      longitude: -77.030556,
    },

    {
      id: "plaza-mayor",
      nextId: "casa-aliaga",
      latitude: -12.046,
      longitude: -77.0305,
    },

    {
      id: "casa-aliaga",
      nextId: "catedral",
      hasActionCard: true,
    },

    {
      id: "catedral",
      nextId: "pasaje-santa-rosa",
      hasActionCard: true,
    },

    {
      id: "pasaje-santa-rosa",
      nextId: "san-francisco",
      hasActionCard: true,
    },

    {
      id: "san-francisco",
      nextId: "parque-muralla",
      hasActionCard: true,
    },

    {
      id: "parque-muralla",
      nextId: "fin-tour-centro",
      latitude: -12.044582,
      longitude: -77.026443,
    },

    {
      id: "fin-tour-centro",
      end: true,
    },
  ],
};
