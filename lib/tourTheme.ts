// Color de acento principal de la marca en la pantalla de tour — botón
// primario, ícono de chat, CTA de "Abrir Maps". Centralizado acá para que
// los tres (y cualquier otro elemento que necesite el mismo tono) no
// repitan el hex a mano y se desincronicen entre sí.
export const TOUR_ACCENT_COLOR = "#7C6FE0";

// Degradado de fondo compartido por las pantallas de la app (inicio,
// descubrir, recomendaciones, tour y sus loaders) — centralizado acá por
// la misma razón que TOUR_ACCENT_COLOR: que no se desincronicen entre sí.
export const TOUR_GRADIENT_COLORS = ["#F3E8FF", "#D8B4FE", "#A78BFA"] as const;

// Tonos de texto/ícono compartidos por toda la app — antes cada pantalla
// escribía su propio hex oscuro suelto (#221B35, #374151, #1F2937,
// #111827... y sus versiones secundarias), sin una única fuente de
// verdad. Centralizados acá por la misma razón que los de arriba.
export const TOUR_TEXT_PRIMARY = "#221B35";
export const TOUR_TEXT_SECONDARY = "#5D5476";
