import { Audio } from "expo-av";
import { useCallback, useRef, useState } from "react";
import { sendTourChatMessage } from "../lib/sendTourChatMessage";
import { transcribeAudio } from "../lib/transcribeAudio";

const FileSystem = require("expo-file-system/legacy");

// Umbral y tiempos para detectar que el usuario dejó de hablar, sin pedirle
// que toque nada. Son valores de partida razonables: si en las pruebas se
// corta muy rápido o tarda de más en reaccionar, son los primeros números a
// ajustar.
const SILENCE_THRESHOLD_DB = -35;
const SILENCE_DURATION_MS = 1200;
const MAX_RECORDING_MS = 12000;

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
  // Reproducir la respuesta ya generada, con la voz conversacional.
  speakChatReply: (text: string) => Promise<void>;
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
  speakChatReply,
}: UseGuiaVoiceModeParams) {
  const [status, setStatus] = useState<GuiaVoiceStatus>("idle");
  const isActiveRef = useRef(false);

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

        const reply = await sendTourChatMessage({
          message: question,
          ...tourContext,
        });

        setStatus("speaking");
        await speakChatReply(reply);

        setStatus("idle");
      } catch (e) {
        console.log("Error en el modo de voz de GUÍA", e);
        setStatus("error");
      } finally {
        isActiveRef.current = false;
      }
    },
    [stopCurrentAudio, speakChatReply]
  );

  return { status, askGuia };
}
