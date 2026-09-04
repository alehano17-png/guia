import { Buffer } from "buffer";
import CryptoJS from "crypto-js";
import {
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioSampleListener,
} from "expo-audio";
import { useCallback, useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import {
  AudioAlignment,
  buildSentenceStartsFromAlignment,
  cleanNarrationText,
  estimateSentenceStartTimes,
  findSentenceStartAtOrBefore,
} from "../lib/sentences";
import { TOUR_API_BASE_URL, TOUR_API_KEY, TOUR_API_KEY_HEADER } from "../lib/tourApiConfig";

const FileSystem = require("expo-file-system/legacy");

type AudioStep = {
  id: string;
  text: string;
};

// Teoría a probar: expo-audio reimpone su propia configuración de sesión
// de audio cada vez que reproduce algo, deshaciendo el arreglo del
// altavoz que ya aplicamos una sola vez después de grabar (en
// useGuiaVoiceMode.ts). Este refuerzo se llama justo antes de cada
// player.play() para pelear esa reimposición en el momento en que más
// importa. Ahora usa el setAudioModeAsync de expo-audio (antes era el de
// expo-av) — así este archivo ya no mezcla las dos librerías de audio.
// Silencioso a propósito: si falla, no debe romper la reproducción.
async function reinforcePlaybackAudioMode() {
  try {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
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

// Colchón hacia adelante solo para el camino de alignment real (no el de
// estimación): con timestamps reales de ElevenLabs, a veces todavía se
// alcanza a escuchar el final de la oración anterior justo antes de que
// arranque la elegida como punto de retomada.
const ALIGNMENT_SEEK_BUFFER_SECONDS = 0.15;

export function useTourAudio(pulseAnim?: Animated.Value) {
  const audioCacheRef = useRef<Record<string, string>>({});
  // Alignment real de ElevenLabs por cacheKey (mismo cacheKey que
  // audioCacheRef) — solo se llena para narración real (withTimestamps),
  // nunca para el chat ni la frase de transición. En memoria nomás, no
  // persiste en disco: si el .mp3 de un paso ya existía localmente de una
  // sesión anterior, ensureAudioForStep corta temprano y nunca llega a
  // buscar su alignment en esta sesión — stopCurrentAudio ya sabe caer a
  // la estimación en ese caso.
  const alignmentCacheRef = useRef<Record<string, AudioAlignment | null>>({});
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

  const AUDIO_VERSION = "elevenlabs-v6";
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

  // withTimestamps (default false): con false, esta función es idéntica a
  // como estaba antes de agregar timestamps — mismo request, misma
  // respuesta esperada (bytes crudos). La frase de transición y cualquier
  // otro llamado que no pase este parámetro quedan exactamente igual. Con
  // true (solo para la narración real de un paso del tour), pide el
  // audio con alineación real a /voice y la guarda en alignmentCacheRef.
  const ensureAudioForStep = useCallback(
    async (stepId: string, text: string, withTimestamps = false) => {
      const cacheKey = getCacheKey(stepId, text);

      // Con withTimestamps, "ya lo tengo" significa audio Y alignment
      // guardados — no solo el audio. Si el audio ya existe pero el
      // alignment no (falló antes, es de una versión vieja, etc.), hay
      // que seguir adelante y pedirlo de nuevo, aunque eso implique
      // volver a descargar el audio también (hoy no existe un camino
      // separado para pedir solo los tiempos). Con withTimestamps: false
      // (chat, transición), esto no cambia nada — sigue importando solo
      // si el audio existe, exactamente como antes.
      const hasRequiredAlignment =
        !withTimestamps || !!alignmentCacheRef.current[cacheKey];

      if (audioCacheRef.current[cacheKey] && hasRequiredAlignment) {
        return;
      }

      const fileUri = getFileUri(stepId, text);
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (fileInfo.exists && hasRequiredAlignment) {
        console.log("🟢 Usando audio guardado:", stepId);
        audioCacheRef.current[cacheKey] = fileUri;
        return;
      }

      if (fileInfo.exists && !hasRequiredAlignment) {
        console.log(
          "🟡 Audio guardado sin alignment, volviendo a pedir:",
          stepId
        );
      }

      console.log("🔴 Generando audio:", stepId);

      if (!withTimestamps) {
        // Camino de siempre — no tocar nada acá.
        try {
          const res = await fetch(`${TOUR_API_BASE_URL}/voice`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              [TOUR_API_KEY_HEADER]: TOUR_API_KEY,
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
        return;
      }

      try {
        const res = await fetch(`${TOUR_API_BASE_URL}/voice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            [TOUR_API_KEY_HEADER]: TOUR_API_KEY,
          },
          body: JSON.stringify({ text, mode: "narration", withTimestamps: true }),
        });

        if (!res.ok) {
          throw new Error(`Backend /voice respondió ${res.status}`);
        }

        const data = await res.json();

        // audioBase64 ya viene en base64 (a diferencia del camino de
        // arriba, que recibe bytes crudos vía arrayBuffer) — se escribe
        // directo, sin la vuelta arrayBuffer→Buffer→base64.
        await FileSystem.writeAsStringAsync(fileUri, data.audioBase64, {
          encoding: "base64",
        });

        audioCacheRef.current[cacheKey] = fileUri;

        alignmentCacheRef.current[cacheKey] = data.alignment
          ? {
              characters: data.alignment.characters,
              characterStartTimesSeconds:
                data.alignment.character_start_times_seconds,
              characterEndTimesSeconds:
                data.alignment.character_end_times_seconds,
            }
          : null;
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

  // Igual que playCachedAudio (mismo caché por stepId+texto, mismo
  // player), pero espera a que termine de sonar antes de resolver — para
  // poder encadenar audios uno después del otro sin que se pisen (ej. la
  // frase de transición antes de retomar la narración real). Reutiliza el
  // mismo patrón de espera (`playbackStatusUpdate` + `didJustFinish`) que
  // ya usa playAudioBase64 más abajo.
  const playCachedAudioAndWait = useCallback(
    async (stepId: string, text: string) => {
      const cacheKey = getCacheKey(stepId, text);
      const uri = audioCacheRef.current[cacheKey];

      if (!uri) return;

      try {
        player.replace({ uri });
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
      } catch (e) {
        console.log("Error reproduciendo audio (esperando a que termine)", e);
      }
    },
    [getCacheKey, player]
  );

  // Siempre precarga narración real de pasos del tour (nunca la frase de
  // transición, que se pide aparte) — por eso pasa withTimestamps: true
  // directo, así el alignment ya está listo antes de que el usuario
  // llegue a necesitarlo.
  const preloadStepsAudio = useCallback(
    async (steps: AudioStep[], onStepReady?: (stepId: string) => void) => {
      if (isGeneratingRef.current) return;

      isGeneratingRef.current = true;

      try {
        for (const step of steps) {
          await ensureAudioForStep(step.id, step.text, true);
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
          headers: {
            "Content-Type": "application/json",
            [TOUR_API_KEY_HEADER]: TOUR_API_KEY,
          },
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

  // currentStep es opcional: si se pasa (y hay una duración real
  // cargada), la posición guardada se "redondea hacia atrás" hasta el
  // inicio de la oración que estaba sonando, en vez del segundo exacto —
  // para que "Hablar con GUÍA" no reanude a mitad de una frase. Con
  // alignment real disponible para ese cacheKey, usa el inicio EXACTO de
  // ElevenLabs; si no (falló la carga, es un paso viejo cuyo audio ya
  // estaba en disco de antes, etc.), cae a la estimación por conteo de
  // caracteres, que ya existía. Sin currentStep (ej. el efecto de
  // narración de app/tour.tsx, que llama a esto antes de pasar a un paso
  // nuevo y nunca usa la posición guardada después), se guarda el segundo
  // exacto tal cual, como siempre.
  const stopCurrentAudio = useCallback(
    async (currentStep?: { stepId: string; voiceText: string }) => {
      try {
        const currentTimeSeconds = player.currentTime;

        if (currentStep && player.duration > 0) {
          // Misma limpieza que aplica el backend antes de generar el
          // audio (quita "(pausa)"/"(micro pausa)") — si no, el conteo
          // de caracteres incluiría texto que la voz real nunca dice.
          const cleanedVoiceText = cleanNarrationText(currentStep.voiceText);
          const cacheKey = getCacheKey(currentStep.stepId, currentStep.voiceText);
          const alignment = alignmentCacheRef.current[cacheKey];

          if (alignment) {
            const sentenceStarts = buildSentenceStartsFromAlignment(
              cleanedVoiceText,
              alignment
            );
            const rawPosition = findSentenceStartAtOrBefore(
              sentenceStarts,
              currentTimeSeconds
            );

            // Solo acá — el camino de estimación de abajo ya funciona
            // bien como fallback, sin este ajuste.
            lastPositionSecondsRef.current =
              rawPosition + ALIGNMENT_SEEK_BUFFER_SECONDS;
          } else {
            const sentenceStarts = estimateSentenceStartTimes(
              cleanedVoiceText,
              player.duration
            );
            lastPositionSecondsRef.current = findSentenceStartAtOrBefore(
              sentenceStarts,
              currentTimeSeconds
            );
          }
        } else {
          lastPositionSecondsRef.current = currentTimeSeconds;
        }

        player.pause();
      } catch {}
      if (pulseAnim) {
        pulseAnim.setValue(1);
      }
      smoothedAmplitudeRef.current = 0;
      peakRef.current = PEAK_FLOOR;
      voiceEnergy.value = 0;
    },
    [player, pulseAnim, voiceEnergy, getCacheKey]
  );

  return {
    ensureAudioForStep,
    playCachedAudio,
    playCachedAudioAndWait,
    resumeCachedAudioFromLastPosition,
    preloadStepsAudio,
    stopCurrentAudio,
    speakChatReply,
    playAudioBase64,
    voiceEnergy,
  };
}