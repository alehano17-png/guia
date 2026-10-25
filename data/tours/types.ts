export type TourChoice = {
  label: string;
  nextId: string;
};

export type TourStep = {
  id: string
  title: string
  voiceText: string
  summary?: string
  highlights?: string[]
  nextId?: string
  end?: boolean
  
  latitude?: number
  longitude?: number
  // Punto dentro de un recinto (ubicación poco precisa): la tarjeta no
  // muestra mapa ni 'Abrir mapa'.
  noMap?: boolean
  choices?: TourChoice[]

  startRoute?: {
    destinationTitle: string
    latitude: number
    longitude: number
    nextStepId: string
    buttonLabel: string
  }

  nextStepPreview?: {
    time: string
  }

  previewText?: string

  actionCard?: {
    tag: string
    title: string
    subtitle: string
  }
}

export type Tour = {
  id: string;
  title: string;
  steps: TourStep[];
};

