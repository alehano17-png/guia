// Tiempos de la conversación por voz en tiempo real (lado de la app). La
// bolsa de segundos por tour y el corte definitivo los controla el servidor
// (backend/realtimeConfig.js); estos valores solo dicen cuándo la app
// avisa, se despide o cierra por su cuenta.

// Si no hablas durante estos segundos después de que GUÍA terminó de
// hablar, la conversación se cierra sola.
export const CONVERSATION_IDLE_SECONDS = 8;

// Cada cuánto la app avisa al servidor que la conversación sigue abierta
// (POST /realtime/heartbeat). El servidor corta a los 15 s sin aviso.
export const HEARTBEAT_INTERVAL_SECONDS = 10;

// Cuando al cronómetro de la bolsa le quedan estos segundos, GUÍA se
// despide (una sola vez) diciendo que se acabó el tiempo de conversación.
export const GOODBYE_AT_SECONDS = 8;

// Si GUÍA estaba en medio de una respuesta, la despedida espera a que
// termine; si a la bolsa le quedan estos segundos y todavía no terminó, se
// corta la respuesta para alcanzar a despedirse.
export const GOODBYE_FORCE_AT_SECONDS = 4;

// Cada cuánto se leen los niveles de audio (micrófono y voz de GUÍA) de las
// estadísticas de WebRTC.
export const AUDIO_LEVEL_POLL_MS = 200;

// Nivel del micrófono (0 a 1, ya en la escala que expone el hook) a partir
// del cual se considera que la persona está hablando: reinicia la espera de
// silencio aunque el servidor no haya avisado todavía.
export const MIC_SPEECH_LEVEL = 0.22;
