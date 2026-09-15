// El "esqueleto" de un tour: todo lo que NUNCA cambia según el idioma —
// IDs, coordenadas GPS, orden de pasos, a qué paso lleva cada nextId/choice,
// y si un paso es compacto (actionCard) o libre (mapa). Cero texto acá.

export type TourChoiceSkeleton = {
  // Id propio del choice (inventado, no viene de ningún dato original) —
  // sirve para emparejar este choice con su label en TourContent.
  id: string;
  nextId: string;
};

export type TourStepSkeleton = {
  id: string;
  nextId?: string;
  end?: boolean;

  latitude?: number;
  longitude?: number;

  choices?: TourChoiceSkeleton[];

  // El único lugar del código real que distingue un paso "compacto" de uno
  // "libre" es `showActionCard = !!step.actionCard` en app/tour.tsx — por
  // eso el esqueleto solo necesita este booleano, no un segundo flag
  // "compact" aparte que se pueda desincronizar.
  hasActionCard?: boolean;

  startRoute?: {
    latitude: number;
    longitude: number;
    nextStepId: string;
  };
};

export type TourSkeleton = {
  id: string;
  steps: TourStepSkeleton[];
};
