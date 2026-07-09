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

