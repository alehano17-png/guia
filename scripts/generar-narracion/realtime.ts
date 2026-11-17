// OpenAI Realtime por WebSocket, servidor a servidor (no WebRTC). Nombres de
// eventos y campos según la referencia oficial (noviembre 2026):
// - cliente: session.update, response.create (con conversation: "none" la
//   respuesta queda fuera de la conversación: no arrastra nada de las
//   anteriores ni se guarda en ella; el texto va en "input").
// - servidor: session.created, session.updated, response.created,
//   response.output_audio.delta (audio PCM en base64, campo "delta"),
//   response.output_audio_transcript.delta / .done (campo "transcript"),
//   response.done (response.status, response.status_details,
//   response.usage) y error.

import WebSocket from "ws";
import { pcmFromBase64Chunks, SAMPLE_RATE } from "./audio";
import type { RealtimeUsage } from "./cost";

const REALTIME_URL = "wss://api.openai.com/v1/realtime";
const CONNECT_TIMEOUT_MS = 20_000;
const RESPONSE_TIMEOUT_MS = 180_000;

type ServerEvent = {
  type: string;
  delta?: string;
  transcript?: string;
  response?: {
    id?: string;
    status?: string;
    status_details?: { error?: { message?: string; code?: string } | null; reason?: string } | null;
    usage?: RealtimeUsage;
  };
  error?: { message?: string; code?: string; type?: string };
};

export type SpokenResult = {
  pcm: Int16Array;
  transcript: string;
  usage?: RealtimeUsage;
  status: string;
  problem?: string;
};

export class RealtimeSpeaker {
  private listeners = new Set<(event: ServerEvent) => void>();
  private failure: Error | null = null;

  private constructor(private ws: WebSocket) {
    ws.on("message", (data) => {
      let event: ServerEvent;
      try {
        event = JSON.parse(String(data)) as ServerEvent;
      } catch {
        return;
      }
      for (const listener of [...this.listeners]) listener(event);
    });
    const fail = (error: Error) => {
      this.failure ??= error;
      for (const listener of [...this.listeners]) listener({ type: "__closed__" });
    };
    // Sin la URL ni encabezados en el mensaje: nunca se imprime la llave.
    ws.on("error", (e) => fail(new Error(`WebSocket: ${e.message}`)));
    ws.on("close", (code) => fail(new Error(`WebSocket cerrado (código ${code})`)));
  }

  static async open(options: { apiKey: string; model: string; voice: string }): Promise<RealtimeSpeaker> {
    const ws = new WebSocket(`${REALTIME_URL}?model=${encodeURIComponent(options.model)}`, {
      headers: { Authorization: `Bearer ${options.apiKey}` },
    });
    const speaker = new RealtimeSpeaker(ws);
    await speaker.waitFor((e) => e.type === "session.created", CONNECT_TIMEOUT_MS);
    speaker.send({
      type: "session.update",
      session: {
        type: "realtime",
        output_modalities: ["audio"],
        audio: {
          // Sin micrófono: no hace falta detectar turnos.
          input: { turn_detection: null },
          output: { format: { type: "audio/pcm", rate: SAMPLE_RATE }, voice: options.voice },
        },
      },
    });
    await speaker.waitFor((e) => e.type === "session.updated", CONNECT_TIMEOUT_MS);
    return speaker;
  }

  private send(event: object) {
    this.ws.send(JSON.stringify(event));
  }

  // Espera un evento; falla con un evento "error", si se cierra la conexión
  // o si pasa el tiempo.
  private waitFor(match: (event: ServerEvent) => boolean, timeoutMs: number): Promise<ServerEvent> {
    return new Promise((resolve, reject) => {
      const done = (fn: () => void) => {
        clearTimeout(timer);
        this.listeners.delete(listener);
        fn();
      };
      const listener = (event: ServerEvent) => {
        if (event.type === "__closed__") return done(() => reject(this.failure ?? new Error("Conexión cerrada")));
        if (event.type === "error") {
          return done(() => reject(new Error(`OpenAI: ${event.error?.code ?? event.error?.type ?? "error"} - ${event.error?.message ?? ""}`)));
        }
        if (match(event)) done(() => resolve(event));
      };
      const timer = setTimeout(() => done(() => reject(new Error("Tiempo de espera agotado"))), timeoutMs);
      if (this.failure) return done(() => reject(this.failure!));
      this.listeners.add(listener);
    });
  }

  // Una respuesta fuera de la conversación: el modelo dice "text" siguiendo
  // "instructions", con la voz de la sesión. Sin reasoningEffort no se manda
  // el campo "reasoning" (para un modelo que no lo acepte).
  async speak(instructions: string, text: string, reasoningEffort?: string): Promise<SpokenResult> {
    const audio: string[] = [];
    let transcriptFromDeltas = "";
    let transcript: string | null = null;
    const collector = (event: ServerEvent) => {
      if (event.type === "response.output_audio.delta" && event.delta) audio.push(event.delta);
      if (event.type === "response.output_audio_transcript.delta" && event.delta) transcriptFromDeltas += event.delta;
      if (event.type === "response.output_audio_transcript.done" && typeof event.transcript === "string") {
        transcript = event.transcript;
      }
    };
    this.listeners.add(collector);
    try {
      this.send({
        type: "response.create",
        response: {
          conversation: "none",
          output_modalities: ["audio"],
          instructions,
          ...(reasoningEffort ? { reasoning: { effort: reasoningEffort } } : {}),
          input: [{ type: "message", role: "user", content: [{ type: "input_text", text }] }],
        },
      });
      const done = await this.waitFor((e) => e.type === "response.done", RESPONSE_TIMEOUT_MS);
      const status = done.response?.status ?? "desconocido";
      const details = done.response?.status_details;
      return {
        pcm: pcmFromBase64Chunks(audio),
        transcript: transcript ?? transcriptFromDeltas,
        usage: done.response?.usage,
        status,
        problem:
          status === "completed"
            ? undefined
            : `respuesta ${status}${details?.reason ? ` (${details.reason})` : ""}${details?.error?.message ? `: ${details.error.message}` : ""}`,
      };
    } finally {
      this.listeners.delete(collector);
    }
  }

  close() {
    this.ws.removeAllListeners("close");
    this.ws.close();
  }
}
