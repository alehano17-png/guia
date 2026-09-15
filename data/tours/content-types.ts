// El "contenido" de un tour, por idioma: solo texto — títulos, narración,
// resúmenes, highlights, y los textos de actionCard/choices/startRoute que
// el esqueleto dejó fuera. Nada de coordenadas, IDs de flujo (nextId) ni
// estructura.

export type TourChoiceContent = {
  // Mismo id que su TourChoiceSkeleton correspondiente.
  id: string;
  label: string;
};

export type TourStepContent = {
  // Mismo id que su TourStepSkeleton correspondiente — es la clave de
  // emparejado en mergeTourContent.
  id: string;
  title: string;
  voiceText: string;
  summary?: string;
  highlights?: string[];
  previewText?: string;
  nextStepPreview?: { time: string };
  choices?: TourChoiceContent[];
  actionCard?: { tag: string; title: string; subtitle: string };
  startRoute?: { destinationTitle: string; buttonLabel: string };
};

export type TourContent = {
  title: string;
  steps: TourStepContent[];
};
