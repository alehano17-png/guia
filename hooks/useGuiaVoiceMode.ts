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
// Margen de gracia desde que arranca la grabación durante el cual el
// detector de silencio no puede cortar, sin importar qué tan callado esté
// el audio en ese lapso — evita cortar la grabación casi en seco si el
// usuario tarda un instante normal en empezar a hablar después de tocar
// el botón (reacción, respirar, pensar la pregunta).
const MIN_RECORDING_MS_BEFORE_SILENCE = 800;

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
  // Vuelve a reproducir el paso actual del tour — se llama siempre al
  // terminar askGuia() (éxito, transcripción vacía, o error), porque
  // stopCurrentAudio() ya pausó la narración al principio y nada más la
  // reanuda por su cuenta.
  resumeNarration: () => Promise<void>;
};

async function recordUntilSilence(): Promise<string | null> {
  // TEMP DEBUG [GUIA FLOW] — punto 4: entrando a recordUntilSilence().
  console.log("[GUIA FLOW] recordUntilSilence() - entrando");

  const { status: permStatus } = await Audio.requestPermissionsAsync();
  if (permStatus !== "granted") {
    throw new Error("Permiso de micrófono no concedido");
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
  // TEMP DEBUG [GUIA FLOW] — punto 5: setAudioModeAsync() resolvió bien,
  // todavía no se crea el Recording.
  console.log(
    "[GUIA FLOW] recordUntilSilence() - Audio.setAudioModeAsync() resolvió OK"
  );

  // El software (prepareToRecordAsync, startAsync) no reporta ningún error
  // en el segundo uso seguido, pero el micrófono como hardware a veces no
  // se reconectó a tiempo tras el ciclo anterior de detener grabación +
  // reproducir audio — el medidor queda clavado en -120 (sin señal) toda
  // la grabación. Esta espera le da tiempo real al hardware antes de
  // pedirle que empiece de nuevo.
  await new Promise((resolve) => setTimeout(resolve, 300));

  const recording = new Audio.Recording();

  try {
    await recording.prepareToRecordAsync({
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    });
    // TEMP DEBUG [GUIA FLOW] — punto 6: prepareToRecordAsync() resolvió
    // bien.
    console.log(
      "[GUIA FLOW] recordUntilSilence() - prepareToRecordAsync() resolvió OK"
    );
  } catch (e) {
    // TEMP DEBUG — diagnóstico de "recorder not prepared" en el segundo
    // uso seguido de "Hablar con GUÍA". Log detallado a propósito: no
    // solo el mensaje, todo lo que el objeto de error tenga (código,
    // dominio, propiedades nativas específicas de iOS/Android, etc.).
    // Remover después.
    console.log("[GUIA DEBUG] prepareToRecordAsync FALLÓ. Error crudo:", e);
    console.log(
      "[GUIA DEBUG] prepareToRecordAsync — detalle:",
      JSON.stringify(
        {
          message: e instanceof Error ? e.message : String(e),
          name: e instanceof Error ? e.name : undefined,
          stack: e instanceof Error ? e.stack : undefined,
          ownProperties:
            e && typeof e === "object"
              ? Object.getOwnPropertyNames(e).reduce(
                  (acc, key) => {
                    acc[key] = (e as Record<string, unknown>)[key];
                    return acc;
                  },
                  {} as Record<string, unknown>
                )
              : e,
        },
        null,
        2
      )
    );
    // Se relanza para no cambiar el comportamiento real: sigue
    // propagándose exactamente igual que antes hasta el catch de
    // askGuia(), que pone status "error".
    throw e;
  }

  return new Promise<string | null>((resolve) => {
    let silenceStartedAt: number | null = null;
    let finished = false;

    const finish = async () => {
      // TEMP DEBUG [GUIA FLOW] — punto 9: se llamó a finish() (antes de
      // la guarda de "ya terminado", para ver también llamadas
      // duplicadas si las hubiera).
      console.log("[GUIA FLOW] recordUntilSilence() - finish() llamado, finished ya era:", finished);

      if (finished) return;
      finished = true;
      clearTimeout(maxTimer);
      recording.setOnRecordingStatusUpdate(null);

      try {
        await recording.stopAndUnloadAsync();
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
      //
      // Usa Audio.setAudioModeAsync de expo-av (la misma librería que ya
      // usa esta función para grabar) en vez de la de expo-audio: mezclar
      // las dos dejaba la sesión de audio en un estado que rompía el
      // grabador en el siguiente intento ("Prepare encountered an error:
      // recorder not prepared").
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
      } catch (e) {
        console.log("Error volviendo a modo solo-reproducción", e);
      }

      // TEMP DEBUG [GUIA FLOW] — punto 10: justo cuando recordUntilSilence()
      // retorna, con el valor exacto (URI o null).
      const finalUri = recording.getURI();
      console.log("[GUIA FLOW] recordUntilSilence() - retornando:", finalUri);
      resolve(finalUri);
    };

    const maxTimer = setTimeout(finish, MAX_RECORDING_MS);
    const recordingStartedAt = Date.now();

    recording.setOnRecordingStatusUpdate((status) => {
      // TEMP DEBUG [GUIA FLOW] — punto 8: cada vez que se dispara el
      // callback de status/metering, con el metering y si está dentro
      // del período de gracia.
      console.log(
        "[GUIA FLOW] recordUntilSilence() - status update:",
        JSON.stringify({
          isRecording: status.isRecording,
          metering: status.metering,
          withinGracePeriod:
            Date.now() - recordingStartedAt < MIN_RECORDING_MS_BEFORE_SILENCE,
        })
      );

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
    });

    recording.startAsync().then(() => {
      // TEMP DEBUG [GUIA FLOW] — punto 7: justo después de que
      // startAsync() resuelve bien. No se agrega .catch() para no
      // cambiar el comportamiento actual (ya no estaba manejado).
      console.log(
        "[GUIA FLOW] recordUntilSilence() - recording.startAsync() resolvió OK"
      );
    });
  });
}

export function useGuiaVoiceMode({
  stopCurrentAudio,
  playAudioChunk,
  resumeNarration,
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
      // TEMP DEBUG [GUIA FLOW] — punto 1: entrando a askGuia().
      console.log("[GUIA FLOW] askGuia() - entrando");

      // TEMP DEBUG [GUIA FLOW] — punto 2: valor exacto de isActiveRef.current
      // antes de decidir si continuar o hacer return.
      console.log("[GUIA FLOW] askGuia() - isActiveRef.current:", isActiveRef.current);
      if (isActiveRef.current) return; // ya hay una pregunta en curso
      isActiveRef.current = true;

      try {
        await stopCurrentAudio();

        setStatus("listening");
        // TEMP DEBUG [GUIA FLOW] — punto 3: justo antes de llamar a
        // recordUntilSilence().
        console.log("[GUIA FLOW] askGuia() - antes de recordUntilSilence()");
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
            // TEMP DEBUG — diagnóstico del bug "GUÍA nunca se escucha",
            // remover después.
            console.log(
              "[GUIA DEBUG] onChunk recibido:",
              JSON.stringify({ text: chunkText, hasAudio: !!chunkAudioBase64 })
            );

            if (!hasStartedSpeaking) {
              hasStartedSpeaking = true;
              setStatus("speaking");
            }

            if (!chunkAudioBase64) {
              // Ese pedazo puntual falló al generar audio — se salta sin
              // cortar la reproducción de los siguientes.
              console.log(
                "[GUIA DEBUG] Pedazo sin audio, se salta:",
                chunkText
              );
              return;
            }

            console.log(
              "[GUIA DEBUG] Llamando a playAudioChunk para:",
              chunkText
            );
            try {
              await playAudioChunk(chunkAudioBase64, chunkText);
              console.log(
                "[GUIA DEBUG] playAudioChunk terminó OK para:",
                chunkText
              );
            } catch (playError) {
              console.log(
                "[GUIA DEBUG] playAudioChunk FALLÓ para:",
                chunkText,
                playError
              );
              throw playError;
            }
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
    [stopCurrentAudio, playAudioChunk, pushToHistory, resumeNarration]
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
