// app/tour.tsx

import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useTourAudio } from "../hooks/useTourAudio";
import { useTourLocation } from "../hooks/useTourLocation";
import { useTourRouteActions } from "../hooks/useTourRouteActions";
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
} = useTourAudio();

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
  const firstSteps = tour.steps.slice(0, 3).map((step) => ({
    id: step.id,
    text: step.voiceText,
  }));

  await preloadStepsAudio(firstSteps);

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
  if (!step) return;

  let cancelled = false;

  const run = async () => {
    const textToSpeak = step.voiceText;

    await stopCurrentAudio();

    if (cancelled) return;

    await ensureAudioForStep(step.id, textToSpeak);

  

    await playCachedAudio(step.id, textToSpeak);
  };

  run();

  pulseLoopRef.current?.stop();

  pulseAnim.setValue(1);

  pulseLoopRef.current = Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.25,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );

  pulseLoopRef.current.start();

  return () => {
    cancelled = true;
    pulseLoopRef.current?.stop();
  };
}, [step, ensureAudioForStep, playCachedAudio, stopCurrentAudio, pulseAnim]);

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
