import { Audio } from "expo-av";
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

// 5 preguntas + 5 respuestas — bastante para que la siguiente pregunta
// tenga contexto ("¿y hasta qué hora?" después de "¿a qué hora abre?"),
// sin encarecer ni alentar cada turno más a medida que la charla crece.
const MAX_HISTORY_MESSAGES = 10;

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
};

async function recordUntilSilence(): Promise<string | null> {
  const { status: permStatus } = await Audio.requestPermissionsAsync();
  if (permStatus !== "granted") {
    throw new Error("Permiso de micrófono no concedido");
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync({
    ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });

  return new Promise<string | null>((resolve) => {
    let silenceStartedAt: number | null = null;
    let finished = false;

    const finish = async () => {
      if (finished) return;
      finished = true;
      clearTimeout(maxTimer);
      recording.setOnRecordingStatusUpdate(null);

      try {
        await recording.stopAndUnloadAsync();
      } catch {
        // ya pudo haberse detenido; no es un error real
      }

      resolve(recording.getURI());
    };

    const maxTimer = setTimeout(finish, MAX_RECORDING_MS);

    recording.setOnRecordingStatusUpdate((status) => {
      if (!status.isRecording || status.metering === undefined) return;

      if (status.metering < SILENCE_THRESHOLD_DB) {
        if (silenceStartedAt === null) {
          silenceStartedAt = Date.now();
        } else if (Date.now() - silenceStartedAt > SILENCE_DURATION_MS) {
          finish();
        }
      } else {
        silenceStartedAt = null;
      }
    });

    recording.startAsync();
  });
}

export function useGuiaVoiceMode({
  stopCurrentAudio,
  playAudioChunk,
}: UseGuiaVoiceModeParams) {
  const [status, setStatus] = useState<GuiaVoiceStatus>("idle");
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
        const uri = await recordUntilSilence();

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
        isActiveRef.current = false;
      }
    },
    [stopCurrentAudio, playAudioChunk, pushToHistory]
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
      const uri = await recordUntilSilence();

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
      isActiveRef.current = false;
    }
  }, [stopCurrentAudio]);

  return {
    status,
    askGuia,
    transcribeSpokenText,
    resetConversation,
    getHistory,
    pushToHistory,
  };
}
