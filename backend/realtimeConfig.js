// Cambiar aquí la voz o el modelo de GUÍA; no requiere actualizar la app.
//
// Configuración de la conversación en tiempo real (OpenAI Realtime). El
// servidor crea cada llamada con esta configuración (POST /realtime/call),
// así la app nunca elige modelo, voz ni instrucciones.

export const REALTIME_MODEL = "gpt-realtime-2.1";

// Voces disponibles: alloy, ash, ballad, coral, echo, sage, shimmer, verse,
// marin, cedar.
export const REALTIME_VOICE = "echo";

// Esfuerzo de razonamiento: minimal, low, medium, high o xhigh. "minimal"
// responde más rápido, que es lo que importa en una conversación hablada.
export const REALTIME_REASONING_EFFORT = "minimal";

// Reducción de ruido del micrófono: "near_field" para el micrófono del
// celular cerca de la boca; "far_field" sería para un micrófono lejano.
export const REALTIME_NOISE_REDUCTION = "near_field";

// Detección de turnos: semantic_vad decide por el sentido de lo que se dice
// cuándo terminó de hablar la persona. "low" espera un poco más antes de
// responder, para no cortarla a mitad de frase.
export const REALTIME_TURN_DETECTION = {
  type: "semantic_vad",
  eagerness: "low",
};

// Estos números son decisión de negocio; cambiarlos solo aquí.
//
// Bolsa de conversación por tour iniciado: segundos en total, sin importar
// cuántas conversaciones se hagan con ella.
export const TOUR_CONVERSATION_SECONDS = 300;
// Protección anti-saturación (no limita a usuarios reales): máximo de
// conversaciones que un usuario puede abrir por hora.
export const REALTIME_CALLS_PER_HOUR = 30;

// Valores técnicos del control de conversaciones (no de negocio).
//
// La app avisa que sigue viva cada 10 s (POST /realtime/heartbeat). Si pasan
// HEARTBEAT_TIMEOUT_SECONDS sin aviso, el servidor cuelga la conversación y
// descuenta solo hasta el último aviso.
export const HEARTBEAT_TIMEOUT_SECONDS = 25;
// Cada cuánto revisa el servidor las conversaciones sin aviso o pasadas de
// su tiempo.
export const STALE_CHECK_INTERVAL_SECONDS = 5;
// Reserva hecha mientras OpenAI crea la llamada: si sigue así pasado este
// tiempo (por ejemplo, el servidor se cayó a mitad), se libera sin descontar.
export const PENDING_CALL_TIMEOUT_SECONDS = 60;
