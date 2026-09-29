// Diccionario de textos fijos de interfaz (botones, labels, menús,
// mensajes de error/éxito) — NO los tours, esos tienen su propio sistema
// de idioma en data/tours/ (skeleton + content por idioma), completamente
// aparte de este.
//
// "es" es la fuente de verdad de qué claves existen: cualquier otro
// idioma (en.ts, y los que vengan después) se tipa contra
// TranslationDictionary (= typeof es), así que si a otro idioma le falta
// una clave o le sobra una, tsc lo marca como error — no es una
// convención, es una garantía del compilador.
//
// Todavía ningún archivo de la app usa este diccionario — es solo la
// infraestructura, poblada con los textos reales ya identificados en el
// inventario. La migración de las pantallas es un paso aparte.
export const es = {
  home: {
    greeting: "Hola, {{name}}",
    greetingFallback: "Hola, soy",
    tagline: "Compañía a tu modo",
    start: "EMPEZAR",
    signOut: "Cerrar sesión",
  },

  auth: {
    login: {
      title: "Inicia sesión",
      subtitle: "Entra para seguir tu recorrido con GUÍA.",
      emailLabel: "Correo",
      emailPlaceholder: "tucorreo@ejemplo.com",
      passwordLabel: "Contraseña",
      missingFields: "Completa correo y contraseña.",
      submit: "Iniciar sesión",
      noAccount: "¿No tienes cuenta?",
      signUpLink: "Regístrate",
    },
    signup: {
      title: "Crea tu cuenta",
      subtitle: "Regístrate para guardar tu progreso con GUÍA.",
      displayNameLabel: "¿Cómo te gustaría que te llame?",
      displayNamePlaceholder: "Tu nombre",
      emailLabel: "Correo",
      emailPlaceholder: "tucorreo@ejemplo.com",
      passwordLabel: "Contraseña",
      confirmPasswordLabel: "Confirmar contraseña",
      missingFields: "Completa todos los campos.",
      passwordMismatch: "Las contraseñas no coinciden.",
      passwordTooShort: "La contraseña debe tener al menos {{minLength}} caracteres.",
      submit: "Crear cuenta",
      hasAccount: "¿Ya tienes cuenta?",
      loginLink: "Inicia sesión",
      accountCreatedInfo: "Cuenta creada. Si tu proyecto pide confirmar el correo, revisa tu bandeja de entrada.",
    },
  },

  // Absorbe data/discovery/copy.ts (discover + recommendations + status) —
  // mismas claves, mismo texto. copy.ts sigue viviendo y usándose tal cual
  // hasta que discover.tsx/recomendations.tsx migren a este diccionario;
  // por ahora hay contenido duplicado a propósito.
  discover: {
    title: "Descubre lugares",
    subtitle: "Elige un lugar puntual y descúbrelo a tu ritmo.",
    sectionLabel: "Cerca de ti",
    backLabel: "Salir",
  },

  recommendations: {
    title: "Genial, vamos a pasear.",
    detectedZone: "Te ubicamos cerca de {{zoneName}}.",
    loadingTitle: "Buscando tours cerca de ti...",
    headerSupportedWithTours: "Aquí tienes los tours disponibles más cerca de ti en {{cityName}}:",
    headerSupportedWithPlaces: "No encontramos tours principales activos, pero sí lugares para descubrir en {{cityName}}:",
    headerSupportedEmpty: "Aún no tenemos contenido disponible para tu zona dentro de {{cityName}}.",
    unsupportedLocation: "Aún no tenemos contenido disponible para tu ubicación.",
    unsupportedButAvailable: "Aún no detectamos una ciudad compatible. Te mostraremos opciones disponibles cuando corresponda.",
    defaultCityName: "tu ciudad",
  },

  status: {
    comingSoon: "Próximamente",
  },

  tour: {
    exit: "Salir",
    next: "Siguiente",
    stepProgress: "Narrando - Paso {{current}} de {{total}}",
    decisionTitle: "Elige cómo continuar",
    cancel: "Cancelar",
    openMaps: "Abrir Maps",
    notFound: "No se encontró el tour",
    preparing: "Preparando tu recorrido por {{tourTitle}}",
    chatError: "Tuve un problema al responder. Intenta otra vez.",
  },

  chat: {
    close: "Cerrar",
    narratingLabel: "Estoy narrando el punto:",
    helperText: "Puedes preguntarme algo sobre este lugar o sobre cualquier parte del tour.",
    emptyTitle: "¿En qué te ayudo?",
    suggestionHistory: "¿Qué historia tiene este lugar?",
    suggestionNearby: "¿Qué debería ver cerca de aquí?",
    suggestionDuration: "¿Cuánto tiempo toma este tour?",
    inputPlaceholder: "Haz una pregunta...",
  },

  guia: {
    statusIdle: "Toca para hablar con GUÍA",
    statusListening: "Escuchando...",
    statusThinking: "Pensando...",
    statusSpeaking: "Hablando...",
    statusError: "No entendí, toca para intentar de nuevo",
    // Frases habladas (no solo en pantalla) al retomar la narración tras
    // "Hablar con GUÍA" — se elige una al azar entre las 4.
    transitionPhrases: [
      "Continuemos con el recorrido.",
      "Sigamos donde estábamos.",
      "Retomemos la historia.",
      "Volvamos al recorrido.",
    ],
  },

  offline: {
    title: "Parece que no hay conexión",
    message: "Revisa tu WiFi o datos móviles, e inténtalo de nuevo.",
    retrying: "Comprobando...",
    retry: "Reintentar",
  },
};

// Sin `as const`: cada valor se tipa como `string`/`string[]` genérico, no
// como su literal exacto — si tuviera `as const`, TranslationDictionary
// exigiría que en.ts (y cualquier otro idioma) repitiera el texto en
// español palabra por palabra para poder compilar.
export type TranslationDictionary = typeof es;
