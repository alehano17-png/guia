import type { TourSkeleton } from "../skeleton-types";

export const centroHistoricoSkeleton: TourSkeleton = {
  id: "centro-historico",
  steps: [
    {
      id: "inicio-centro",
      latitude: -12.051657,
      longitude: -77.034605,
      startRoute: {
        latitude: -12.051657,
        longitude: -77.034605,
        nextStepId: "plaza-san-martin",
      },
    },

    {
      id: "plaza-san-martin",
      nextId: "plaza-mayor",
      latitude: -12.051657,
      longitude: -77.034605,
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
      latitude: -12.044411,
      longitude: -77.030288,
    },

    {
      id: "catedral",
      nextId: "pasaje-santa-rosa",
      latitude: -12.04675,
      longitude: -77.02968,
    },

    {
      id: "pasaje-santa-rosa",
      nextId: "san-francisco",
      latitude: -12.045688,
      longitude: -77.031078,
    },

    {
      id: "san-francisco",
      nextId: "parque-muralla",
      latitude: -12.045478,
      longitude: -77.027173,
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
