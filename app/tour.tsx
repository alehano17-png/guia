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
import { useGuiaVoiceMode } from "../hooks/useGuiaVoiceMode";
import { useTourAudio } from "../hooks/useTourAudio";
import { useTourLocation } from "../hooks/useTourLocation";
import { useTourRouteActions } from "../hooks/useTourRouteActions";
import { useWakeWord } from "../hooks/useWakeWord";
import { sendTourChatMessage } from "../lib/sendTourChatMessage";


import {
  Animated,
  Easing,
  Keyboard,
  StyleSheet,
  View
} from "react-native";

import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getTourById,
  TourStep
} from "../data/tours/index";

type ChatMessage = {
  role: "user" | "assistant"
  text: string
}

type PulseSegment =
  | { type: "speech"; words: number }
  | { type: "pause"; ms: number };

// Detecta las mismas marcas "(pausa)", "(micro pausa)", "(silencio 3s)" que
// el backend le quita a la voz — acá se usan al revés: para saber DÓNDE
// el globo debe quedarse quieto en vez de pulsar.
function parsePulseSegments(rawText: string): PulseSegment[] {
  const PAUSE_MARK = /\(\s*(micro\s*pausa|pausa|silencio\s*\d*s?)\s*\)/gi;

  const marks: { index: number; length: number; ms: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = PAUSE_MARK.exec(rawText)) !== null) {
    const label = match[1].toLowerCase();
    let ms = 500;
    if (label.includes("micro")) ms = 250;
    const secMatch = label.match(/(\d+)\s*s/);
    if (secMatch) ms = parseInt(secMatch[1], 10) * 1000;
    marks.push({ index: match.index, length: match[0].length, ms });
  }

  const segments: PulseSegment[] = [];
  let cursor = 0;

  for (const mark of marks) {
    const chunk = rawText.slice(cursor, mark.index).trim();
    if (chunk) {
      const words = chunk.split(/\s+/).filter(Boolean).length;
      if (words > 0) segments.push({ type: "speech", words });
    }
    segments.push({ type: "pause", ms: mark.ms });
    cursor = mark.index + mark.length;
  }

  const rest = rawText.slice(cursor).trim();
  if (rest) {
    const words = rest.split(/\s+/).filter(Boolean).length;
    if (words > 0) segments.push({ type: "speech", words });
  }

  return segments;
}

const MS_PER_WORD = 380; // ritmo aproximado de habla natural en español
const PULSE_CYCLE_MS = 700; // duración de un ciclo de "inhala-exhala"

// Construye la secuencia de pulsos del globo a partir del texto: pulsa
// mientras "habla", se queda quieto donde hay una pausa marcada.
function buildPulseSequence(
  pulseAnim: Animated.Value,
  text: string,
  actualDurationMs?: number | null
): Animated.CompositeAnimation {
  const segments = parsePulseSegments(text);

  const rawDurations = segments.map((seg) =>
    seg.type === "pause" ? seg.ms : Math.max(seg.words * MS_PER_WORD, 300)
  );
  const estimatedTotal = rawDurations.reduce((a, b) => a + b, 0);

  // Si tenemos la duración real del audio, reescalamos todo para que el
  // pulso termine exactamente cuando termina de sonar — sin importar si
  // MS_PER_WORD estaba bien calculado o no.
  const scale =
    actualDurationMs && estimatedTotal > 0
      ? actualDurationMs / estimatedTotal
      : 1;

  const steps: Animated.CompositeAnimation[] = [];

  segments.forEach((seg, i) => {
    const segMs = Math.max(
      rawDurations[i] * scale,
      seg.type === "pause" ? 100 : 200
    );

    if (seg.type === "pause") {
      steps.push(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: Math.min(segMs, 400),
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );
      if (segMs > 400) {
        steps.push(Animated.delay(segMs - 400));
      }
    } else {
      let remaining = segMs;
      let up = true;
      while (remaining > 0) {
        const cycleMs = Math.min(PULSE_CYCLE_MS, remaining);
        steps.push(
          Animated.timing(pulseAnim, {
            toValue: up ? 1.22 : 1.05,
            duration: cycleMs,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        );
        remaining -= cycleMs;
        up = !up;
      }
    }
  });

  return Animated.sequence(steps);
}

export default function TourScreen() {
  const params = useLocalSearchParams<{ tourId?: string }>()
  const tourId =
    typeof params.tourId === "string" ? params.tourId : "miraflores-completo"

  return <TourScreenContent key={tourId} tourId={tourId} />
}

function TourScreenContent({ tourId }: { tourId: string }) {

const [keyboardOpen, setKeyboardOpen] = useState(false);

useEffect(() => {
  const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardOpen(true));
  const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardOpen(false));

  return () => {
    show.remove();
    hide.remove();
  };
}, []);

const cardHeightAnim = useRef(new Animated.Value(1)).current

useEffect(() => {
  Animated.timing(cardHeightAnim, {
    toValue: keyboardOpen ? 0 : 1,
    duration: 250,
    useNativeDriver: false
  }).start();
}, [keyboardOpen, cardHeightAnim]);




const insets = useSafeAreaInsets()

const pulseAnim = useRef(new Animated.Value(1)).current

const [messages, setMessages] = useState<ChatMessage[]>([])

const [isThinking, setIsThinking] = useState(false)

const [input, setInput] = useState("")





const decisionAnim = useRef(new Animated.Value(0)).current
const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null)

const {
  ensureAudioForStep,
  playCachedAudio,
  preloadStepsAudio,
  stopCurrentAudio,
  speakChatReply,
} = useTourAudio();

// Modo de voz de GUÍA: se activa al escuchar la palabra clave.
const { status: guiaVoiceStatus, askGuia } = useGuiaVoiceMode({
  stopCurrentAudio,
  speakChatReply,
});

const { userLocation, locationPermissionGranted } = useTourLocation()


const tour = useMemo(()=>getTourById(tourId),[tourId])

const [loadingTour, setLoadingTour] = useState(true);

useEffect(() => {
  const firstStepId = tour?.steps?.[0]?.id
  if (!firstStepId) return

  setCurrentStepId(firstStepId)
  setStartMapViewed(false)
  setShowDecision(false)
}, [tour?.id, tour?.steps])


useEffect(() => {
  if (!tour) return;

  const init = async () => {
    const allSteps = tour.steps.map((step) => ({
      id: step.id,
      text: step.voiceText,
    }));

    await preloadStepsAudio(allSteps);

    setLoadingTour(false);
  };

  init();
}, [tour, preloadStepsAudio]);





const [showDecision, setShowDecision] = useState(false)
const thinkingAnim = useRef(new Animated.Value(0)).current
const [showChat, setShowChat] = useState(false)


const [startMapViewed, setStartMapViewed] = useState(false)
const [currentStepId, setCurrentStepId] = useState("")










const step: TourStep | undefined = useMemo(() => {
  return tour?.steps.find((s) => s.id === currentStepId)
}, [tour, currentStepId])

const handleWakeWordDetected = useCallback(() => {
  askGuia({
    context: step?.title,
    summary: step?.summary,
    highlights: step?.highlights,
    tourTitle: tour?.title,
  })
}, [askGuia, step, tour])

// Escucha "GUÍA" solo mientras hay un tour cargado y no se está ya
// procesando una pregunta anterior.
useWakeWord({
  onDetected: handleWakeWordDetected,
  enabled: !loadingTour && !!step && guiaVoiceStatus === "idle",
})

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

const sendMessage = async () => {
  if (!input.trim()) return

  const userMessage: ChatMessage = {
    role: "user",
    text: input
  }

  setMessages(prev => [...prev, userMessage])
  setInput("")
  setIsThinking(true)

  try {
    const text = await sendTourChatMessage({
      message: userMessage.text,
      context: step?.title,
      summary: step?.summary,
      highlights: step?.highlights,
      tourTitle: tour?.title,
    })

    const assistantMessage: ChatMessage = {
      role: "assistant",
      text,
    }

    setMessages(prev => [...prev, assistantMessage])
  } catch {

    setMessages(prev => [
      ...prev,
      {
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

    await ensureAudioForStep(step.id, textToSpeak);

  

   const durationMs = await playCachedAudio(step.id, textToSpeak);

    if (cancelled) return;

    // Recién acá arranca el pulso — justo cuando el audio empieza a sonar,
    // ajustado a la duración real para que termine exacto con la voz.
    pulseLoopRef.current = buildPulseSequence(pulseAnim, textToSpeak, durationMs);
    pulseLoopRef.current.start();
  };

 pulseLoopRef.current?.stop();
  pulseAnim.setValue(1);

  run();

  return () => {
    cancelled = true;
    pulseLoopRef.current?.stop();
  };
}, [step, loadingTour, ensureAudioForStep, playCachedAudio, stopCurrentAudio, pulseAnim]);

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
  return <TourLoadingScreen />;
}

if (!step) {
  return <TourNotFoundState />;
}



return(

<LinearGradient
  colors={["#F3E8FF", "#D8B4FE", "#A78BFA"]}
  start={{x:0,y:0}}
  end={{x:0,y:1}}
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
  keyboardOpen={keyboardOpen}
  cardHeightAnim={cardHeightAnim}
  pulseAnim={pulseAnim}
  thinkingAnim={thinkingAnim}
  stepTitle={step.title}
  input={input}
  messages={messages}
  isThinking={isThinking}
  onClose={handleCloseChat}
  onChangeInput={setInput}
  onSend={sendMessage}
  onSuggestionPress={setInput}
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
