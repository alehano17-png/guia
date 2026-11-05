// Conversaciones de voz en tiempo real con la bolsa de segundos por tour.
//
// El servidor hace el intercambio WebRTC con OpenAI (la app nunca recibe
// llaves), mide cada conversación y la corta. Todo el estado que importa
// para cobrar vive en la tabla public.tour_runs, no solo en memoria, para
// que ni un reinicio del servidor ni la app cerrada a la fuerza puedan
// reiniciar la bolsa ni regalar tiempo:
//
// - seconds_used: lo ya consumido de la bolsa del tour.
// - active_call_id / active_call_started_at / active_call_last_seen_at: la
//   conversación abierta (si hay) y su último aviso de vida (heartbeat).
//
// Mientras OpenAI crea la llamada, active_call_id guarda una reserva
// "pending:<uuid>" que nunca se cobra.
//
// Sin avisos de la app (heartbeat) por HEARTBEAT_TIMEOUT_SECONDS, el
// servidor cuelga y descuenta hasta el momento del corte (último aviso +
// esos segundos), para que una app que nunca avisa no hable gratis. Al
// arrancar el servidor, las que quedaron abiertas por una caída o reinicio
// se descuentan con la misma regla. Mientras el servidor está caído, el
// cronómetro de respaldo de la app corta al agotarse la bolsa, usando el
// remainingSeconds que devuelven /realtime/call y cada heartbeat.

import crypto from "node:crypto";
import {
  HEARTBEAT_TIMEOUT_SECONDS,
  PENDING_CALL_TIMEOUT_SECONDS,
  REALTIME_MODEL,
  REALTIME_NOISE_REDUCTION,
  REALTIME_REASONING_EFFORT,
  REALTIME_TURN_DETECTION,
  REALTIME_VOICE,
  STALE_CHECK_INTERVAL_SECONDS,
  TOUR_CONVERSATION_SECONDS,
  VALID_TOUR_IDS,
} from "./realtimeConfig.js";

const TABLE = "tour_runs";
const COLUMNS =
  "id,user_id,tour_id,seconds_used,started_at,finished_at,active_call_id,active_call_started_at,active_call_last_seen_at";
const PENDING_PREFIX = "pending:";
const HEARTBEAT_TIMEOUT_MS = HEARTBEAT_TIMEOUT_SECONDS * 1000;
const PENDING_TIMEOUT_MS = PENDING_CALL_TIMEOUT_SECONDS * 1000;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const OPENAI_CALLS_URL = "https://api.openai.com/v1/realtime/calls";

// Error con respuesta HTTP ya decidida (status + cuerpo para la app).
export class ConversationError extends Error {
  constructor(status, body) {
    super(body.error);
    this.status = status;
    this.body = body;
  }
}

// Configuración completa de la sesión, siempre desde realtimeConfig.js.
// Sin audio.input.transcription: queda en su valor por defecto (null,
// desactivada).
export function buildRealtimeSession(instructions) {
  return {
    type: "realtime",
    model: REALTIME_MODEL,
    instructions,
    output_modalities: ["audio"],
    audio: {
      input: {
        noise_reduction: { type: REALTIME_NOISE_REDUCTION },
        turn_detection: REALTIME_TURN_DETECTION,
      },
      output: { voice: REALTIME_VOICE },
    },
    reasoning: { effort: REALTIME_REASONING_EFFORT },
  };
}

// Conexión real con OpenAI Realtime por WebRTC:
// - crear: POST /v1/realtime/calls (multipart con "sdp" y "session"); la
//   respuesta trae el SDP de OpenAI en el cuerpo y el id de la llamada al
//   final del header Location.
// - colgar: POST /v1/realtime/calls/{call_id}/hangup.
export function createOpenAiRealtimeCalls(apiKey) {
  return {
    async createCall({ sdp, session, safetyId }) {
      const form = new FormData();
      form.set("sdp", sdp);
      form.set("session", JSON.stringify(session));

      const res = await fetch(OPENAI_CALLS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          // Identificador anónimo (hash) recomendado por OpenAI para
          // detectar abusos por usuario sin mandar su id real.
          "OpenAI-Safety-Identifier": safetyId,
        },
        body: form,
      });

      if (!res.ok) {
        let code = "";
        try {
          code = (await res.json())?.error?.code ?? "";
        } catch {
          // Sin cuerpo JSON: basta con el status.
        }
        const error = new Error("openai_create_call_failed");
        error.status = res.status;
        error.code = code;
        throw error;
      }

      const callId = (res.headers.get("location") ?? "")
        .split("/")
        .filter(Boolean)
        .pop();
      const answer = await res.text();

      if (!callId || !answer) {
        const error = new Error("openai_create_call_invalid_response");
        error.status = res.status;
        throw error;
      }

      return { sdp: answer, callId };
    },

    // Devuelve el status HTTP de OpenAI (200 = colgando; 404 = ya no existe).
    async hangup(callId) {
      const res = await fetch(
        `${OPENAI_CALLS_URL}/${encodeURIComponent(callId)}/hangup`,
        { method: "POST", headers: { Authorization: `Bearer ${apiKey}` } }
      );
      return res.status;
    },
  };
}

// db: cliente admin de Supabase. calls: { createCall, hangup } (el real de
// arriba, o uno simulado en pruebas).
export function createConversationManager({ db, calls, log = console }) {
  // Pedidos del mismo usuario en fila, uno a la vez (doble toque, dos
  // celulares). La base igual protege con actualizaciones condicionadas.
  const userLocks = new Map();
  // Conversaciones abiertas por este proceso: { callId, userId, runId,
  // startedAt, timer, staleTimer }, con el corte programado al agotarse la
  // bolsa (timer) y el corte exacto por falta de avisos (staleTimer).
  const activeCalls = new Map();
  let sweeping = false;

  function withUserLock(userId, fn) {
    const previous = userLocks.get(userId) ?? Promise.resolve();
    const run = previous.then(fn, fn);
    const tail = run.catch(() => {});
    userLocks.set(userId, tail);
    tail.then(() => {
      if (userLocks.get(userId) === tail) userLocks.delete(userId);
    });
    return run;
  }

  const isPending = (callId) =>
    typeof callId === "string" && callId.startsWith(PENDING_PREFIX);
  const iso = (ms) => new Date(ms).toISOString();

  // Hasta cuándo se cobra una conversación que se cierra:
  // - "now": hasta ahora (la app la terminó, se agotó la bolsa, la reemplazó
  //   otra, se terminó el tour, o el vigilante la encontró sin avisos).
  // - "deadline": cortada por falta de avisos, o quedó abierta por una caída
  //   o reinicio del servidor; hasta el momento del corte (último aviso +
  //   HEARTBEAT_TIMEOUT_SECONDS), o hasta ahora si eso todavía no llegó.
  function chargeEndMs(row, nowMs, mode) {
    const lastSeen = Date.parse(row.active_call_last_seen_at);
    if (mode === "deadline") {
      return Math.min(nowMs, lastSeen + HEARTBEAT_TIMEOUT_MS);
    }
    return nowMs;
  }

  // Sin avisos de la app hace HEARTBEAT_TIMEOUT_SECONDS o más.
  function isStale(row, nowMs) {
    return nowMs - Date.parse(row.active_call_last_seen_at) >= HEARTBEAT_TIMEOUT_MS;
  }

  // Segundos de la conversación activa de una fila hasta endMs, redondeados
  // hacia arriba. Una reserva "pending" nunca se cobra.
  function activeSeconds(row, endMs) {
    if (!row.active_call_id || isPending(row.active_call_id)) return 0;
    const startedMs = Date.parse(row.active_call_started_at);
    return Math.max(0, Math.ceil((endMs - startedMs) / 1000));
  }

  // Tiempo restante de la bolsa, siempre calculado desde la tabla (incluye
  // lo que va de la conversación abierta).
  function remainingSeconds(row, nowMs = Date.now()) {
    const live = activeSeconds(row, chargeEndMs(row, nowMs, "now"));
    return Math.max(0, TOUR_CONVERSATION_SECONDS - row.seconds_used - live);
  }

  function forgetActiveCall(callId) {
    const entry = activeCalls.get(callId);
    if (entry?.timer) clearTimeout(entry.timer);
    if (entry?.staleTimer) clearTimeout(entry.staleTimer);
    activeCalls.delete(callId);
  }

  // Cuelga en OpenAI sin hacer fallar a quien llama. Si OpenAI falla, se
  // reintenta en segundo plano: una llamada que sigue abierta en OpenAI
  // seguiría hablando sin descontar de la bolsa.
  async function hangupQuietly(callId, attempt = 1) {
    try {
      const status = await calls.hangup(callId);
      if (status < 300 || status === 404) return;
      throw Object.assign(new Error("hangup_failed"), { status });
    } catch (e) {
      log.error(
        "Error colgando una conversación en OpenAI:",
        e?.status ?? "",
        `intento ${attempt}`
      );
      if (attempt < 3) {
        const retry = setTimeout(
          () => hangupQuietly(callId, attempt + 1),
          attempt * 2000
        );
        retry.unref?.();
      }
    }
  }

  // LA única función que cierra una conversación (por /realtime/end, corte
  // programado, falta de heartbeat, reemplazo, /tour/finish o reinicio):
  // suma lo usado a seconds_used (sin pasar de la bolsa), limpia active_call_*
  // y cuelga en OpenAI. Condicionada a que la fila siga con esta llamada y
  // con el mismo último aviso, para que dos cierres a la vez nunca descuenten
  // dos veces ni un heartbeat de último segundo cambie la cuenta.
  // Devuelve la fila ya actualizada, o null si otra vía ya la había cerrado.
  // requireStale: cerrar solo si sigue sin avisos (corte por falta de
  // heartbeat); si llegó un aviso nuevo, no la cierra y devuelve null.
  async function closeCall(callId, mode, { requireStale = false } = {}) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: row, error } = await db
        .from(TABLE)
        .select(COLUMNS)
        .eq("active_call_id", callId)
        .maybeSingle();
      if (error) throw error;
      if (!row) {
        forgetActiveCall(callId);
        return null;
      }
      if (requireStale && !isStale(row, Date.now())) return null;

      const secondsUsed = Math.min(
        TOUR_CONVERSATION_SECONDS,
        row.seconds_used + activeSeconds(row, chargeEndMs(row, Date.now(), mode))
      );

      const { data: updated, error: updateError } = await db
        .from(TABLE)
        .update({
          seconds_used: secondsUsed,
          active_call_id: null,
          active_call_started_at: null,
          active_call_last_seen_at: null,
        })
        .eq("id", row.id)
        .eq("active_call_id", callId)
        .eq("active_call_last_seen_at", row.active_call_last_seen_at)
        .select(COLUMNS);
      if (updateError) throw updateError;

      if (updated.length === 1) {
        forgetActiveCall(callId);
        if (!isPending(callId)) await hangupQuietly(callId);
        return updated[0];
      }
      // Un heartbeat movió el último aviso entre la lectura y la escritura:
      // se vuelve a leer y a calcular.
    }

    throw new Error("close_call_conflict");
  }

  // Corte exacto por falta de avisos: vence HEARTBEAT_TIMEOUT_SECONDS después
  // del último aviso; cada aviso que recibe este proceso lo reinicia.
  function scheduleStaleCheck(entry, lastSeenMs) {
    if (entry.staleTimer) clearTimeout(entry.staleTimer);
    const delay = Math.max(0, lastSeenMs + HEARTBEAT_TIMEOUT_MS - Date.now());
    entry.staleTimer = setTimeout(() => {
      entry.staleTimer = null;
      closeIfStale(entry).catch((e) =>
        log.error("Error cortando una conversación sin avisos:", e?.code ?? e?.name ?? "Error")
      );
    }, delay + 20);
    entry.staleTimer.unref?.();
  }

  // Al vencer: si sigue sin avisos, se corta y se descuenta hasta el momento
  // del corte. Si llegó un aviso más nuevo (por ejemplo, a otro proceso), se
  // reprograma desde ese aviso.
  async function closeIfStale(entry) {
    const closed = await closeCall(entry.callId, "deadline", { requireStale: true });
    if (closed || !activeCalls.has(entry.callId)) return;

    const { data: row, error } = await db
      .from(TABLE)
      .select("active_call_last_seen_at")
      .eq("active_call_id", entry.callId)
      .maybeSingle();
    if (error) throw error;
    if (row) scheduleStaleCheck(entry, Date.parse(row.active_call_last_seen_at));
    else forgetActiveCall(entry.callId);
  }

  async function activeRowsOfUser(userId) {
    const { data, error } = await db
      .from(TABLE)
      .select(COLUMNS)
      .eq("user_id", userId)
      .not("active_call_id", "is", null);
    if (error) throw error;
    return data;
  }

  async function closeUserCalls(userId, mode) {
    let lastClosed = null;
    for (const row of await activeRowsOfUser(userId)) {
      lastClosed = (await closeCall(row.active_call_id, mode)) ?? lastClosed;
    }
    return lastClosed;
  }

  async function findOwnRun(userId, runId) {
    if (typeof runId !== "string" || !UUID_RE.test(runId)) return null;
    const { data, error } = await db
      .from(TABLE)
      .select(COLUMNS)
      .eq("id", runId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function getOwnRun(userId, runId) {
    const run = await findOwnRun(userId, runId);
    if (!run) throw new ConversationError(404, { error: "run_not_found" });
    return run;
  }

  // Run abierto (sin finished_at) de ese tour. Si por alguna carrera
  // hubiera más de uno, se usa el que tiene MENOS tiempo restante: nunca se
  // regala tiempo.
  async function findOpenRun(userId, tourId) {
    const { data, error } = await db
      .from(TABLE)
      .select(COLUMNS)
      .eq("user_id", userId)
      .eq("tour_id", tourId)
      .is("finished_at", null)
      .order("seconds_used", { ascending: false })
      .order("started_at", { ascending: true })
      .limit(1);
    if (error) throw error;
    return data[0] ?? null;
  }

  // POST /tour/start: misma bolsa si el tour ya estaba iniciado y sin
  // terminar; bolsa nueva solo si no hay ninguno abierto.
  function startTour(userId, tourId) {
    // Solo tours que existen en la app: con ids inventados se podrían abrir
    // bolsas nuevas sin límite.
    if (!VALID_TOUR_IDS.includes(tourId)) {
      return Promise.reject(new ConversationError(400, { error: "unknown_tour" }));
    }

    return withUserLock(userId, async () => {
      const existing = await findOpenRun(userId, tourId);
      if (existing) {
        return { runId: existing.id, remainingSeconds: remainingSeconds(existing) };
      }

      // TODO(pagos): hoy la bolsa se abre al iniciar el tour. Cuando existan
      // los pagos, crear la fila solo si el usuario compró este tour (y
      // responder un error si no), en vez de crearla siempre aquí.
      const { data, error } = await db
        .from(TABLE)
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          tour_id: tourId,
          seconds_used: 0,
          started_at: iso(Date.now()),
        })
        .select(COLUMNS)
        .single();

      if (error) {
        // Con un índice único de "un run abierto por tour", otro pedido lo
        // creó primero: se usa ese.
        if (error.code === "23505") {
          const again = await findOpenRun(userId, tourId);
          if (again) {
            return { runId: again.id, remainingSeconds: remainingSeconds(again) };
          }
        }
        throw error;
      }

      return { runId: data.id, remainingSeconds: remainingSeconds(data) };
    });
  }

  // POST /tour/finish: cierra la bolsa (y la conversación abierta, si hay).
  function finishTour(userId, runId) {
    return withUserLock(userId, async () => {
      const run = await getOwnRun(userId, runId);
      if (run.active_call_id) await closeCall(run.active_call_id, "now");

      if (!run.finished_at) {
        const { error } = await db
          .from(TABLE)
          .update({ finished_at: iso(Date.now()) })
          .eq("id", run.id)
          .eq("user_id", userId)
          .is("finished_at", null);
        if (error) throw error;
      }

      // Por si otro proceso abrió una conversación entre medio.
      const after = await findOwnRun(userId, run.id);
      if (after?.active_call_id) await closeCall(after.active_call_id, "now");

      return { ok: true };
    });
  }

  // Reserva ATÓMICA: solo si el run es del usuario, sigue abierto y no tiene
  // conversación activa. Devuelve la fila reservada o null.
  async function reserveCall(userId, runId, pendingId) {
    const nowIso = iso(Date.now());
    const { data, error } = await db
      .from(TABLE)
      .update({
        active_call_id: pendingId,
        active_call_started_at: nowIso,
        active_call_last_seen_at: nowIso,
      })
      .eq("id", runId)
      .eq("user_id", userId)
      .is("finished_at", null)
      .is("active_call_id", null)
      .select(COLUMNS);
    if (error) {
      // Con un índice único de "una conversación activa por usuario".
      if (error.code === "23505") return null;
      throw error;
    }
    return data[0] ?? null;
  }

  // Libera una reserva sin descontar nada.
  async function releaseReservation(pendingId) {
    const { error } = await db
      .from(TABLE)
      .update({
        active_call_id: null,
        active_call_started_at: null,
        active_call_last_seen_at: null,
      })
      .eq("active_call_id", pendingId);
    if (error) throw error;
  }

  function scheduleCutoff(entry, seconds) {
    entry.timer = setTimeout(() => {
      entry.timer = null;
      closeCall(entry.callId, "now").catch((e) =>
        log.error("Error cortando una conversación al agotar la bolsa:", e?.code ?? e?.name ?? "Error")
      );
    }, seconds * 1000);
    entry.timer.unref?.();
  }

  // POST /realtime/call: abre una conversación nueva con la oferta SDP de la
  // app. Devuelve el SDP de OpenAI y los segundos que le quedan a la bolsa.
  function startCall(userId, { runId, sdp, instructions }) {
    return withUserLock(userId, async () => {
      const run = await getOwnRun(userId, runId);
      if (run.finished_at) {
        throw new ConversationError(409, { error: "tour_finished" });
      }

      // Nunca dos a la vez: la que estuviera abierta se cierra y se descuenta
      // primero (en este u otro tour del mismo usuario).
      await closeUserCalls(userId, "now");

      const pendingId = `${PENDING_PREFIX}${crypto.randomUUID()}`;
      let reserved = await reserveCall(userId, run.id, pendingId);
      if (!reserved) {
        await closeUserCalls(userId, "now");
        reserved = await reserveCall(userId, run.id, pendingId);
      }
      if (!reserved) {
        const current = await getOwnRun(userId, run.id);
        if (current.finished_at) {
          throw new ConversationError(409, { error: "tour_finished" });
        }
        throw new ConversationError(409, { error: "call_busy" });
      }

      // Otro proceso pudo abrir una en OTRO tour del mismo usuario entre el
      // cierre de arriba y esta reserva: después de reservar se cierra
      // cualquier otra. De dos pedidos que reservan a la vez, al menos uno
      // ve al otro, así que nunca quedan dos abiertas (en el peor caso se
      // anulan entre sí y quedan cero).
      for (const other of await activeRowsOfUser(userId)) {
        if (other.active_call_id !== pendingId) {
          await closeCall(other.active_call_id, "now");
        }
      }

      // El restante sale de la fila YA reservada: nadie puede descontar
      // mientras la reserva está puesta.
      const remaining = TOUR_CONVERSATION_SECONDS - reserved.seconds_used;
      if (remaining <= 0) {
        await releaseReservation(pendingId);
        throw new ConversationError(403, {
          error: "conversation_limit_reached",
          remainingSeconds: 0,
        });
      }

      let created;
      try {
        created = await calls.createCall({
          sdp,
          session: buildRealtimeSession(instructions),
          safetyId: crypto.createHash("sha256").update(userId).digest("hex"),
        });
      } catch (e) {
        // Sin datos del usuario en el log; no se descuenta nada.
        log.error(
          "Error creando la conversación en OpenAI:",
          e?.status ?? "",
          e?.code || e?.name || "Error"
        );
        await releaseReservation(pendingId);
        throw new ConversationError(502, { error: "realtime_unavailable" });
      }

      // La conversación cuenta desde que OpenAI la abrió (no se cobra lo que
      // tardó en crearse).
      const startedAt = Date.now();
      const { data: activated, error } = await db
        .from(TABLE)
        .update({
          active_call_id: created.callId,
          active_call_started_at: iso(startedAt),
          active_call_last_seen_at: iso(startedAt),
        })
        .eq("id", run.id)
        .eq("active_call_id", pendingId)
        .select("id");

      if (error || activated.length !== 1) {
        // La reserva ya no está (otra vía la cerró): esta llamada no puede
        // quedar abierta sin control.
        await hangupQuietly(created.callId);
        if (error) {
          await releaseReservation(pendingId).catch(() => {});
          throw error;
        }
        throw new ConversationError(409, { error: "call_superseded" });
      }

      const entry = {
        callId: created.callId,
        userId,
        runId: run.id,
        startedAt,
        timer: null,
        staleTimer: null,
      };
      activeCalls.set(created.callId, entry);
      scheduleCutoff(entry, remaining);
      // Al abrirse cuenta como primer aviso: si la app nunca avisa, se corta
      // a los HEARTBEAT_TIMEOUT_SECONDS.
      scheduleStaleCheck(entry, startedAt);

      return { sdp: created.sdp, remainingSeconds: remaining };
    });
  }

  // POST /realtime/end: cierra la conversación activa del usuario (si hay).
  function endCall(userId, runId) {
    return withUserLock(userId, async () => {
      const lastClosed = await closeUserCalls(userId, "now");
      const run = runId ? await findOwnRun(userId, runId) : lastClosed;
      return {
        ok: true,
        remainingSeconds: run ? remainingSeconds(run) : null,
      };
    });
  }

  // POST /realtime/heartbeat: la app sigue viva. Mientras la conversación
  // está activa, SIEMPRE devuelve remainingSeconds calculado aquí desde la
  // tabla: la app resincroniza con él su cronómetro de respaldo. Si el aviso
  // llega tarde (ya pasó el límite), la conversación se corta y se descuenta
  // hasta el momento del corte.
  async function heartbeat(userId) {
    const rows = (await activeRowsOfUser(userId)).filter(
      (row) => !isPending(row.active_call_id)
    );
    if (rows.length === 0) return { ok: false };

    const row = rows[0];
    const now = Date.now();

    if (isStale(row, now)) {
      await closeCall(row.active_call_id, "deadline");
      return { ok: false };
    }

    const { data, error } = await db
      .from(TABLE)
      .update({ active_call_last_seen_at: iso(now) })
      .eq("id", row.id)
      .eq("active_call_id", row.active_call_id)
      .select(COLUMNS);
    if (error) throw error;
    if (data.length === 0) return { ok: false };

    // Reinicia el corte exacto por falta de avisos (si la abrió este proceso).
    const entry = activeCalls.get(row.active_call_id);
    if (entry) scheduleStaleCheck(entry, now);

    const remaining = remainingSeconds(data[0], now);
    if (remaining <= 0) {
      await closeCall(row.active_call_id, "now");
      return { ok: false, remainingSeconds: 0 };
    }
    return { ok: true, remainingSeconds: remaining };
  }

  // Vigilante (respaldo): cierra las reservas colgadas, las conversaciones
  // sin avisos que NO abrió este proceso (las suyas las corta su
  // temporizador exacto) cobrando hasta ahora, y las que ya agotaron la
  // bolsa por si su corte programado se perdió.
  async function sweepStaleCalls() {
    if (sweeping) return;
    sweeping = true;
    try {
      const { data, error } = await db
        .from(TABLE)
        .select(COLUMNS)
        .not("active_call_id", "is", null)
        .limit(500);
      if (error) throw error;

      const now = Date.now();
      for (const row of data) {
        const sinceLastSeen = now - Date.parse(row.active_call_last_seen_at);
        if (isPending(row.active_call_id)) {
          // Una reserva nunca se cobra, sea cual sea el modo.
          if (sinceLastSeen > PENDING_TIMEOUT_MS) {
            await closeCall(row.active_call_id, "deadline");
          }
        } else if (isStale(row, now)) {
          if (!activeCalls.has(row.active_call_id)) {
            await closeCall(row.active_call_id, "now", { requireStale: true });
          }
        } else if (remainingSeconds(row, now) <= 0) {
          await closeCall(row.active_call_id, "now");
        }
      }
    } finally {
      sweeping = false;
    }
  }

  // Al arrancar el servidor: las conversaciones que quedaron abiertas (el
  // servidor se cayó o reinició) se cuelgan en OpenAI y se cobran con la
  // misma regla que el corte por falta de avisos: hasta el último aviso +
  // HEARTBEAT_TIMEOUT_SECONDS, sin pasar de la bolsa (o hasta ahora, si el
  // servidor volvió antes de ese momento).
  async function recoverOpenCalls() {
    const { data, error } = await db
      .from(TABLE)
      .select(COLUMNS)
      .not("active_call_id", "is", null);
    if (error) throw error;

    let closed = 0;
    for (const row of data) {
      if (await closeCall(row.active_call_id, "deadline")) closed++;
    }
    return closed;
  }

  function startWatchdog() {
    const timer = setInterval(() => {
      sweepStaleCalls().catch((e) =>
        log.error("Error revisando conversaciones abiertas:", e?.code ?? e?.name ?? "Error")
      );
    }, STALE_CHECK_INTERVAL_SECONDS * 1000);
    return timer;
  }

  return {
    startTour,
    finishTour,
    startCall,
    endCall,
    heartbeat,
    sweepStaleCalls,
    recoverOpenCalls,
    startWatchdog,
    remainingSeconds,
  };
}
