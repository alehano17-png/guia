import { useRouter } from "expo-router";
import { useState } from "react";
import type { DiscoveryCatalogItem } from "../data/discovery/catalog";
import { getDiscoveryItemTexts } from "../data/discovery/presentation";
import { getDiscoveryItemRoute } from "../data/discovery/routes";
import { parseTourLocale, type TourLocale } from "../data/tours/index";
import { getLocale } from "../lib/i18n";

type PendingTour = {
  route: NonNullable<ReturnType<typeof getDiscoveryItemRoute>>;
  title: string;
};

export function useDiscoveryNavigation() {
  const router = useRouter();

  // Tour que la persona tocó y que espera la elección de idioma. Se
  // guarda aparte de la visibilidad para que el título siga en la hoja
  // mientras se anima su salida.
  const [pendingTour, setPendingTour] = useState<PendingTour | null>(null);
  const [isLanguageSheetVisible, setIsLanguageSheetVisible] = useState(false);

  const canOpenDiscoveryItem = (item: DiscoveryCatalogItem) => {
    return !!getDiscoveryItemRoute(item);
  };

  // Ya no entra directo al tour: primero abre la hoja de idioma.
  const openDiscoveryItem = (item: DiscoveryCatalogItem) => {
    const route = getDiscoveryItemRoute(item);
    if (!route) return;

    // Título en el idioma de la interfaz, igual que en la tarjeta.
    setPendingTour({ route, title: getDiscoveryItemTexts(item, getLocale()).title });
    setIsLanguageSheetVisible(true);
  };

  const confirmTourLanguage = (locale: TourLocale) => {
    setIsLanguageSheetVisible(false);
    if (!pendingTour) return;

    router.push({
      pathname: pendingTour.route.pathname,
      params: { ...pendingTour.route.params, lang: locale },
    });
  };

  const closeLanguageSheet = () => {
    setIsLanguageSheetVisible(false);
  };

  // Idioma de la interfaz (que ya sigue al del celular) como punto de
  // partida; cualquier idioma que no sea "es" ni "en" cae a "es".
  const languageSheetProps = {
    visible: isLanguageSheetVisible,
    tourTitle: pendingTour?.title ?? "",
    defaultLocale: parseTourLocale(getLocale()),
    onConfirm: confirmTourLanguage,
    onClose: closeLanguageSheet,
  };

  return {
    canOpenDiscoveryItem,
    openDiscoveryItem,
    languageSheetProps,
  };
}
