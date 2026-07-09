import type { TourStep } from "./index";

type PreviewDestination = {
  title: string;
  latitude: number;
  longitude: number;
};

type PreviewData = {
  previewDestination: PreviewDestination;
  previewInfoText?: string;
};

type Input = {
  steps?: TourStep[];
  step?: TourStep;
  isGuidedStart: boolean;
  startRoute?: TourStep["startRoute"];
};

export function getTourPreviewData({
  steps,
  step,
  isGuidedStart,
  startRoute,
}: Input): PreviewData {
  const nextStep =
    step?.nextId && steps
      ? steps.find((s) => s.id === step.nextId)
      : undefined;

  const nextStepPreview =
    step?.nextStepPreview &&
    nextStep &&
    nextStep.latitude != null &&
    nextStep.longitude != null
      ? {
          title: nextStep.title,
          time: step.nextStepPreview.time,
          latitude: nextStep.latitude,
          longitude: nextStep.longitude,
        }
      : undefined;

  const firstWithStartRoute = steps?.find((s) => s.startRoute);

  const firstWithCoords = steps?.find(
    (s) => s.latitude != null && s.longitude != null
  );

  const tourAnchor: PreviewDestination = firstWithStartRoute?.startRoute
    ? {
        title: firstWithStartRoute.startRoute.destinationTitle,
        latitude: firstWithStartRoute.startRoute.latitude,
        longitude: firstWithStartRoute.startRoute.longitude,
      }
    : {
        title: firstWithCoords?.title ?? "Punto del recorrido",
        latitude: firstWithCoords?.latitude ?? -12.1205,
        longitude: firstWithCoords?.longitude ?? -77.034,
      };

  const previewDestination: PreviewDestination =
    isGuidedStart && startRoute
      ? {
          title: startRoute.destinationTitle,
          latitude: startRoute.latitude,
          longitude: startRoute.longitude,
        }
      : nextStepPreview
        ? {
            title: nextStepPreview.title,
            latitude: nextStepPreview.latitude,
            longitude: nextStepPreview.longitude,
          }
        : step?.latitude != null && step?.longitude != null
          ? {
              title: step.title,
              latitude: step.latitude,
              longitude: step.longitude,
            }
          : tourAnchor;

  const previewInfoText =
    isGuidedStart && startRoute
      ? `Destino: ${startRoute.destinationTitle}`
      : step?.previewText
        ? step.previewText
        : nextStepPreview
          ? `Próximo punto: ${nextStepPreview.title} · ${nextStepPreview.time}`
          : undefined;

  return {
    previewDestination,
    previewInfoText,
  };
}
