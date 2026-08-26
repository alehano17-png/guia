import { Buffer } from "buffer";
import CryptoJS from "crypto-js";
import {
  requestRecordingPermissionsAsync,
  useAudioPlayer,
  useAudioSampleListener,
} from "expo-audio";
import { Audio } from "expo-av";
import { useCallback, useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { TOUR_API_BASE_URL } from "../lib/tourApiConfig";

const FileSystem = require("expo-file-system/legacy");

type AudioStep = {
  id: string;
  text: string;
};

// Teoría a probar: expo-audio reimpone su propia configuración de sesión
// de audio cada vez que reproduce algo, deshaciendo el arreglo del
// altavoz que ya aplicamos una sola vez después de grabar (con expo-av,
// en useGuiaVoiceMode.ts). Este refuerzo se llama justo antes de cada
// player.play() para pelear esa reimposición en el momento en que más
// importa. Silencioso a propósito: si falla, no debe romper la
// reproducción.
async function reinforcePlaybackAudioMode() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
  } catch (e) {
    console.log("Error reforzando el modo de audio antes de reproducir", e);
  }
}

// El volumen real (RMS) varía mucho según la voz y el proveedor de audio,
// así que en vez de umbrales fijos adivinados, el "techo" se autocalibra:
// rastrea el pico más reciente y todo se normaliza como fracción de ese
// pico. Suavizado con una media móvil para que se vea como una respiración
// fluida, no un parpadeo nervioso frame a frame.
const PEAK_FLOOR = 0.02; // piso inicial del pico, evita dividir por ~0
const PEAK_DECAY = 0.995; // qué tan lento baja el pico si no hay uno nuevo
const NORMALIZED_CURVE = 0.6; // <1 realza volúmenes medios, no solo picos
const SCALE_MIN = 1.0;
const SCALE_MAX = 1.3;
const SMOOTHING = 0.25; // 0 = sin suavizar, 1 = nunca cambia

export function useTourAudio(pulseAnim?: Animated.Value) {
  const audioCacheRef = useRef<Record<string, string>>({});
  const isGeneratingRef = useRef(false);
  const smoothedAmplitudeRef = useRef(0);
  const peakRef = useRef(PEAK_FLOOR);
  // Posición (en segundos) de lo que estaba sonando justo antes de la
  // última pausa — la guarda stopCurrentAudio() para que
  // resumeCachedAudioFromLastPosition() pueda retomar ahí en vez de
  // siempre desde 0. `currentTime` del AudioPlayer de expo-audio ya está
  // en segundos.
  const lastPositionSecondsRef = useRef(0);
  // Espejo en el hilo de UI del mismo volumen normalizado (0 a 1) que ya
  // usa pulseAnim, para que componentes con reanimated (como VoiceBlob)
  // puedan animar sin cruzar al hilo de JS en cada frame.
  const voiceEnergy = useSharedValue(0);

  const player = useAudioPlayer();

  useEffect(() => {
    requestRecordingPermissionsAsync().catch(() => {
      // Si se niega, el globo simplemente no reacciona al volumen real —
      // no rompe la narración ni el chat, que no dependen de este permiso.
    });
  }, []);

  // Este listener es el corazón de la sincronía real: recibe el audio de
  // verdad, muestra a muestra, mientras suena — sea narración o respuesta
  // de chat, no importa, siempre pasa por el mismo `player`.
  useAudioSampleListener(player, (sample) => {
    if (!pulseAnim) return;

    const frames = sample.channels[0]?.frames;
    if (!frames || frames.length === 0) return;

    let sumSquares = 0;
    for (let i = 0; i < frames.length; i++) {
      sumSquares += frames[i] * frames[i];
    }
    const rms = Math.sqrt(sumSquares / frames.length);

    // El "techo" se autocalibra: sube de inmediato ante un pico nuevo,
    // pero baja lentamente si no hay picos — así se adapta al volumen
    // real de cada narración en vez de asumir un umbral fijo.
    peakRef.current = Math.max(rms, peakRef.current * PEAK_DECAY);

    const normalized = rms / (peakRef.current || PEAK_FLOOR);
    const curved = Math.pow(normalized, NORMALIZED_CURVE);

    smoothedAmplitudeRef.current =
      smoothedAmplitudeRef.current * SMOOTHING + curved * (1 - SMOOTHING);

    const scale = SCALE_MIN + smoothedAmplitudeRef.current * (SCALE_MAX - SCALE_MIN);

    pulseAnim.setValue(scale);
    voiceEnergy.value = smoothedAmplitudeRef.current;
  });

  const AUDIO_VERSION = "elevenlabs-v5";
  const getHash = useCallback((text: string) => {
    return CryptoJS.MD5(text).toString();
  }, []);

  const getCacheKey = useCallback(
    (stepId: string, text: string) =>
      `${AUDIO_VERSION}-${stepId}-${getHash(text)}`,
    [getHash]
  );

  const getFileUri = useCallback(
    (stepId: string, text: string) =>
      FileSystem.documentDirectory +
      `${AUDIO_VERSION}-${stepId}-${getHash(text)}.mp3`,
    [getHash]
  );

  const ensureAudioForStep = useCallback(
    async (stepId: string, text: string) => {
      const cacheKey = getCacheKey(stepId, text);

      if (audioCacheRef.current[cacheKey]) return;

      const fileUri = getFileUri(stepId, text);
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (fileInfo.exists) {
        console.log("🟢 Usando audio guardado:", stepId);
        audioCacheRef.current[cacheKey] = fileUri;
        return;
      }

      console.log("🔴 Generando audio:", stepId);

      try {
        const res = await fetch(`${TOUR_API_BASE_URL}/voice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, mode: "narration" }),
        });

        if (!res.ok) {
          throw new Error(`Backend /voice respondió ${res.status}`);
        }

        const arrayBuffer = await res.arrayBuffer();

        await FileSystem.writeAsStringAsync(
          fileUri,
          Buffer.from(arrayBuffer).toString("base64"),
          { encoding: "base64" }
        );

        audioCacheRef.current[cacheKey] = fileUri;
      } catch (e) {
        console.log("Error generando audio", e);
      }
    },
    [getCacheKey, getFileUri]
  );

  // Reproduce el audio ya cacheado de un paso, siempre desde el inicio.
  // Ya no hace falta que devuelva la duración para el pulso — el pulso
  // ahora se maneja solo, en tiempo real, por el listener de arriba. Se
  // mantiene arrancando siempre desde 0 a propósito: es la que usa el
  // efecto de narración al avanzar a un paso nuevo, donde eso es lo
  // correcto.
  const playCachedAudio = useCallback(
    async (stepId: string, text: string) => {
      const cacheKey = getCacheKey(stepId, text);
      const uri = audioCacheRef.current[cacheKey];

      if (!uri) return;

      try {
        player.replace({ uri });
        await reinforcePlaybackAudioMode();
        player.play();
      } catch (e) {
        console.log("Error reproduciendo audio", e);
      }
    },
    [getCacheKey, player]
  );

  // Igual que playCachedAudio, pero retoma desde la última posición
  // guardada por stopCurrentAudio (lastPositionSecondsRef) en vez de
  // siempre desde 0 — para "Hablar con GUÍA", que debe reanudar la
  // narración donde se había quedado, no reiniciar el punto. Si no hay
  // ninguna posición guardada (ej. primera vez que se usa el botón en
  // este paso), arranca desde 0 con normalidad.
  const resumeCachedAudioFromLastPosition = useCallback(
    async (stepId: string, text: string) => {
      const cacheKey = getCacheKey(stepId, text);
      const uri = audioCacheRef.current[cacheKey];

      if (!uri) return;

      const resumePositionSeconds = lastPositionSecondsRef.current;
      lastPositionSecondsRef.current = 0;

      try {
        player.replace({ uri });

        if (resumePositionSeconds > 0) {
          await player.seekTo(resumePositionSeconds);
        }

        await reinforcePlaybackAudioMode();
        player.play();
      } catch (e) {
        console.log("Error reanudando audio desde la última posición", e);
      }
    },
    [getCacheKey, player]
  );

  const preloadStepsAudio = useCallback(
    async (steps: AudioStep[], onStepReady?: (stepId: string) => void) => {
      if (isGeneratingRef.current) return;

      isGeneratingRef.current = true;

      try {
        for (const step of steps) {
          await ensureAudioForStep(step.id, step.text);
          onStepReady?.(step.id);
        }
      } finally {
        isGeneratingRef.current = false;
      }
    },
    [ensureAudioForStep]
  );

  // Escribe un audio (base64) a un archivo temporal, lo reproduce, y
  // resuelve cuando termina de sonar — no antes. Compartida por
  // speakChatReply (una respuesta completa, de una sola vez) y quien
  // reproduce pedazos del streaming de /chat, para no duplicar esta
  // lógica en dos lugares.
  const playAudioBase64 = useCallback(
    async (audioBase64: string, cacheKeyText: string) => {
      const fileUri =
        FileSystem.cacheDirectory +
        `${AUDIO_VERSION}-chat-${getHash(cacheKeyText)}.mp3`;

      await FileSystem.writeAsStringAsync(fileUri, audioBase64, {
        encoding: "base64",
      });

      // player.replace() y el refuerzo del modo de audio se sacan del
      // executor de la Promise de abajo porque necesitan `await`, y ese
      // executor no es async — así player.play() queda como lo único que
      // pasa ahí, justo después del refuerzo.
      player.replace({ uri: fileUri });
      await reinforcePlaybackAudioMode();

      await new Promise<void>((resolve) => {
        const subscription = player.addListener(
          "playbackStatusUpdate",
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              subscription.remove();
              resolve();
            }
          }
        );

        player.play();
      });
    },
    [getHash, player]
  );

  // Reproduce una respuesta puntual del chat de voz. Se resuelve cuando
  // termina de sonar, para que quien la llame pueda retomar la narración
  // justo después.
  const speakChatReply = useCallback(
    async (text: string) => {
      try {
        const res = await fetch(`${TOUR_API_BASE_URL}/voice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, mode: "chat" }),
        });

        if (!res.ok) {
          throw new Error(`Backend /voice respondió ${res.status}`);
        }

        const arrayBuffer = await res.arrayBuffer();
        const audioBase64 = Buffer.from(arrayBuffer).toString("base64");

        await playAudioBase64(audioBase64, text);
      } catch (e) {
        console.log("Error reproduciendo respuesta de chat", e);
      }
    },
    [playAudioBase64]
  );

  const stopCurrentAudio = useCallback(async () => {
    try {
      // Se guarda antes de pausar, para poder retomar desde acá más
      // adelante (ej. al volver de "Hablar con GUÍA") en vez de siempre
      // desde 0.
      lastPositionSecondsRef.current = player.currentTime;
      player.pause();
    } catch {}
    if (pulseAnim) {
      pulseAnim.setValue(1);
    }
    smoothedAmplitudeRef.current = 0;
    peakRef.current = PEAK_FLOOR;
    voiceEnergy.value = 0;
  }, [player, pulseAnim, voiceEnergy]);

  return {
    ensureAudioForStep,
    playCachedAudio,
    resumeCachedAudioFromLastPosition,
    preloadStepsAudio,
    stopCurrentAudio,
    speakChatReply,
    playAudioBase64,
    voiceEnergy,
  };
}