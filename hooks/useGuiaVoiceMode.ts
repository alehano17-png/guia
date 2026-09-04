import {
  AudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import { useCallback, useRef, useState } from "react";
import {
  ConversationMessage,
  sendTourChatMessage,
} from "../lib/sendTourChatMessage";
import { transcribeAudio } from "../lib/transcribeAudio";

const FileSystem = require("expo-file-system/legacy");

// Umbral y tiempos para detectar que el usuario dejó de hablar, sin pedirle
// que toque nada. Son valores de partida razonables: si en las pruebas se
// corta muy rápido o tarda de más en reaccionar, son los primeros números a
// ajustar.
const SILENCE_THRESHOLD_DB = -35;
const SILENCE_DURATION_MS = 1200;
const MAX_RECORDING_MS = 12000;
// Margen de gracia desde que arranca la grabación durante el cual el
// detector de silencio no puede cortar, sin importar qué tan callado esté
// el audio en ese lapso — evita cortar la grabación casi en seco si el
// usuario tarda un instante normal en empezar a hablar después de tocar
// el botón (reacción, respirar, pensar la pregunta).
const MIN_RECORDING_MS_BEFORE_SILENCE = 800;
// Cada cuánto se consulta el nivel del micrófono. expo-audio no empuja el
// metering en un callback como hacía expo-av; hay que sondearlo nosotros
// con recorder.getStatus(). 500ms replica exactamente la cadencia que
// traía expo-av por defecto (nunca se configuró setProgressUpdateInterval).
const METERING_POLL_MS = 500;

// Igual que antes: el preset de alta calidad más el flag de metering
// (RecordingPresets.HIGH_QUALITY no lo incluye). Objeto fijo a nivel de
// módulo para que useAudioRecorder no recree el grabador entre renders
// (recrea si cambia el JSON de las opciones).
const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

// 5 preguntas + 5 respuestas — bastante para que la siguiente pregunta
// tenga contexto ("¿y hasta qué hora?" después de "¿a qué hora abre?"),
// sin encarecer ni alentar cada turno más a medida que la charla crece.
const MAX_HISTORY_MESSAGES = 10;

// Frases cortas de transición antes de retomar el punto del tour, para
// que la vuelta a la narración no se sienta como una interrupción
// silenciosa. Se elige una al azar cada vez (en app/tour.tsx).
export const GUIA_TRANSITION_PHRASES = [
  "Continuemos con el recorrido.",
  "Sigamos donde estábamos.",
  "Retomemos la historia.",
  "Volvamos al recorrido.",
];

// No es el id de ningún paso real del tour — es fijo a propósito, para
// que las 4 frases de transición se cacheen (por ensureAudioForStep) bajo
// este mismo prefijo, cada una diferenciada por el hash de su propio
// texto.
export const GUIA_TRANSITION_AUDIO_STEP_ID = "guia-transition";

export type GuiaVoiceStatus = "idle" | "listening" | "thinking" | "speaking" | "error";

type TourContext = {
  context?: string;
  summary?: string;
  highlights?: string[];
  tourTitle?: string;
};

type UseGuiaVoiceModeParams = {
  // Cortar la narración en curso apenas se detecta la palabra clave.
  stopCurrentAudio: () => Promise<void>;
  // Reproduce un pedazo de audio ya generado (base64) y resuelve cuando
  // termina de sonar — la misma reproducción que ya usaba speakChatReply
  // por debajo (en useTourAudio), solo que ahora se alimenta pedazo por
  // pedazo a medida que llegan del streaming de /chat, en vez de esperar
  // la respuesta completa.
  playAudioChunk: (audioBase64: string, cacheKeyText: string) => Promise<void>;
  // Vuelve a reproducir el paso actual del tour — se llama siempre al
  // terminar askGuia() (éxito, transcripción vacía, o error), porque
  // stopCurrentAudio() ya pausó la narración al principio y nada más la
  // reanuda por su cuenta.
  resumeNarration: () => Promise<void>;
};

async function recordUntilSilence(
  recorder: AudioRecorder
): Promise<string | null> {
  const { granted } = await requestRecordingPermissionsAsync();
  if (!granted) {
    throw new Error("Permiso de micrófono no concedido");
  }

  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });

  // El software (prepareToRecordAsync, record) no reporta ningún error
  // en el segundo uso seguido, pero el micrófono como hardware a veces no
  // se reconectó a tiempo tras el ciclo anterior de detener grabación +
  // reproducir audio — el medidor queda clavado en -120 (sin señal) toda
  // la grabación. Esta espera le da tiempo real al hardware antes de
  // pedirle que empiece de nuevo.
  await new Promise((resolve) => setTimeout(resolve, 300));

  // `recorder` es una única instancia de useAudioRecorder que se reusa
  // entre grabaciones (expo-av creaba un Audio.Recording nuevo cada vez).
  // prepareToRecordAsync lo deja listo otra vez antes de cada uso; las
  // opciones (RECORDING_OPTIONS, con metering) ya viajan en el hook.
  try {
    await recorder.prepareToRecordAsync();
  } catch (e) {
    // Se relanza para no cambiar el comportamiento real: sigue
    // propagándose exactamente igual que antes hasta el catch de
    // askGuia(), que pone status "error".
    throw e;
  }

  return new Promise<string | null>((resolve) => {
    let silenceStartedAt: number | null = null;
    let finished = false;

    const finish = async () => {
      if (finished) return;
      finished = true;
      clearTimeout(maxTimer);
      clearInterval(pollTimer);

      try {
        await recorder.stop();
      } catch {
        // ya pudo haberse detenido; no es un error real
      }

      // Bug conocido y sin resolver de expo-audio: después de grabar, el
      // audio (incluida la narración que se reanuda después) puede quedar
      // saliendo por el altavoz de llamadas (earpiece) en iPhone en vez
      // del altavoz principal. Avisarle al sistema que volvimos a modo
      // solo-reproducción es un intento razonable de que reasigne la
      // salida — no es una solución garantizada, es un problema abierto
      // en el repo de expo-audio, no un error de este código.
      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      } catch (e) {
        console.log("Error volviendo a modo solo-reproducción", e);
      }

      // recorder.uri suele estar poblado apenas resuelve stop(); el
      // getStatus().url es un respaldo por reportes de uri nulo justo
      // después de parar (sobre todo en Android).
      resolve(recorder.uri ?? recorder.getStatus().url);
    };

    const maxTimer = setTimeout(finish, MAX_RECORDING_MS);
    const recordingStartedAt = Date.now();

    // expo-audio no empuja el metering en un callback (el statusListener
    // de useAudioRecorder solo avisa fin/error, sin nivel). Se sondea el
    // estado nosotros: recorder.getStatus() es síncrono y trae `metering`
    // porque RECORDING_OPTIONS lleva isMeteringEnabled.
    const pollTimer = setInterval(() => {
      const status = recorder.getStatus();
      if (!status.isRecording || status.metering === undefined) return;

      // Período de gracia: todavía no evaluamos silencio, sin importar
      // qué tan callado esté el audio en este lapso.
      if (Date.now() - recordingStartedAt < MIN_RECORDING_MS_BEFORE_SILENCE) {
        return;
      }

      if (status.metering < SILENCE_THRESHOLD_DB) {
        if (silenceStartedAt === null) {
          silenceStartedAt = Date.now();
        } else if (Date.now() - silenceStartedAt > SILENCE_DURATION_MS) {
          finish();
        }
      } else {
        silenceStartedAt = null;
      }
    }, METERING_POLL_MS);

    // record() es síncrono en expo-audio (startAsync() de expo-av era
    // async; igual acá nunca se le hacía await ni .catch()).
    recorder.record();
  });
}

export function useGuiaVoiceMode({
  stopCurrentAudio,
  playAudioChunk,
  resumeNarration,
}: UseGuiaVoiceModeParams) {
  const [status, setStatus] = useState<GuiaVoiceStatus>("idle");
  // Instancia única de grabador, con lifecycle atado a este hook (se libera
  // al desmontar). recordUntilSilence la recibe por parámetro y la reusa en
  // cada grabación.
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const isActiveRef = useRef(false);
  // useRef (no useState): esto no necesita disparar un render propio, solo
  // acompañar a askGuia() de una llamada a la siguiente dentro del mismo
  // tour.
  const historyRef = useRef<ConversationMessage[]>([]);

  const pushToHistory = useCallback((entry: ConversationMessage) => {
    historyRef.current = [...historyRef.current, entry].slice(
      -MAX_HISTORY_MESSAGES
    );
  }, []);

  // Lee el historial actual — para que otro flujo (ej. el chat escrito)
  // pueda mandarlo en su propia llamada a sendTourChatMessage y compartir
  // la misma memoria de conversación que askGuia, sin duplicar el array.
  const getHistory = useCallback(() => historyRef.current, []);

  // Se llama cuando se detecta la palabra clave "GUÍA" mientras narra.
  const askGuia = useCallback(
    async (tourContext: TourContext) => {
      if (isActiveRef.current) return; // ya hay una pregunta en curso
      isActiveRef.current = true;

      try {
        await stopCurrentAudio();

        setStatus("listening");
        const uri = await recordUntilSilence(recorder);

        if (!uri) {
          setStatus("idle");
          return;
        }

        setStatus("thinking");
        const audioBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
        });

        const question = await transcribeAudio(audioBase64);

        if (!question.trim()) {
          setStatus("idle");
          return;
        }

        // El historial que se manda es el de ANTES de esta pregunta — la
        // pregunta en sí ya viaja aparte, en `message`.
        const historyForRequest = historyRef.current;
        pushToHistory({ role: "user", content: question });

        // Reproduce cada oración apenas llega, en el mismo orden en que el
        // backend las va generando — el `await` adentro de onChunk hace
        // que la siguiente oración no empiece a sonar hasta que termine
        // la anterior, aunque el streaming ya haya entregado varias.
        let hasStartedSpeaking = false;

        const reply = await sendTourChatMessage({
          message: question,
          ...tourContext,
          history: historyForRequest,
          onChunk: async (chunkText, chunkAudioBase64) => {
            if (!hasStartedSpeaking) {
              hasStartedSpeaking = true;
              setStatus("speaking");
            }

            if (!chunkAudioBase64) {
              // Ese pedazo puntual falló al generar audio — se salta sin
              // cortar la reproducción de los siguientes.
              return;
            }

            await playAudioChunk(chunkAudioBase64, chunkText);
          },
        });

        pushToHistory({ role: "assistant", content: reply });

        setStatus("idle");
      } catch (e) {
        console.log("Error en el modo de voz de GUÍA", e);
        setStatus("error");
      } finally {
        // Pase lo que pase (éxito, transcripción vacía, o error),
        // stopCurrentAudio() ya pausó la narración al principio de esta
        // función — sin esto, el tour queda mudo por el resto de la
        // caminata.
        try {
          await resumeNarration();
        } catch (e) {
          console.log("Error reanudando la narración tras GUÍA", e);
        }
        isActiveRef.current = false;
      }
    },
    [recorder, stopCurrentAudio, playAudioChunk, pushToHistory, resumeNarration]
  );

  // Vacía el historial de conversación — se llama al arrancar un tour
  // nuevo, para que la primera pregunta de un tour no arrastre contexto
  // de una charla anterior (de otro tour, o de una sesión previa).
  const resetConversation = useCallback(() => {
    historyRef.current = [];
  }, []);

  // Graba y transcribe, pero no envía nada a GUÍA ni reproduce ninguna
  // respuesta — solo devuelve el texto, para que quien llama (ej. el
  // ícono de dictado del chat) lo muestre en un campo editable antes de
  // decidir si lo envía.
  const transcribeSpokenText = useCallback(async (): Promise<string> => {
    if (isActiveRef.current) return ""; // ya hay una grabación en curso
    isActiveRef.current = true;

    try {
      await stopCurrentAudio();

      setStatus("listening");
      const uri = await recordUntilSilence(recorder);

      if (!uri) {
        setStatus("idle");
        return "";
      }

      setStatus("thinking");
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      const text = await transcribeAudio(audioBase64);

      setStatus("idle");
      return text;
    } catch (e) {
      console.log("Error al transcribir dictado", e);
      setStatus("error");
      return "";
    } finally {
      // Pase lo que pase (éxito, transcripción vacía, o error),
      // stopCurrentAudio() ya pausó la narración al principio de esta
      // función — sin esto, el tour queda mudo por el resto de la
      // caminata (mismo patrón que askGuia()).
      try {
        await resumeNarration();
      } catch (e) {
        console.log("Error reanudando la narración tras el dictado", e);
      }
      isActiveRef.current = false;
    }
  }, [recorder, stopCurrentAudio, resumeNarration]);

  return {
    status,
    askGuia,
    transcribeSpokenText,
    resetConversation,
    getHistory,
    pushToHistory,
  };
}
