import { useCallback, useEffect, useRef, useState } from "react";
// Estas dos dependencias son módulos nativos: requieren un dev client propio
// (no funcionan dentro de Expo Go). Instálalas con:
//   npx expo install @picovoice/porcupine-react-native @picovoice/react-native-voice-processor
import { PorcupineManager } from "@picovoice/porcupine-react-native";

// ──────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN PENDIENTE (esto no lo puedo generar yo, es tuyo):
//
// 1. Crea una cuenta gratis en https://console.picovoice.ai/
// 2. Ahí mismo copia tu AccessKey y pégalo abajo (o mejor, en una variable
//    de entorno — nunca lo subas a GitHub tal cual).
// 3. En la sección "Porcupine" de la consola, entrena una palabra clave
//    personalizada: escribe "GUIA", elige idioma Español, y descarga el
//    archivo .ppn para Android y el .ppn para iOS.
// 4. Descarga también el modelo de idioma español (porcupine_params_es.pv)
//    desde su repositorio de GitHub (necesario para detectar palabras que
//    no sean en inglés).
// 5. Copia esos archivos al proyecto:
//      android -> android/app/src/main/assets/
//      ios     -> cualquier carpeta bajo ./ios, agregada como recurso en Xcode
// 6. Reemplaza las rutas de ejemplo de abajo por las tuyas.
// ──────────────────────────────────────────────────────────────────────────

const PICOVOICE_ACCESS_KEY = "TU_ACCESS_KEY_DE_PICOVOICE";

const KEYWORD_PATH_ANDROID = "guia_es_android.ppn";
const KEYWORD_PATH_IOS = "guia_es_ios.ppn";
const SPANISH_MODEL_PATH = "porcupine_params_es.pv";

type UseWakeWordParams = {
  onDetected: () => void;
  enabled: boolean;
};

export function useWakeWord({ onDetected, enabled }: UseWakeWordParams) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const managerRef = useRef<PorcupineManager | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        const keywordPath =
          require("react-native").Platform.OS === "ios"
            ? KEYWORD_PATH_IOS
            : KEYWORD_PATH_ANDROID;

        const manager = await PorcupineManager.fromKeywordPaths(
          PICOVOICE_ACCESS_KEY,
          [keywordPath],
          () => {
            // Se dispara cada vez que se detecta "GUÍA"
            onDetected();
          },
          (e: Error) => {
            console.log("Error de Porcupine", e);
            setError(e.message);
          },
          SPANISH_MODEL_PATH
        );

        if (cancelled) {
          await manager.delete();
          return;
        }

        managerRef.current = manager;
      } catch (e) {
        console.log("No se pudo inicializar la palabra clave", e);
        setError(e instanceof Error ? e.message : String(e));
      }
    }

    setup();

    return () => {
      cancelled = true;
      managerRef.current?.delete();
      managerRef.current = null;
    };
  }, [onDetected]);

  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;

    if (enabled) {
      manager.start().then(() => setIsListening(true));
    } else {
      manager.stop().then(() => setIsListening(false));
    }
  }, [enabled]);

  return { isListening, error };
}
