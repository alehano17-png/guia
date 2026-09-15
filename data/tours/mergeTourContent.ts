import type { Tour, TourStep } from "./types";
import type { TourSkeleton } from "./skeleton-types";
import type { TourContent } from "./content-types";

// Combina esqueleto (estructura, nunca cambia por idioma) + contenido (solo
// texto, uno por idioma) en el mismo `Tour` que ya consume el resto de la
// app hoy (TourMediaBlock, TourNarrationBlock, TourChatSheet, preview.ts,
// app/tour.tsx) — ninguno de esos archivos necesita saber que ahora hay 2
// fuentes en vez de una.
export function mergeTourContent(
  skeleton: TourSkeleton,
  content: TourContent
): Tour {
  const contentById = new Map(content.steps.map((s) => [s.id, s]));

  const steps: TourStep[] = skeleton.steps.map((sk) => {
    const c = contentById.get(sk.id);
    if (!c) {
      throw new Error(
        `Falta contenido para el paso "${sk.id}" del tour "${skeleton.id}"`
      );
    }

    if (sk.hasActionCard && !c.actionCard) {
      throw new Error(
        `El paso "${sk.id}" del tour "${skeleton.id}" es compacto (actionCard) pero el content no trae actionCard`
      );
    }

    if (sk.startRoute && !c.startRoute) {
      throw new Error(
        `El paso "${sk.id}" del tour "${skeleton.id}" tiene startRoute pero el content no trae destinationTitle/buttonLabel`
      );
    }

    const choices = sk.choices?.map((skChoice) => {
      const cChoice = c.choices?.find((x) => x.id === skChoice.id);
      if (!cChoice) {
        throw new Error(
          `Falta el label de la opción "${skChoice.id}" en el paso "${sk.id}" del tour "${skeleton.id}"`
        );
      }
      return { label: cChoice.label, nextId: skChoice.nextId };
    });

    const merged: TourStep = {
      id: sk.id,
      title: c.title,
      voiceText: c.voiceText,
    };

    // Solo se agregan las claves opcionales que de verdad aplican — igual
    // que los objetos Tour originales, que simplemente omiten la clave en
    // vez de dejarla en `undefined` (así el resultado es indistinguible del
    // que ya devolvían los 4 archivos planos de antes de esta migración).
    if (c.summary !== undefined) merged.summary = c.summary;
    if (c.highlights !== undefined) merged.highlights = c.highlights;
    if (c.previewText !== undefined) merged.previewText = c.previewText;
    if (c.nextStepPreview !== undefined) merged.nextStepPreview = c.nextStepPreview;
    if (sk.nextId !== undefined) merged.nextId = sk.nextId;
    if (sk.end !== undefined) merged.end = sk.end;
    if (sk.latitude !== undefined) merged.latitude = sk.latitude;
    if (sk.longitude !== undefined) merged.longitude = sk.longitude;
    if (choices !== undefined) merged.choices = choices;
    if (sk.hasActionCard) merged.actionCard = c.actionCard;
    if (sk.startRoute && c.startRoute) {
      merged.startRoute = {
        destinationTitle: c.startRoute.destinationTitle,
        buttonLabel: c.startRoute.buttonLabel,
        latitude: sk.startRoute.latitude,
        longitude: sk.startRoute.longitude,
        nextStepId: sk.startRoute.nextStepId,
      };
    }

    return merged;
  });

  return { id: skeleton.id, title: content.title, steps };
}
