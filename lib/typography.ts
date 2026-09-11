// Sistema tipográfico centralizado — mismo espíritu que TOUR_ACCENT_COLOR
// y compañía en tourTheme.ts: antes cada pantalla declaraba su propio
// fontFamily/fontSize suelto (cuando los declaraba — la mayoría del texto
// de la app corría en la fuente del sistema por no tener nada puesto),
// sin una única fuente de verdad.

// Los 3 nombres reales que useFonts registra en app/_layout.tsx — deben
// coincidir exacto con esas claves, o React Native cae silenciosamente a
// la fuente del sistema en vez de usar Plus Jakarta Sans.
export const FONT_REGULAR = "PlusJakartaSans_400Regular";
export const FONT_SEMIBOLD = "PlusJakartaSans_600SemiBold";
export const FONT_BOLD = "PlusJakartaSans_700Bold";

// Escala de tamaños — 8 pasos con nombre, en vez de números sueltos
// repetidos (el inventario de toda la app mostró 15 valores distintos,
// muchos a 1-2px de diferencia sin ningún criterio compartido). Los
// nombres siguen la convención XS/SM/MD/LG/XL común en sistemas de
// diseño, más 3 pasos grandes propios para los usos de títulos/heros que
// ya existían (24/32/42).
export const FONT_SIZE_XS = 12; // labels chicos, metadata (ej. "hace 2 días")
export const FONT_SIZE_SM = 14; // texto secundario, captions
export const FONT_SIZE_MD = 16; // cuerpo de texto por defecto
export const FONT_SIZE_LG = 18; // cuerpo destacado, subtítulos chicos
export const FONT_SIZE_XL = 20; // subtítulos, títulos de tarjeta
export const FONT_SIZE_TITLE = 24; // títulos de pantalla/sección
export const FONT_SIZE_DISPLAY = 32; // títulos grandes (ej. header de una pantalla)
export const FONT_SIZE_HERO = 42; // el tamaño más grande de la app (ej. "GUÍA" en inicio)
