import type { TranslationDictionary } from "./es";

// Mismas claves que es.ts, obligatorio: TypeScript exige exactamente esta
// forma (TranslationDictionary = typeof es) — si falta una clave o sobra
// otra, esto no compila.
export const en: TranslationDictionary = {
  home: {
    greetingFallback: "Hi, I'm",
    tagline: "Company, your way",
    start: "START",
    signOut: "Sign out",
  },

  auth: {
    login: {
      title: "Log in",
      subtitle: "Come back to continue your tour with GUÍA.",
      emailLabel: "Email",
      emailPlaceholder: "youremail@example.com",
      passwordLabel: "Password",
      missingFields: "Fill in your email and password.",
      submit: "Log in",
      noAccount: "Don't have an account?",
      signUpLink: "Sign up",
    },
    signup: {
      title: "Create your account",
      subtitle: "Sign up to save your progress with GUÍA.",
      displayNameLabel: "What would you like to be called?",
      displayNamePlaceholder: "Your name",
      emailLabel: "Email",
      emailPlaceholder: "youremail@example.com",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm password",
      missingFields: "Fill in all the fields.",
      passwordMismatch: "Passwords don't match.",
      passwordTooShort: "Password must be at least {{minLength}} characters long.",
      submit: "Create account",
      hasAccount: "Already have an account?",
      loginLink: "Log in",
      accountCreatedInfo: "Account created. If your project requires email confirmation, check your inbox.",
    },
  },

  discover: {
    title: "Discover places",
    subtitle: "Pick a specific spot and explore it at your own pace.",
    sectionLabel: "Near you",
    backLabel: "Exit",
  },

  recommendations: {
    title: "Great, let's go for a walk.",
    detectedZone: "We found you near {{zoneName}}.",
    loadingTitle: "Looking for tours near you...",
    headerSupportedWithTours: "Here are the closest available tours in {{cityName}}:",
    headerSupportedWithPlaces: "We didn't find active main tours, but there are places to discover in {{cityName}}:",
    headerSupportedEmpty: "We don't have content available yet for your area within {{cityName}}.",
    unsupportedLocation: "We don't have content available yet for your location.",
    unsupportedButAvailable: "We couldn't detect a supported city yet. We'll show you available options when they're ready.",
    defaultCityName: "your city",
  },

  status: {
    comingSoon: "Coming soon",
  },

  tour: {
    exit: "Exit",
    next: "Next",
    stepProgress: "Narrating - Step {{current}} of {{total}}",
    decisionTitle: "Choose how to continue",
    cancel: "Cancel",
    openMaps: "Open Maps",
    notFound: "Tour not found",
    preparing: "Getting your {{tourTitle}} tour ready",
    chatError: "I had trouble replying. Please try again.",
  },

  chat: {
    close: "Close",
    narratingLabel: "I'm narrating this spot:",
    helperText: "You can ask me anything about this place or any part of the tour.",
    emptyTitle: "How can I help?",
    suggestionHistory: "What's the history of this place?",
    suggestionNearby: "What should I check out nearby?",
    suggestionDuration: "How long does this tour take?",
    inputPlaceholder: "Ask a question...",
  },

  guia: {
    statusIdle: "Tap to talk to GUÍA",
    statusListening: "Listening...",
    statusThinking: "Thinking...",
    statusSpeaking: "Speaking...",
    statusError: "I didn't catch that, tap to try again",
    transitionPhrases: [
      "Let's continue the tour.",
      "Let's pick up where we left off.",
      "Let's get back to the story.",
      "Let's return to the tour.",
    ],
  },

  offline: {
    title: "Looks like you're offline",
    message: "Check your WiFi or mobile data, and try again.",
    retrying: "Checking...",
    retry: "Retry",
  },
};
