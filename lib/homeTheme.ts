import type { TimeOfDay } from "./timeOfDay";

// Detalles de la pantalla de inicio según el momento del día. El fondo es
// siempre el degradado morado de la app (TOUR_GRADIENT_COLORS); aquí solo
// cambian los colores de los textos sueltos y la barra de estado.
export type HomeMomentTheme = {
  brandColor: string;
  signOutColor: string;
  statusBar: "light" | "dark";
};

export const HOME_BUBBLE_COLOR = "#FFFFFF";
export const HOME_BUTTON_TEXT_COLOR = "#5B4BC4";

export const HOME_MOMENT_THEMES: Record<TimeOfDay, HomeMomentTheme> = {
  morning: {
    brandColor: "#2B1F5C",
    signOutColor: "rgba(255,255,255,0.85)",
    statusBar: "dark",
  },
  afternoon: {
    brandColor: "#2B1F5C",
    signOutColor: "rgba(255,255,255,0.85)",
    statusBar: "dark",
  },
  night: {
    brandColor: "#FFFFFF",
    signOutColor: "rgba(255,255,255,0.85)",
    statusBar: "light",
  },
};
