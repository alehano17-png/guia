import { Buffer } from "buffer";
import CryptoJS from "crypto-js";
import { Audio } from "expo-av";
import { useCallback, useRef } from "react";
import { TOUR_API_BASE_URL } from "../lib/tourApiConfig";

const FileSystem = require("expo-file-system/legacy");

type AudioStep = {
  id: string;
  text: string;
};

export function useTourAudio() {
  const audioCacheRef = useRef<Record<string, string>>({});
  const currentAudioRef = useRef<Audio.Sound | null>(null);
  const isGeneratingRef = useRef(false);

  const getHash = useCallback((text: string) => {
    return CryptoJS.MD5(text).toString();
  }, []);

  const getCacheKey = useCallback(
    (stepId: string, text: string) => `${stepId}-${getHash(text)}`,
    [getHash]
  );

  const getFileUri = useCallback(
    (stepId: string, text: string) =>
      FileSystem.documentDirectory + `${stepId}-${getHash(text)}.mp3`,
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
          body: JSON.stringify({ text }),
        });

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

  const playCachedAudio = useCallback(
    async (stepId: string, text: string) => {
      const cacheKey = getCacheKey(stepId, text);
      const uri = audioCacheRef.current[cacheKey];

      if (!uri) return;

      try {
        if (currentAudioRef.current) {
          try {
            await currentAudioRef.current.stopAsync();
          } catch {}

          try {
            await currentAudioRef.current.unloadAsync();
          } catch {}

          currentAudioRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true }
        );

        currentAudioRef.current = sound;
      } catch (e) {
        console.log("Error reproduciendo audio", e);
      }
    },
    [getCacheKey]
  );

  const preloadStepsAudio = useCallback(
    async (steps: AudioStep[]) => {
      if (isGeneratingRef.current) return;

      isGeneratingRef.current = true;

      try {
        for (const step of steps) {
          await ensureAudioForStep(step.id, step.text);
        }
      } finally {
        isGeneratingRef.current = false;
      }
    },
    [ensureAudioForStep]
  );

  const stopCurrentAudio = useCallback(async () => {
    if (currentAudioRef.current) {
      try {
        await currentAudioRef.current.stopAsync();
      } catch {}

      try {
        await currentAudioRef.current.unloadAsync();
      } catch {}

      currentAudioRef.current = null;
    }
  }, []);

  return {
    ensureAudioForStep,
    playCachedAudio,
    preloadStepsAudio,
    stopCurrentAudio,
  };
}