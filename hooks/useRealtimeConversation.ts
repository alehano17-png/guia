import { requestRecordingPermissionsAsync, setAudioModeAsync } from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { type SharedValue, useSharedValue } from "react-native-reanimated";
import type { TourLocale } from "../data/tours/index";
import { translations } from "../lib/i18n";
import {
  AUDIO_LEVEL_POLL_MS,
  CONVERSATION_IDLE_SECONDS,
  GOODBYE_AT_SECONDS,
  GOODBYE_FORCE_AT_SECONDS,
  HEARTBEAT_INTERVAL_SECONDS,
  MIC_SPEECH_LEVEL,
} from "../lib/realtimeConversationConfig";
import { TourApiError, tourApiFetch } from "../lib/tourApiConfig";
import { getWebRTC, type WebRTCLib } from "../lib/webrtc";

// Conversación por voz en tiempo real con GUÍA (OpenAI Realtime por
// WebRTC). El audio va directo entre el celular y OpenAI; nuestro servidor
// solo hace el intercambio SDP (/realtime/call) y controla el tiempo de la
// bolsa del tour. La app obedece: avisa que sigue viva (heartbeat), lleva un
// cronómetro de respaldo por si el servidor no responde, y cierra sola por
// silencio, al ir a segundo plano o al agotarse el tiempo.
//
// Nunca se registra en logs el audio ni el contenido de la conversación.

export type RealtimeConversationStatus =
  | "idle"
  | "connecting"
  // Abierta, esperando o escuchando a la persona.
  | "listening"
  // GUÍA hablando.
  | "speaking"
  | "ending"
  // La bolsa de este tour está en 0.
  | "no_time"
  | "error";

// Por qué terminó (o no llegó a abrirse) una conversación.
export type RealtimeEndReason =
  | "user"
  | "idle"
  | "background"
  | "time_up"
  | "server_closed"
  | "connection_lost"
  | "exit"
  | "step_changed"
  | "no_time"
  | "unavailable"
  | "error";

export type RealtimeStartContext = {
  tourTitle?: string;
  context?: string;
  summary?: string;
  highlights?: string[];
};

type PeerConnection = InstanceType<WebRTCLib["RTCPeerConnection"]>;
type DataChannel = ReturnType<PeerConnection["createDataChannel"]>;
type Stream = Awaited<ReturnType<WebRTCLib["mediaDevices"]["getUserMedia"]>>;
type Timer = ReturnType<typeof setTimeout>;

// Todo lo de UNA conversación. Las funciones reciben la sesión explícita
// para que un evento atrasado de una conversación ya cerrada nunca toque la
// siguiente.
type Session = {
  runId: string;
  language: TourLocale;
  pc: PeerConnection | null;
  dc: DataChannel | null;
  stream: Stream | null;
  // Ya se pidió /realtime/call: al cerrar hay que avisar /realtime/end.
  callRequested: boolean;
  // El servidor respondió 403: la bolsa está en 0.
  noTime: boolean;
  ending: boolean;
  // Momento (ms) en que se acaba la bolsa según el último dato del servidor.
  deadlineMs: number | null;
  speaking: boolean;
  responseActive: boolean;
  goodbyePending: boolean;
  goodbyeSent: boolean;
  heartbeatTimer: ReturnType<typeof setInterval> | null;
  countdownTimer: ReturnType<typeof setInterval> | null;
  levelTimer: ReturnType<typeof setInterval> | null;
  levelBusy: boolean;
  idleTimer: Timer | null;
};

function newSession(runId: string, language: TourLocale): Session {
  return {
    runId,
    language,
    pc: null,
    dc: null,
    stream: null,
    callRequested: false,
    noTime: false,
    ending: false,
    deadlineMs: null,
    speaking: false,
    responseActive: false,
    goodbyePending: false,
    goodbyeSent: false,
    heartbeatTimer: null,
    countdownTimer: null,
    levelTimer: null,
    levelBusy: false,
    idleTimer: null,
  };
}

// Audio por el altavoz del celular, no por el auricular de llamadas: en
// Android expo-audio pone el AudioManager en modo normal con el altavoz
// encendido (shouldRouteThroughEarpiece: false), y en iOS la sesión en
// playAndRecord con defaultToSpeaker. Es global, así que también lo sigue
// el audio de WebRTC.
async function routeAudioToSpeaker() {
  try {
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      shouldRouteThroughEarpiece: false,
    });
  } catch {
    // Si falla, la conversación sigue igual (con el ruteo que haya).
  }
}

// Vuelve al modo solo-reproducción de la narración.
async function restorePlaybackAudioMode() {
  try {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldRouteThroughEarpiece: false,
    });
  } catch {
    // La narración vuelve a reforzar este modo antes de cada reproducción.
  }
}

// audioLevel de WebRTC es lineal (0 a 1) y la voz suele quedar bajo 0.3; la
// raíz cuadrada lo lleva a una escala más pareja para animar.
function toLevel(raw: number) {
  return Math.min(1, Math.sqrt(Math.max(0, raw)));
}

// Escribe un nivel suavizado (fuera del hook, para no mutar desde un
// callback memorizado).
function writeLevel(shared: SharedValue<number>, target: number) {
  shared.value = shared.value * 0.4 + target * 0.6;
}

function resetLevel(shared: SharedValue<number>) {
  shared.value = 0;
}

function sendEvent(s: Session, event: object) {
  if (s.dc && s.dc.readyState === "open") {
    s.dc.send(JSON.stringify(event));
  }
}

function clearIdle(s: Session) {
  if (s.idleTimer) clearTimeout(s.idleTimer);
  s.idleTimer = null;
}

function clearTimers(s: Session) {
  clearIdle(s);
  if (s.heartbeatTimer) clearInterval(s.heartbeatTimer);
  if (s.countdownTimer) clearInterval(s.countdownTimer);
  if (s.levelTimer) clearInterval(s.levelTimer);
  s.heartbeatTimer = null;
  s.countdownTimer = null;
  s.levelTimer = null;
}

// Cierra el micrófono y la conexión con OpenAI.
function closeMedia(s: Session) {
  try {
    s.dc?.close();
  } catch {
    // ya cerrado
  }
  try {
    s.pc?.close();
  } catch {
    // ya cerrada
  }
  try {
    s.stream?.getTracks().forEach((track) => track.stop());
    s.stream?.release();
  } catch {
    // ya liberado
  }
  s.dc = null;
  s.pc = null;
  s.stream = null;
}

export function useRealtimeConversation({
  language,
  knownRemainingSeconds,
  onRemainingSeconds,
  onEnded,
}: {
  // Idioma del tour: el de GUÍA y el de su despedida.
  language: TourLocale;
  // Lo último que dijo el servidor sobre la bolsa (null si no se sabe).
  knownRemainingSeconds: number | null;
  // Para que la pantalla muestre lo que queda (lo calcula el servidor).
  onRemainingSeconds: (seconds: number) => void;
  // Una vez por cada intento de conversación, al terminar (o al no poder
  // abrirse), con el motivo: la pantalla decide si retoma la narración.
  onEnded: (reason: RealtimeEndReason) => void;
}) {
  const [status, setStatus] = useState<RealtimeConversationStatus>("idle");
  // Niveles aproximados (0 a 1) para animar el globo: el micrófono mientras
  // escucha y la voz de GUÍA mientras habla. Salen de las estadísticas de
  // WebRTC (audioLevel de "media-source" y de "inbound-rtp").
  const micLevel = useSharedValue(0);
  const guiaLevel = useSharedValue(0);

  const sessionRef = useRef<Session | null>(null);
  const mountedRef = useRef(true);
  const onEndedRef = useRef(onEnded);
  const onRemainingRef = useRef(onRemainingSeconds);
  const knownRemainingRef = useRef(knownRemainingSeconds);

  useEffect(() => {
    onEndedRef.current = onEnded;
    onRemainingRef.current = onRemainingSeconds;
    knownRemainingRef.current = knownRemainingSeconds;
  }, [onEnded, onRemainingSeconds, knownRemainingSeconds]);

  const setStatusIfMounted = useCallback((next: RealtimeConversationStatus) => {
    if (mountedRef.current) setStatus(next);
  }, []);

  // Cierra UNA conversación: corta todo lo local, avisa /realtime/end,
  // actualiza lo que queda de la bolsa y vuelve el audio al modo normal.
  // Idempotente: una segunda llamada para la misma sesión no hace nada.
  const finishSession = useCallback(
    async (s: Session, reason: RealtimeEndReason) => {
      if (s.ending) return;
      s.ending = true;
      if (sessionRef.current === s) sessionRef.current = null;

      setStatusIfMounted("ending");
      clearTimers(s);
      closeMedia(s);
      resetLevel(micLevel);
      resetLevel(guiaLevel);

      // Servidor caído: null (él mismo cierra por falta de avisos).
      const fromServer: number | null = s.callRequested
        ? await tourApiFetch("/realtime/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ runId: s.runId }),
          })
            .then((res) => res.json())
            .then((data) =>
              typeof data?.remainingSeconds === "number" ? data.remainingSeconds : null
            )
            .catch(() => null)
        : null;
      const remaining = reason === "no_time" || s.noTime ? 0 : fromServer;
      if (remaining !== null) onRemainingRef.current(remaining);

      await restorePlaybackAudioMode();

      const outOfTime =
        remaining !== null ? remaining <= 0 : reason === "time_up" || reason === "no_time";
      setStatusIfMounted(
        outOfTime ? "no_time" : reason === "error" ? "error" : "idle"
      );
      onEndedRef.current(reason);
    },
    [micLevel, guiaLevel, setStatusIfMounted]
  );

  const startIdle = useCallback(
    (s: Session) => {
      clearIdle(s);
      if (s.goodbyeSent) return;
      s.idleTimer = setTimeout(() => {
        finishSession(s, "idle");
      }, CONVERSATION_IDLE_SECONDS * 1000);
    },
    [finishSession]
  );

  // Despedida al agotarse la bolsa: una sola vez, en el idioma del tour. El
  // micrófono se silencia para que la persona no dispare otra respuesta.
  const sendGoodbye = useCallback((s: Session) => {
    if (s.goodbyeSent || s.ending) return;
    s.goodbyeSent = true;
    s.goodbyePending = false;
    clearIdle(s);
    s.stream?.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    sendEvent(s, {
      type: "response.create",
      response: {
        instructions: translations[s.language].guia.realtimeGoodbyeInstruction,
      },
    });
  }, []);

  // Eventos del canal de datos de OpenAI (nombres de la guía oficial de
  // Realtime por WebRTC). Solo se mira el tipo; el contenido no se guarda.
  const handleServerEvent = useCallback(
    (s: Session, raw: unknown) => {
      if (s.ending) return;
      let event: { type?: string } | null = null;
      try {
        event = JSON.parse(String(raw));
      } catch {
        return;
      }

      switch (event?.type) {
        case "input_audio_buffer.speech_started":
          clearIdle(s);
          break;
        case "input_audio_buffer.speech_stopped":
          // Respaldo: si GUÍA no llega a responder, igual cierra por silencio.
          startIdle(s);
          break;
        case "response.created":
          s.responseActive = true;
          clearIdle(s);
          break;
        case "response.done":
          s.responseActive = false;
          if (s.goodbyePending) {
            sendGoodbye(s);
          } else if (!s.speaking) {
            // Respuesta sin audio que reproducir: igual empieza la espera de
            // silencio (si hubo audio, empieza con output_audio_buffer.stopped).
            startIdle(s);
          }
          break;
        case "output_audio_buffer.started":
          s.speaking = true;
          clearIdle(s);
          setStatusIfMounted("speaking");
          break;
        case "output_audio_buffer.stopped":
          s.speaking = false;
          if (s.goodbyeSent && !s.responseActive) {
            // Terminó de despedirse: se acabó la bolsa.
            finishSession(s, "time_up");
            return;
          }
          setStatusIfMounted("listening");
          startIdle(s);
          break;
        case "output_audio_buffer.cleared":
          // La persona interrumpió a GUÍA: está hablando, no se espera silencio.
          s.speaking = false;
          setStatusIfMounted("listening");
          break;
        default:
          break;
      }
    },
    [finishSession, sendGoodbye, setStatusIfMounted, startIdle]
  );

  // Cronómetro de respaldo: cuenta hacia atrás desde lo que dijo el
  // servidor y se resincroniza con cada heartbeat. Si llega a 0, la app
  // cierra aunque el servidor no responda.
  const tickCountdown = useCallback(
    (s: Session) => {
      if (s.ending || s.deadlineMs === null) return;
      const left = Math.ceil((s.deadlineMs - Date.now()) / 1000);

      if (left <= 0) {
        finishSession(s, "time_up");
        return;
      }

      if (!s.goodbyeSent && left <= GOODBYE_AT_SECONDS) {
        if (!s.responseActive && !s.speaking) {
          sendGoodbye(s);
        } else if (left <= GOODBYE_FORCE_AT_SECONDS) {
          // No alcanza a terminar su respuesta: se corta para despedirse.
          sendEvent(s, { type: "response.cancel" });
          sendEvent(s, { type: "output_audio_buffer.clear" });
          s.responseActive = false;
          sendGoodbye(s);
        } else {
          s.goodbyePending = true;
        }
      }
    },
    [finishSession, sendGoodbye]
  );

  const sendHeartbeat = useCallback(
    (s: Session) => {
      tourApiFetch("/realtime/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: s.runId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (s.ending) return;
          if (data?.ok === false) {
            // El servidor ya la cerró: la app cierra la suya.
            finishSession(s, "server_closed");
          } else if (typeof data?.remainingSeconds === "number") {
            s.deadlineMs = Date.now() + data.remainingSeconds * 1000;
          }
        })
        .catch(() => {
          // Sin respuesta: el cronómetro de respaldo sigue contando.
        });
    },
    [finishSession]
  );

  const pollLevels = useCallback(
    async (s: Session) => {
      if (s.levelBusy || !s.pc || s.ending) return;
      s.levelBusy = true;
      try {
        const report: Map<string, Record<string, unknown>> = await s.pc.getStats();
        let mic = 0;
        let guia = 0;
        report.forEach((stat) => {
          const kind = stat.kind ?? stat.mediaType;
          const level = stat.audioLevel;
          if (kind !== "audio" || typeof level !== "number") return;
          if (stat.type === "media-source") mic = level;
          else if (stat.type === "inbound-rtp") guia = level;
        });
        if (s.ending) return;

        const micValue = s.speaking ? 0 : toLevel(mic);
        writeLevel(micLevel, micValue);
        writeLevel(guiaLevel, s.speaking ? toLevel(guia) : 0);

        // La persona está hablando aunque el servidor no lo haya avisado:
        // la espera de silencio vuelve a empezar.
        if (s.idleTimer && micValue > MIC_SPEECH_LEVEL) startIdle(s);
      } catch {
        // Sin estadísticas en este momento: se intenta en la próxima vuelta.
      } finally {
        s.levelBusy = false;
      }
    },
    [micLevel, guiaLevel, startIdle]
  );

  const handleChannelOpen = useCallback(
    (s: Session) => {
      if (s.ending) return;
      setStatusIfMounted("listening");
      // WebRTC puede reconfigurar la sesión de audio al conectar (iOS): se
      // vuelve a pedir el altavoz.
      routeAudioToSpeaker();
      startIdle(s);
      sendHeartbeat(s);
      s.heartbeatTimer = setInterval(
        () => sendHeartbeat(s),
        HEARTBEAT_INTERVAL_SECONDS * 1000
      );
      s.countdownTimer = setInterval(() => tickCountdown(s), 1000);
      s.levelTimer = setInterval(() => {
        pollLevels(s);
      }, AUDIO_LEVEL_POLL_MS);
    },
    [pollLevels, sendHeartbeat, setStatusIfMounted, startIdle, tickCountdown]
  );

  // Abre una conversación: micrófono -> conexión WebRTC -> oferta SDP ->
  // /realtime/call (el servidor crea la llamada en OpenAI) -> respuesta SDP.
  // runId llega como parámetro (no del render): puede venir de un reintento
  // de /tour/start hecho justo antes, en el mismo toque.
  const start = useCallback(
    async (runId: string, context: RealtimeStartContext) => {
      if (sessionRef.current) return;

      const s = newSession(runId, language);
      sessionRef.current = s;

      const lib = getWebRTC();
      if (!lib || !runId) {
        await finishSession(s, "unavailable");
        return;
      }
      if (knownRemainingRef.current === 0) {
        await finishSession(s, "no_time");
        return;
      }

      setStatusIfMounted("connecting");

      let failed = false;
      try {
        const permission = await requestRecordingPermissionsAsync();
        if (!permission.granted) {
          failed = true;
        } else if (!s.ending) {
          await routeAudioToSpeaker();

          const stream = await lib.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          s.stream = stream;

          const pc = new lib.RTCPeerConnection({});
          s.pc = pc;
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));

          const dc = pc.createDataChannel("oai-events");
          s.dc = dc;
          dc.addEventListener("open", () => handleChannelOpen(s));
          dc.addEventListener("message", (event) =>
            handleServerEvent(s, event.data)
          );
          dc.addEventListener("close", () => {
            finishSession(s, "connection_lost");
          });
          pc.addEventListener("connectionstatechange", () => {
            if (pc.connectionState === "failed" || pc.connectionState === "closed") {
              finishSession(s, "connection_lost");
            }
          });

          const offer = await pc.createOffer({});
          await pc.setLocalDescription(offer);

          if (!s.ending) {
            s.callRequested = true;
            const res = await tourApiFetch("/realtime/call", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                runId,
                sdp: offer.sdp,
                language,
                tourTitle: context.tourTitle,
                context: context.context,
                summary: context.summary,
                highlights: context.highlights,
              }),
            }).catch((error: unknown) => {
              // 403: la bolsa de este tour está en 0.
              if (error instanceof TourApiError && error.status === 403) {
                s.noTime = true;
              }
              throw error;
            });
            const data = await res.json();

            if (!s.ending) {
              await pc.setRemoteDescription({ type: "answer", sdp: data.sdp });
              const seconds =
                typeof data.remainingSeconds === "number" ? data.remainingSeconds : 0;
              s.deadlineMs = Date.now() + seconds * 1000;
              onRemainingRef.current(seconds);
            }
          }
        }
      } catch {
        failed = true;
      }

      if (failed) {
        await finishSession(s, s.noTime ? "no_time" : "error");
      }
    },
    [language, finishSession, handleChannelOpen, handleServerEvent, setStatusIfMounted]
  );

  // Cierra la conversación activa (si hay). Idempotente.
  const end = useCallback(
    async (reason: RealtimeEndReason) => {
      const s = sessionRef.current;
      if (s) await finishSession(s, reason);
    },
    [finishSession]
  );

  // Al mandar la app a segundo plano (inicio, bloquear, cambiar de app) la
  // conversación se cierra en ese momento. Solo "background": "inactive"
  // también aparece con el diálogo del permiso de micrófono en iOS.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      const s = sessionRef.current;
      if (state === "background" && s) finishSession(s, "background");
    });
    return () => subscription.remove();
  }, [finishSession]);

  // Al salir de la pantalla del tour (también con el botón atrás de
  // Android), la conversación se cierra y se avisa al servidor.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const s = sessionRef.current;
      if (s) finishSession(s, "exit");
    };
  }, [finishSession]);

  const isActive =
    status === "connecting" ||
    status === "listening" ||
    status === "speaking" ||
    status === "ending";

  return { status, isActive, start, end, micLevel, guiaLevel };
}
