// Cambiar aquí la voz o el modelo de GUÍA; no requiere actualizar la app.
//
// Configuración de la conversación en tiempo real (OpenAI Realtime). El
// servidor la fija al crear la llave temporal (POST /realtime/session), así
// la app nunca elige modelo, voz ni instrucciones.

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

// Duración máxima de una conversación; la app la usa para cortar sola.
export const MAX_SESSION_SECONDS = 300;

// Cuánto vale la llave temporal para iniciar la conexión. Solo sirve para
// conectarse: una vez abierta, la conversación sigue aunque la llave venza.
export const REALTIME_CLIENT_SECRET_TTL_SECONDS = 120;
