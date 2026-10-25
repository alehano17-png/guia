import { getDistanceInMeters } from "../../lib/geo";
import { interpolate } from "../../lib/i18n/interpolate";
import type { TourStep } from "./index";

type PreviewDestination = {
  title: string;
  latitude: number;
  longitude: number;
};

type PreviewData = {
  previewDestination: PreviewDestination;
  // false cuando el destino sale del respaldo del tour (tourAnchor): no hay
  // una ubicación real para este paso, así que no se muestra mapa.
  hasPreciseLocation: boolean;
};

type Input = {
  steps?: TourStep[];
  step?: TourStep;
  isGuidedStart: boolean;
  startRoute?: TourStep["startRoute"];
  // Nombre a mostrar si el tour no tiene ningún punto con coordenadas
  // (i18n tour.routePointFallback).
  fallbackTitle: string;
};

export function getTourPreviewData({
  steps,
  step,
  isGuidedStart,
  startRoute,
  fallbackTitle,
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
        title: firstWithCoords?.title ?? fallbackTitle,
        latitude: firstWithCoords?.latitude ?? -12.1205,
        longitude: firstWithCoords?.longitude ?? -77.034,
      };

  const hasPreciseLocation =
    (isGuidedStart && !!startRoute) ||
    !!nextStepPreview ||
    (step?.latitude != null && step?.longitude != null);

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

  return {
    previewDestination,
    hasPreciseLocation,
  };
}

export type TourCardMode = "next" | "last" | "closing";

type CardModeInput = {
  steps?: TourStep[];
  step?: TourStep;
};

// Qué muestra la tarjeta de abajo del tour:
// - "next": siguiente parada (caso normal, inicio guiado y pasos con
//   choices, cuyo siguiente real lo decide la elección).
// - "last": el paso tiene coordenadas y lo que sigue es el cierre.
// - "closing": paso de cierre (end) o tramo sin coordenadas que lleva al
//   cierre; solo se muestra el botón.
export function getTourCardMode({ steps, step }: CardModeInput): TourCardMode {
  if (!step || step.startRoute || step.choices?.length) return "next";
  if (step.end) return "closing";

  const nextStep = step.nextId
    ? steps?.find((s) => s.id === step.nextId)
    : undefined;

  if (!nextStep || nextStep.end) {
    const hasCoords = step.latitude != null && step.longitude != null;
    return hasCoords ? "last" : "closing";
  }

  return "next";
}

// Velocidad de caminata (m/min) y factor de rodeo: la distancia en línea
// recta se alarga un 30% para aproximar el recorrido real por las calles.
const WALK_METERS_PER_MINUTE = 80;
const WALK_DETOUR_FACTOR = 1.3;

type WalkTimeInput = {
  steps?: TourStep[];
  step?: TourStep;
  previewDestination: PreviewDestination;
  // Plantilla i18n con {{minutes}} (tour.walkTimeApprox).
  approxTemplate: string;
};

// Tiempo a pie que muestra la tarjeta: el escrito a mano en el contenido
// (nextStepPreview.time) si existe; si no, uno aproximado desde el paso
// actual hasta el destino de la tarjeta, solo cuando el paso actual y el
// siguiente tienen coordenadas. Sin forma de calcularlo, undefined.
export function getTourWalkTime({
  steps,
  step,
  previewDestination,
  approxTemplate,
}: WalkTimeInput): string | undefined {
  if (step?.nextStepPreview?.time) return step.nextStepPreview.time;
  if (step?.latitude == null || step.longitude == null) return undefined;

  const nextStep = step.nextId
    ? steps?.find((s) => s.id === step.nextId)
    : undefined;
  if (nextStep?.latitude == null || nextStep.longitude == null) return undefined;

  const meters = getDistanceInMeters(
    { latitude: step.latitude, longitude: step.longitude },
    previewDestination
  );
  const minutes = Math.max(
    1,
    Math.ceil((meters * WALK_DETOUR_FACTOR) / WALK_METERS_PER_MINUTE)
  );
  return interpolate(approxTemplate, { minutes });
}
