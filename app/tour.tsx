// app/tour.tsx

import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TourChatSheet from "../components/tour/TourChatSheet";
import TourDecisionModal from "../components/tour/TourDecisionModal";
import TourHeader from "../components/tour/TourHeader";
import TourLoadingScreen from "../components/tour/TourLoadingScreen";
import TourMediaBlock from "../components/tour/TourMediaBlock";
import TourNarrationBlock from "../components/tour/TourNarrationBlock";
import TourNotFoundState from "../components/tour/TourNotFoundState";
import TourPrimaryButton from "../components/tour/TourPrimaryButton";
import { getTourMapRegion } from "../data/tours/map";
import {
  getChoiceNextStepId,
  getTourNextAction,
} from "../data/tours/navigation";
import { getTourPreviewData } from "../data/tours/preview";
import {
  GUIA_TRANSITION_AUDIO_STEP_ID,
  GUIA_TRANSITION_PHRASES,
  useGuiaVoiceMode,
} from "../hooks/useGuiaVoiceMode";
import { useTourAudio } from "../hooks/useTourAudio";
import { useTourLocation } from "../hooks/useTourLocation";
import { useTourRouteActions } from "../hooks/useTourRouteActions";
import { getDistanceInMeters } from "../lib/geo";
import { ChatMessage } from "../lib/chatTypes";
import { sendTourChatMessage } from "../lib/sendTourChatMessage";
import { TOUR_GRADIENT_COLORS } from "../lib/tourTheme";

// Radio de "llegada" al punto del recorrido, en metros — a partir de acá
// se dispara el avance automático (solo para pasos de tipo "advance").
const ARRIVAL_RADIUS_METERS = 30;


import {
  Animated,
  StyleSheet,
  View
} from "react-native";

import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getTourById,
  TourStep
} from "../data/tours/index";

export default function TourScreen() {
  const params = useLocalSearchParams<{ tourId?: string }>()
  const tourId =
    typeof params.tourId === "string" ? params.tourId : "miraflores-completo"

  return <TourScreenContent key={tourId} tourId={tourId} />
}

function TourScreenContent({ tourId }: { tourId: string }) {




const insets = useSafeAreaInsets()

const pulseAnim = useRef(new Animated.Value(1)).current

const [messages, setMessages] = useState<ChatMessage[]>([])

// Contador simple para las key de React de la lista de mensajes — no
// necesita ser más sofisticado que esto, solo tiene que ser único dentro
// de esta pantalla.
const nextMessageIdRef = useRef(0)
const createMessageId = () => {
  nextMessageIdRef.current += 1
  return `msg-${nextMessageIdRef.current}`
}

const [isThinking, setIsThinking] = useState(false)

const [input, setInput] = useState("")





const decisionAnim = useRef(new Animated.Value(0)).current


const {
  ensureAudioForStep,
  playCachedAudio,
  playCachedAudioAndWait,
  resumeCachedAudioFromLastPosition,
  preloadStepsAudio,
  stopCurrentAudio,
  playAudioBase64,
  voiceEnergy,
} = useTourAudio(pulseAnim);

// `step` todavía no existe en este punto del componente (se calcula más
// abajo) — se usa una ref en vez de la variable directa para no reordenar
// todo el archivo solo para que useGuiaVoiceMode pueda leer el paso
// actual. Se mantiene al día con el efecto de más abajo.
const stepRef = useRef<TourStep | undefined>(undefined);

// Vuelve a reproducir el paso actual tras usar "Hablar con GUÍA". Antes
// de la narración real, dice una frase corta de transición (al azar,
// del banco de useGuiaVoiceMode) — pasa por el mismo mecanismo de
// caché+reproducción (ensureAudioForStep + el mismo player), y se espera
// a que termine por completo antes de seguir, para que no suenen pisadas.
//
// resumeCachedAudioFromLastPosition retoma desde donde se había quedado
// (guardado por stopCurrentAudio), a diferencia de playCachedAudio (que
// sigue arrancando siempre desde 0, correcto para cuando se avanza a un
// paso nuevo — esa función no se toca).
const resumeNarration = useCallback(async () => {
  const currentStep = stepRef.current;
  if (!currentStep) return;

  const transitionPhrase =
    GUIA_TRANSITION_PHRASES[
      Math.floor(Math.random() * GUIA_TRANSITION_PHRASES.length)
    ];
  await ensureAudioForStep(GUIA_TRANSITION_AUDIO_STEP_ID, transitionPhrase);
  await playCachedAudioAndWait(GUIA_TRANSITION_AUDIO_STEP_ID, transitionPhrase);

  // withTimestamps: true — es narración real, no la frase de transición
  // de arriba (que se queda con el camino de siempre, sin este parámetro).
  await ensureAudioForStep(currentStep.id, currentStep.voiceText, true);
  await resumeCachedAudioFromLastPosition(currentStep.id, currentStep.voiceText);
}, [ensureAudioForStep, playCachedAudioAndWait, resumeCachedAudioFromLastPosition]);

// stopCurrentAudio acepta el paso actual como parámetro opcional para
// redondear la posición guardada hacia atrás, hasta el inicio de la
// oración (real, si hay alignment, o estimado si no) — pero askGuia() la
// llama sin argumentos (su firma sigue siendo () => Promise<void> para no
// romper nada). Este wrapper le inyecta el paso actual automáticamente,
// así el redondeo sí aplica cuando se interrumpe la narración para
// "Hablar con GUÍA".
const stopCurrentAudioForGuia = useCallback(async () => {
  const currentStep = stepRef.current;
  await stopCurrentAudio(
    currentStep
      ? { stepId: currentStep.id, voiceText: currentStep.voiceText }
      : undefined
  );
}, [stopCurrentAudio]);

// Modo de voz de GUÍA: se activa al escuchar la palabra clave.
const {
  status: guiaVoiceStatus,
  askGuia,
  transcribeSpokenText,
  resetConversation,
  getHistory,
  pushToHistory,
} = useGuiaVoiceMode({
  stopCurrentAudio: stopCurrentAudioForGuia,
  playAudioChunk: playAudioBase64,
  resumeNarration,
});

// El ícono de micrófono del chat: dicta y muestra el texto transcrito en
// el campo, sin enviarlo solo — el usuario decide si lo manda o lo edita.
const handleDictate = useCallback(async () => {
  const text = await transcribeSpokenText();
  if (text.trim()) {
    setInput(text);
  }
}, [transcribeSpokenText]);

const isDictating =
  guiaVoiceStatus === "listening" || guiaVoiceStatus === "thinking";

const { userLocation, locationPermissionGranted } = useTourLocation()


const tour = useMemo(()=>getTourById(tourId),[tourId])

const [loadingTour, setLoadingTour] = useState(true);
const [readyStepIds, setReadyStepIds] = useState<string[]>([]);

useEffect(() => {
  const firstStepId = tour?.steps?.[0]?.id
  if (!firstStepId) return

  setCurrentStepId(firstStepId)
  setStartMapViewed(false)
  setShowDecision(false)
  // Un tour nuevo no debe arrastrar el contexto de la charla con GUÍA de
  // un tour anterior (o de una sesión previa, si el componente no llegó
  // a desmontarse).
  resetConversation()
}, [tour?.id, tour?.steps, resetConversation])


useEffect(() => {
  if (!tour) return;

  let mounted = true;
  const startTime = Date.now();

  const init = async () => {
    const allSteps = tour.steps.map((step) => ({
      id: step.id,
      text: step.voiceText,
    }));

    await preloadStepsAudio(allSteps, (stepId) => {
      setReadyStepIds((prev) => [...prev, stepId])
    });

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 2800 - elapsed);

    setTimeout(() => {
      if (mounted) {
        setLoadingTour(false);
      }
    }, remaining);
  };

  init();

  return () => {
    mounted = false;
  };
}, [tour, preloadStepsAudio]);





const [showDecision, setShowDecision] = useState(false)
const thinkingAnim = useRef(new Animated.Value(0)).current
const [showChat, setShowChat] = useState(false)


const [startMapViewed, setStartMapViewed] = useState(false)
const [currentStepId, setCurrentStepId] = useState("")










const step: TourStep | undefined = useMemo(() => {
  return tour?.steps.find((s) => s.id === currentStepId)
}, [tour, currentStepId])

useEffect(() => {
  stepRef.current = step
}, [step])

// Dispara el modo de voz de GUÍA. Hoy lo llama solo el botón manual
// "Hablar con GUÍA" (onAskGuia en TourNarrationBlock); antes también lo
// disparaba la palabra clave por micrófono (useWakeWord + Picovoice),
// que se quitó por ser código nunca terminado de conectar.
const handleWakeWordDetected = useCallback(() => {
  askGuia({
    context: step?.title,
    summary: step?.summary,
    highlights: step?.highlights,
    tourTitle: tour?.title,
  })
}, [askGuia, step, tour])

const stepIndex = tour?.steps.findIndex((s) => s.id === step?.id) ?? 0
const totalSteps = tour?.steps.length ?? 0

const startRoute = step?.startRoute
const isGuidedStart = !!startRoute

const actionCardData = step?.actionCard
const showActionCard = !!actionCardData

const hasChoices = !!step?.choices?.length

const primaryButtonLabel =
  isGuidedStart && startRoute
    ? (startMapViewed ? "Empezar recorrido" : startRoute.buttonLabel)
    : "Siguiente"

   

const { previewDestination, previewInfoText } = useMemo(
  () =>
    getTourPreviewData({
      steps: tour?.steps,
      step,
      isGuidedStart,
      startRoute,
    }),
  [tour?.steps, step, isGuidedStart, startRoute]
)







    

const { mapLatitude, mapLongitude, mapLatitudeDelta, mapLongitudeDelta } = useMemo(
  () =>
    getTourMapRegion({
      userLocation,
      previewDestination,
    }),
  [userLocation, previewDestination]
)

const { openStartRoute, openPreviewRoute } = useTourRouteActions({
  startRoute,
  previewDestination,
  isGuidedStart,
  onStartMapViewed: () => setStartMapViewed(true),
})



const handleBack = () => {
  router.back()
}

const handleOpenChat = () => {
  setShowChat(true)
}

const handleCloseChat = () => {
  setShowChat(false)
}

const handleCloseDecision = () => {
  setShowDecision(false)
}



const handleSelectChoice = (nextId: string) => {
  setShowDecision(false)
  setCurrentStepId(getChoiceNextStepId(nextId))
}

const goNext = () => {
  const action = getTourNextAction({
    isGuidedStart,
    startMapViewed,
    startRouteNextStepId: startRoute?.nextStepId,
    hasChoices,
    stepNextId: step?.nextId,
  })

  if (action.type === "openStartRoute") {
    openStartRoute()
    return
  }

  if (action.type === "openDecision") {
    setShowDecision(true)
    return
  }

  if (action.type === "advance") {
    setCurrentStepId(action.nextStepId)
    return
  }
}

// Evita disparar goNext() más de una vez para el mismo paso mientras el
// usuario se queda dentro del radio de llegada.
const hasAutoAdvancedRef = useRef(false)

useEffect(() => {
  hasAutoAdvancedRef.current = false
}, [currentStepId])

// Detección automática de llegada por GPS: solo mientras la app está en
// primer plano (useTourLocation deja de actualizar userLocation si no).
// Solo avanza sola cuando la acción correspondiente es "advance" — si
// haría falta abrir una app externa (openStartRoute) o mostrar una
// decisión (openDecision), se deja que el usuario toque el botón.
useEffect(() => {
  if (!userLocation || !previewDestination) return
  if (hasAutoAdvancedRef.current) return

  const distance = getDistanceInMeters(userLocation, previewDestination)
  if (distance >= ARRIVAL_RADIUS_METERS) return

  const action = getTourNextAction({
    isGuidedStart,
    startMapViewed,
    startRouteNextStepId: startRoute?.nextStepId,
    hasChoices,
    stepNextId: step?.nextId,
  })

  if (action.type !== "advance") return

  hasAutoAdvancedRef.current = true
  goNext()
}, [
  userLocation,
  previewDestination,
  isGuidedStart,
  startMapViewed,
  startRoute,
  hasChoices,
  step,
])

// messageOverride: para las sugerencias del estado vacío del chat, que
// llenan Y envían en el mismo toque (ver onSuggestionPress más abajo) —
// sin esto, tendrían que hacer setInput(text) y llamar a sendMessage()
// por separado, pero como `input` recién se actualiza en el próximo
// render, sendMessage() leería el valor viejo (closure obsoleto) en vez
// del texto de la sugerencia. Sin messageOverride, se comporta exactamente
// igual que antes: usa `input`.
const sendMessage = async (messageOverride?: string) => {
  const messageText = (messageOverride ?? input).trim()
  if (!messageText) return

  const userMessage: ChatMessage = {
    id: createMessageId(),
    role: "user",
    text: messageText
  }

  setMessages(prev => [...prev, userMessage])
  setInput("")
  setIsThinking(true)

  // Mismo historial compartido que usa askGuia (modo voz) — así, si el
  // usuario escribe algo y después pregunta por voz (o viceversa), GUÍA
  // recuerda ambos. El historial que se manda es el de ANTES de este
  // mensaje; el mensaje en sí ya viaja aparte, en `message`.
  const historyForRequest = getHistory()
  pushToHistory({ role: "user", content: userMessage.text })

  try {
    const text = await sendTourChatMessage({
      message: userMessage.text,
      context: step?.title,
      summary: step?.summary,
      highlights: step?.highlights,
      tourTitle: tour?.title,
      history: historyForRequest,
    })

    pushToHistory({ role: "assistant", content: text })

    const assistantMessage: ChatMessage = {
      id: createMessageId(),
      role: "assistant",
      text,
    }

    setMessages(prev => [...prev, assistantMessage])
  } catch {

    setMessages(prev => [
      ...prev,
      {
        id: createMessageId(),
        role: "assistant",
        text: "Tuve un problema al responder. Intenta otra vez."
      }
    ])
  }

  setIsThinking(false)
}

useEffect(() => {
  if (!isThinking) return

  const anim = Animated.loop(
    Animated.sequence([
      Animated.timing(thinkingAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.timing(thinkingAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      })
    ])
  )

  anim.start()

  return () => {
    anim.stop()
  }
}, [isThinking, thinkingAnim])


useEffect(() => {
  if (!step || loadingTour) return;

  let cancelled = false;

  const run = async () => {
    const textToSpeak = step.voiceText;

    await stopCurrentAudio();

    if (cancelled) return;

    // withTimestamps: true — narración real, para que el alignment esté
    // listo si más tarde se interrumpe este paso con "Hablar con GUÍA".
    await ensureAudioForStep(step.id, textToSpeak, true);

    if (cancelled) return;

    // El globo ya no se arma a mano acá — useTourAudio lo mueve solo,
    // en tiempo real, con el volumen real del audio mientras suena.
    await playCachedAudio(step.id, textToSpeak);
  };

  pulseAnim.setValue(1);

  run();

  return () => {
    cancelled = true;
  };
}, [step, loadingTour, ensureAudioForStep, playCachedAudio, stopCurrentAudio, pulseAnim]);

// prueba
// probando wakatime es una pruba ojalá esto me aca poder dejar de procasrtinart, la idea es que leo no me deje ir baojo ninguna condición, de veras, quiero ser una persona que logre sus objetivos, me estoy amarrando al mastil asi como odiseo, detyesto las sirenas y quiero ver a  mi familia muy muy feliz


useEffect(() => {
  if (!step || !tour) return;

  const currentIndex = tour.steps.findIndex((s) => s.id === step.id);

  const nextSteps = tour.steps.slice(currentIndex + 1, currentIndex + 5).map((s) => ({
    id: s.id,
    text: s.voiceText,
  }));

  preloadStepsAudio(nextSteps);
}, [step, tour, preloadStepsAudio]);

useEffect(()=>{

if(showDecision){

decisionAnim.setValue(0)

Animated.spring(decisionAnim,{
toValue:1,
useNativeDriver:true,
speed:12,
bounciness:6
}).start()

}

},[showDecision, decisionAnim])



if (loadingTour) {
  return (
    <TourLoadingScreen
      tourTitle={tour?.title ?? ""}
      steps={tour?.steps.map((s) => ({ id: s.id, title: s.title })) ?? []}
      readyStepIds={readyStepIds}
    />
  );
}

if (!step) {
  return <TourNotFoundState />;
}



return(

<LinearGradient
  colors={TOUR_GRADIENT_COLORS}
  start={{x:0,y:0}}
  end={{x:1,y:1}}
  style={styles.container}
>

<SafeAreaView style={styles.safe}>

<View style={[styles.content,{paddingBottom:insets.bottom + 40}]}>





<TourHeader
  title={step.title}
  stepIndex={stepIndex}
  totalSteps={totalSteps}
  onBack={handleBack}
  onOpenChat={handleOpenChat}
/>



<View style={styles.flowBlock}>


<TourNarrationBlock
  pulseAnim={pulseAnim}
  voiceEnergy={voiceEnergy}
  guiaVoiceStatus={guiaVoiceStatus}
  onAskGuia={handleWakeWordDetected}
  summary={step.summary}
/>




<TourMediaBlock
  showActionCard={showActionCard}
  actionCardData={actionCardData}
  onOpenPreviewRoute={openPreviewRoute}
  locationPermissionGranted={locationPermissionGranted}
  mapLatitude={mapLatitude}
  mapLongitude={mapLongitude}
  mapLatitudeDelta={mapLatitudeDelta}
  mapLongitudeDelta={mapLongitudeDelta}
  previewDestination={previewDestination}
  previewInfoText={previewInfoText}
/>



  
<TourPrimaryButton
  label={primaryButtonLabel}
  onPress={goNext}
/>



</View>













<TourDecisionModal
  visible={showDecision}
  decisionAnim={decisionAnim}
  choices={step?.choices}
  onSelectChoice={handleSelectChoice}
  onClose={handleCloseDecision}
/>



<TourChatSheet
  visible={showChat}
  insetsTop={insets.top}
  insetsBottom={insets.bottom}
  pulseAnim={pulseAnim}
  thinkingAnim={thinkingAnim}
  stepTitle={step.title}
  input={input}
  messages={messages}
  isThinking={isThinking}
  isDictating={isDictating}
  onClose={handleCloseChat}
  onChangeInput={setInput}
  onSend={() => sendMessage()}
  onSuggestionPress={(text) => sendMessage(text)}
  onMicPress={handleDictate}
/>


</View>

</SafeAreaView>

</LinearGradient>

);
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#E9D5FF",
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 6,
    justifyContent: "flex-start",
  },

  flowBlock: {
    marginTop: 8,
  },

});
