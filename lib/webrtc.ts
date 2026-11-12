import Constants, { ExecutionEnvironment } from "expo-constants";
import { NativeModules } from "react-native";
import type * as WebRTC from "react-native-webrtc";

// Carga segura de react-native-webrtc. Expo Go no trae su módulo nativo, y
// la librería no se puede siquiera importar sin él (en iOS falla al crear
// su NativeEventEmitter). Por eso se carga solo bajo demanda y solo si el
// módulo nativo existe; si no, devuelve null y la app usa el modo de voz
// anterior (grabar -> /transcribe -> /chat -> /voice).
export type WebRTCLib = typeof WebRTC;

let cached: WebRTCLib | null | undefined;

export function getWebRTC(): WebRTCLib | null {
  if (cached !== undefined) return cached;
  cached = null;

  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return null;
  }
  if (NativeModules.WebRTCModule == null) {
    return null;
  }

  try {
    // require (no import) a propósito: solo se evalúa si el módulo nativo
    // está, nunca en Expo Go.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require("react-native-webrtc") as WebRTCLib;
  } catch {
    cached = null;
  }
  return cached;
}

// true en un build propio con react-native-webrtc; false en Expo Go.
export function isRealtimeVoiceAvailable(): boolean {
  return getWebRTC() !== null;
}
