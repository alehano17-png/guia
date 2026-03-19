// app/tour.tsx

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getTourById,
  getTransitionFromStep,
  TourStep
} from "./data/tours";

type ChatMessage = {
  role: "user" | "assistant"
  text: string
}

export default function TourScreen(){

const [keyboardOpen, setKeyboardOpen] = useState(false);

useEffect(() => {
  const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardOpen(true));
  const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardOpen(false));

  return () => {
    show.remove();
    hide.remove();
  };
}, []);

useEffect(() => {
  Animated.timing(cardHeightAnim, {
    toValue: keyboardOpen ? 0 : 1,
    duration: 250,
    useNativeDriver: false
  }).start();
}, [keyboardOpen]);

const insets = useSafeAreaInsets()

const pulseAnim = useRef(new Animated.Value(1)).current

const [messages, setMessages] = useState<ChatMessage[]>([])

const [isThinking, setIsThinking] = useState(false)

const [input, setInput] = useState("")

const decisionAnim = useRef(new Animated.Value(0)).current
const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null)

const params = useLocalSearchParams<{tourId?:string}>()

const tourId = params.tourId ?? "miraflores-completo"

const tour = useMemo(()=>getTourById(tourId),[tourId])

const [currentStepId,setCurrentStepId] = useState(tour?.steps[0]?.id ?? "")

const [showDecision,setShowDecision] = useState(false)

const thinkingAnim = useRef(new Animated.Value(0)).current

const [decisionHandled,setDecisionHandled] = useState(false)

const cardHeightAnim = useRef(new Animated.Value(1)).current;

const [showChat,setShowChat] = useState(false)

const [showMap,setShowMap] = useState(false)

const scrollRef = useRef<ScrollView>(null)

const step:TourStep | undefined = useMemo(()=>{
return tour?.steps.find(s=>s.id===currentStepId)
},[tour,currentStepId])

const stepIndex = tour?.steps.findIndex(s=>s.id===step?.id) ?? 0
const totalSteps = tour?.steps.length ?? 0

const sendMessage = async ()=>{

if(!input.trim()) return

const userMessage: ChatMessage = {
role:"user",
text:input
}

setMessages(prev=>[...prev,userMessage])
setInput("")
setIsThinking(true)

setTimeout(()=>{

const assistantMessage: ChatMessage = {
role:"assistant",
text:"Estoy pensando cómo responderte sobre este lugar."
}

setMessages(prev=>[
...prev,
assistantMessage
])

setIsThinking(false)

},700)

}

const transition = useMemo(()=>{
if(!step) return undefined
return getTransitionFromStep(step.id)
},[step])

useEffect(()=>{

if(!isThinking) return

Animated.loop(
Animated.sequence([
Animated.timing(thinkingAnim,{
toValue:1,
duration:400,
useNativeDriver:true
}),
Animated.timing(thinkingAnim,{
toValue:0,
duration:400,
useNativeDriver:true
})
])
).start()

},[isThinking])

useEffect(()=>{

if(!step) return

Speech.stop()

let textToSpeak = step.voiceText

if(transition){
textToSpeak = transition.voiceIntro
}

pulseLoopRef.current?.stop()

pulseAnim.setValue(1)

pulseLoopRef.current = Animated.loop(
Animated.sequence([
Animated.timing(pulseAnim,{
toValue:1.25,
duration:800,
easing:Easing.inOut(Easing.ease),
useNativeDriver:true
}),
Animated.timing(pulseAnim,{
toValue:1,
duration:800,
easing:Easing.inOut(Easing.ease),
useNativeDriver:true
})
])
)

pulseLoopRef.current.start()

Speech.speak(textToSpeak,{
language:"es-PE",
rate:0.95,
onDone: () => {

if(!decisionHandled){

if(step?.choices?.length){
setShowDecision(true)
return
}

if(transition?.options?.length){
setShowDecision(true)
return
}

}

setDecisionHandled(false)

}
})


return ()=>{
Speech.stop()
pulseLoopRef.current?.stop()
}

},[step, decisionHandled])

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

},[showDecision])

if(!step){

return(
<SafeAreaView style={styles.safe}>
<Text>No se encontró el tour</Text>
</SafeAreaView>
)

}

const goNext = ()=>{

if(step?.choices?.length){
setDecisionHandled(true)
setShowDecision(true)
return
}

if(transition?.options?.length){
setDecisionHandled(true)
setShowDecision(true)
return
}

if(step?.nextId){
setShowDecision(false)
setDecisionHandled(false)
setCurrentStepId(step.nextId)
}

}

return(

<LinearGradient
  colors={["#F3E8FF", "#D8B4FE", "#A78BFA"]}
  start={{x:0,y:0}}
  end={{x:0,y:1}}
  style={styles.container}
>

<SafeAreaView style={styles.safe}>

<View style={[styles.content,{paddingBottom:insets.bottom + 20}]}>

{/* HEADER */}

<View>

<View style={styles.metaRow}>

<View style={{flexDirection:"row",alignItems:"center",gap:8}}>
<View style={styles.liveDot}/>
<Text style={styles.liveText}>
Narrando · Paso {stepIndex+1} de {totalSteps}
</Text>
</View>

<Pressable
style={styles.chatButton}
onPress={()=>setShowChat(true)}
>
<View style={styles.chatIconCircle}>
<Ionicons name="chatbubble" size={18} color="#FFF"/>
</View>
</Pressable>

</View>

<Text style={styles.stepTitle} numberOfLines={1} adjustsFontSizeToFit>
{step.title}
</Text>

</View>

{/* CENTRO */}

<View style={styles.centerBlock}>

<View style={styles.voiceContainer}>
<View style={styles.voiceOuter}>

<Animated.View
style={[
styles.voiceHalo,
{ transform:[{ scale:pulseAnim }] }
]}
/>

<Animated.View
style={[
styles.voiceInner,
{transform:[{scale:pulseAnim}]}
]}
/>

<View style={styles.voiceInnerGlow}/>
<View style={styles.voiceGlass}/>

</View>
</View>

<Text style={styles.summaryText}>
{step.summary ?? " "}
</Text>

<View style={styles.askPill}>
<Text style={styles.askTip}>
Di "GUÍA" para hacer una pregunta.
</Text>
</View>

</View>

{/* MAPA */}

<View>

<Pressable onPress={()=>setShowMap(true)} style={styles.mapCard}>
<MapView
  mapType="standard"
  userInterfaceStyle="light"
  style={{ flex: 1, borderRadius: 16 }}
  region={{
    latitude: step?.latitude ?? -12.1211,
    longitude: step?.longitude ?? -77.0305,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }}
>
<Marker
coordinate={{
latitude: step?.latitude ?? -12.1211,
longitude: step?.longitude ?? -77.0305,
}}
title={step.title}
/>
</MapView>
</Pressable>

<View style={styles.separator}/>

</View>

{/* BOTONES */}

<View style={styles.buttons}>

<Pressable
style={styles.primaryButton}
onPress={goNext}
>
<Text style={styles.primaryButtonText}>
Siguiente
</Text>
</Pressable>

<Pressable
style={styles.secondaryButton}
onPress={()=>router.back()}
>
<Text style={styles.secondaryButtonText}>
Salir
</Text>
</Pressable>

</View>

{/* CHAT */}

{showMap && (

<View style={styles.fullMapOverlay}>

<MapView
style={styles.fullMap}
region={{
latitude: step?.latitude ?? -12.1211,
longitude: step?.longitude ?? -77.0305,
latitudeDelta: 0.01,
longitudeDelta: 0.01,
}}
>

<Marker
coordinate={{
latitude: step?.latitude ?? -12.1211,
longitude: step?.longitude ?? -77.0305,
}}
title={step.title}
/>

</MapView>

<Pressable
style={styles.closeMapButton}
onPress={()=>setShowMap(false)}
>

<Text style={styles.closeMapText}>
Cerrar mapa
</Text>

</Pressable>

</View>

)}





{showDecision && (

<BlurView
intensity={60}
tint="light"
style={styles.decisionOverlay}
>

<Animated.View
style={[
styles.decisionCard,
{
transform:[
{
scale: decisionAnim.interpolate({
inputRange:[0,1],
outputRange:[0.92,1]
})
}
],
opacity: decisionAnim
}
]}
>

<Text style={styles.decisionTitle}>
¿Cómo prefieres continuar?
</Text>

{transition?.options?.map((option) => {

let iconName:any = "walk"

if(option.id === "walk") iconName = "walk"
if(option.id === "public") iconName = "bus"
if(option.id === "taxi") iconName = "car"

let subtitle = ""

if(option.id === "walk") subtitle = "Modo caminando"
if(option.id === "public") subtitle = "Modo transporte público"
if(option.id === "taxi") subtitle = "Modo taxi"

return (
<Pressable
key={option.id}
style={styles.decisionOption}
onPress={()=>{
setShowDecision(false)
setDecisionHandled(true)

if(option.id === "walk"){
setCurrentStepId("traslado-larcomar-huaca-caminando")
}

if(option.id === "taxi"){
setCurrentStepId("traslado-larcomar-huaca-taxi")
}

if(option.id === "public"){
setCurrentStepId("traslado-larcomar-huaca-bus")
}

}}
>

<View style={styles.decisionOptionRow}>

<View style={styles.decisionIconCircle}>
<Ionicons name={iconName} size={20} color="#FFF"/>
</View>

<View style={styles.decisionOptionTexts}>
<Text style={styles.decisionOptionTitle}>
{option.label}
</Text>
<Text style={styles.decisionOptionSubtitle}>
{subtitle}
</Text>
</View>

</View>

</Pressable>
)

})}

{step?.choices?.map((choice) => {

  let iconName: any = "location"
  let subtitle = ""

  if (choice.label.includes("Faro")) {
    iconName = "navigate"
    subtitle = "Inicio recomendado"
  }

  if (choice.label.includes("Villena")) {
    iconName = "map"
    subtitle = "Inicio alternativo"
  }

  return (
    <Pressable
      key={choice.nextId}
      style={styles.decisionOption}
      onPress={()=>{
        setShowDecision(false)
        setDecisionHandled(true)
        setCurrentStepId(choice.nextId)
      }}
    >

      <View style={styles.decisionOptionRow}>

        <View style={styles.decisionIconCircle}>
          <Ionicons name={iconName} size={20} color="#FFF"/>
        </View>

        <View style={styles.decisionOptionTexts}>
          <Text style={styles.decisionOptionTitle}>
            {choice.label}
          </Text>

          <Text style={styles.decisionOptionSubtitle}>
            {subtitle}
          </Text>
        </View>

      </View>

    </Pressable>
  )

})}


<View style={styles.decisionDivider}/>

<Text style={styles.decisionVoiceHint}>
También puedes decir: “GUÍA, a pie”
</Text>

<Pressable
style={styles.decisionCancel}
onPress={()=>setShowDecision(false)}
>
<Text>Cancelar</Text>
</Pressable>

</Animated.View>

</BlurView>

)}



</View>


{showChat && (

<KeyboardAvoidingView
style={styles.chatSheet}
behavior={Platform.OS === "ios" ? "padding" : undefined}
keyboardVerticalOffset={0}
>
<View style={[styles.chatOverlay, { paddingTop: insets.top }]}>
<View style={styles.chatHeader}>

<Pressable onPress={()=>setShowChat(false)}>
<Text style={styles.chatClose}>Cerrar</Text>
</Pressable>

<Text style={styles.chatTitle}>GUÍA</Text>

<View style={{width:40}}/>

</View>

<Animated.View
style={[
styles.chatCard,
{
height: cardHeightAnim.interpolate({
inputRange:[0,1],
outputRange:[0,300]
}),
opacity: cardHeightAnim.interpolate({
inputRange:[0,1],
outputRange:[0,1]
}),
transform:[
{
translateY: cardHeightAnim.interpolate({
inputRange:[0,1],
outputRange:[-30,0]
})
}
],
overflow:"hidden"
}
]}
>
    <View style={styles.chatCardRow}>
      <View style={styles.chatVoiceMini}>
        <Animated.View
          style={[
            styles.chatVoicePulse,
            { transform: [{ scale: pulseAnim }] }
          ]}
        />
        <View style={styles.chatVoiceCore}/>
      </View>

      <View style={{flex:1}}>
        <Text style={styles.chatCardLabel}>
          Estoy narrando el punto:
        </Text>

        <Text style={styles.chatCardTitle}>
          {step.title}
        </Text>

        <Text style={styles.chatCardText}>
          Puedes preguntarme algo sobre este lugar o sobre cualquier parte del tour.
        </Text>

        <View style={styles.placeImageFrame}>
          <Text style={styles.placeImagePlaceholder}>
            Imagen del lugar
          </Text>
        </View>
      </View>
</View>
</Animated.View>

<Animated.ScrollView
ref={scrollRef}
style={[
styles.chatMessages,
{
marginTop: cardHeightAnim.interpolate({
inputRange:[0,1],
outputRange:[-40,0]
})
}
]}
contentContainerStyle={{ paddingBottom: 20 }}
keyboardDismissMode="on-drag"
keyboardShouldPersistTaps="handled"
onContentSizeChange={() =>
scrollRef.current?.scrollToEnd({ animated: true })
}
>

{messages.length === 0 && (
  <View style={styles.emptyState}>
    <Text style={styles.emptyTitle}>¿En qué te ayudo?</Text>

    <Pressable
      style={styles.suggestionChip}
      onPress={() => setInput("¿Qué historia tiene este lugar?")}
    >
      <Text style={styles.suggestionText}>¿Qué historia tiene este lugar?</Text>
    </Pressable>

    <Pressable
      style={styles.suggestionChip}
      onPress={() => setInput("¿Qué debería ver cerca de aquí?")}
    >
      <Text style={styles.suggestionText}>¿Qué debería ver cerca de aquí?</Text>
    </Pressable>

    <Pressable
      style={styles.suggestionChip}
      onPress={() => setInput("¿Cuánto tiempo toma este tour?")}
    >
      <Text style={styles.suggestionText}>¿Cuánto tiempo toma este tour?</Text>
    </Pressable>
  </View>
)}

{messages.map((m,i)=>{

const isUser = m.role === "user"

return(

<View
key={i}
style={isUser ? styles.chatBubbleUserWrapper : styles.chatBubbleGuideWrapper}
>

<View
style={isUser ? styles.chatBubbleUser : styles.chatBubbleGuide}
>
<Text>{m.text}</Text>
</View>

<View
style={isUser ? styles.chatTailUser : styles.chatTailGuide}
/>

</View>

)

})}

{isThinking && (
<View style={styles.chatBubbleGuideWrapper}>
<View style={styles.chatBubbleGuide}>

<View style={{flexDirection:"row",gap:6}}>

<Animated.View
style={[
styles.thinkingDot,
{
opacity: thinkingAnim
}
]}
/>

<Animated.View
style={[
styles.thinkingDot,
{
opacity: thinkingAnim.interpolate({
inputRange:[0,1],
outputRange:[0.3,1]
})
}
]}
/>

<Animated.View
style={[
styles.thinkingDot,
{
opacity: thinkingAnim.interpolate({
inputRange:[0,1],
outputRange:[0.1,1]
})
}
]}
/>

</View>

</View>
</View>
)}

</Animated.ScrollView>

<View style={[
styles.chatInputContainer,
{ paddingBottom: keyboardOpen ? 14 : insets.bottom + 12 }
]}>

<View style={styles.chatInputBar}>

<Ionicons name="mic" size={18} color="#6B7280"/>

<TextInput
placeholder="Haz una pregunta..."
placeholderTextColor="#9CA3AF"
style={styles.chatInput}
value={input}
onChangeText={setInput}
/>

<Pressable onPress={sendMessage}>
<Ionicons name="send" size={18} color="#7C8DF5"/>
</Pressable>

</View>

</View>

</View>
</KeyboardAvoidingView>

)}


</SafeAreaView>

</LinearGradient>

);
}



const styles = StyleSheet.create({

safe:{flex:1},

container:{
flex:1,
backgroundColor: "#E9D5FF"
},

content:{
flex:1,
paddingHorizontal:24,
paddingTop:28,
justifyContent:"space-between"
},

metaRow:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

chatButton:{
padding:2
},


liveDot:{
width:8,
height:8,
borderRadius:4,
backgroundColor:"#1F2937"
},

liveText:{fontSize:13},

stepTitle:{
fontSize:28,
fontWeight:"700",
marginTop:14,
marginBottom:10,
color:"#1F2937",
},

centerBlock:{
alignItems:"center",
gap:18
},

voiceContainer:{
alignItems:"center",
marginTop:9
},

voiceOuter:{
width:160,
height:160,
borderRadius:80,
alignItems:"center",
justifyContent:"center",
backgroundColor:"rgba(255,255,255,0.22)",
shadowColor:"#000",
shadowOpacity:0.05,
shadowRadius:18,
shadowOffset:{width:0,height:10}
},

voiceInner:{
width:120,
height:120,
borderRadius:60,
backgroundColor:"#C5CEF6"
},

voiceInnerGlow:{
position:"absolute",
width:120,
height:120,
borderRadius:60,
backgroundColor:"rgba(255,255,255,0.08)"
},

voiceGlass:{
position:"absolute",
width:160,
height:160,
borderRadius:80,
borderWidth:3,
borderColor:"rgba(255,255,255,0.55)"
},

summaryText:{
textAlign:"center",
fontSize:17,
lineHeight:24,
paddingHorizontal:18
},

askPill:{
alignSelf:"center",
backgroundColor:"rgba(255,255,255,0.35)",
paddingHorizontal:20,
paddingVertical:10,
borderRadius:22
},

askTip:{
fontSize:13,
opacity:.6
},

mapCard:{
height:120,
marginTop:26,
backgroundColor:"#FFFFFF",
borderRadius:22,
padding:8,
shadowColor:"#000",
shadowOpacity:0.08,
shadowRadius:12,
shadowOffset:{width:0,height:6},
elevation:3
},

mapPlaceholder:{
flex:1,
borderRadius:16,
backgroundColor:"#E5E7EB",
alignItems:"center",
justifyContent:"center"
},

mapPlaceholderText:{
opacity:.6
},

separator:{
height:1,
backgroundColor:"rgba(0,0,0,0.08)",
marginVertical:16
},

buttons:{
gap:12
},

primaryButton:{
backgroundColor:"#0F172A",
paddingVertical:20,
borderRadius:30,
alignItems:"center"
},

primaryButtonText:{
color:"#FFF",
fontWeight:"700",
fontSize:16
},

secondaryButton:{
backgroundColor:"rgba(255,255,255,0.55)",
paddingVertical:20,
borderRadius:30,
alignItems:"center",
shadowColor:"#000",
shadowOpacity:0.05,
shadowRadius:6,
shadowOffset:{width:0,height:2}
},

secondaryButtonText:{
color:"#1F2937",
fontWeight:"600",
fontSize:16
},

exitPill:{
alignSelf:"center",
paddingVertical:10
},

exitPillText:{
opacity:.6
},

chatOverlay:{
  flex:1,
  backgroundColor:"#FFF",
  borderTopLeftRadius:28,
  borderTopRightRadius:28,
  flexDirection:"column"
},

chatHeader:{
  flexDirection:"row",
  justifyContent:"space-between",
  paddingHorizontal:20,
  paddingTop:6,
  paddingBottom:6
},

chatTitle:{fontWeight:"800"},

chatClose:{color:"#6B7280"},

chatContent:{
flex:1,
paddingHorizontal:30,
paddingTop:30
},


chatBubbleGuide:{
backgroundColor:"#EEF0FF",
padding:16,
borderRadius:18,
marginBottom:18,
alignSelf:"flex-start",
maxWidth:"78%",
minHeight:36
},

chatBubbleUser:{
alignSelf:"flex-end",
backgroundColor:"#D8DEFF",
padding:16,
borderRadius:18,
marginBottom:18,
maxWidth:"72%"
},

chatInputContainer:{
  paddingHorizontal:20,
  paddingTop:10,
  backgroundColor:"#FFF",
  flexShrink:0
},

lightGlow:{
position:"absolute",
top:120,
left:-40,
right:-40,
height:340,
borderRadius:200,
backgroundColor:"rgba(255,255,255,0.45)",
opacity:0.25
},

voiceHalo:{
position:"absolute",
width:200,
height:200,
borderRadius:100,
backgroundColor:"rgba(167,139,250,0.18)"
},

decisionOverlay:{
  position:"absolute",
  top:0,
  left:0,
  right:0,
  bottom:0,
  backgroundColor:"rgba(0,0,0,0.38)",
  justifyContent:"center",
  alignItems:"center"
},

decisionCard:{
  width:"82%",
  backgroundColor:"rgba(255,255,255,0.8)",
  borderRadius:26,
  padding:22,
  borderWidth:1,
  borderColor:"rgba(255,255,255,0.6)",
  shadowColor:"#000",
 shadowOpacity:0.18,
shadowRadius:30,
shadowOffset:{width:0,height:14}
},

decisionTitle:{
fontSize:20,
fontWeight:"700",
textAlign:"center",
marginBottom:16
},

decisionOption:{
  backgroundColor:"rgba(255,255,255,0.65)",
  padding:20,
  borderRadius:20,
  marginBottom:14
},

decisionOptionTitle:{
fontSize:16,
fontWeight:"500"
},

decisionCancel:{
alignItems:"center",
marginTop:10
},

decisionOptionRow:{
  flexDirection:"row",
  alignItems:"center",
  gap:14
},

decisionIconCircle:{
  width:42,
  height:42,
  borderRadius:21,
  alignItems:"center",
  justifyContent:"center",
  backgroundColor:"#7C8DF5"
},

decisionOptionTexts:{
  flex:1
},

decisionOptionSubtitle:{
  fontSize:13,
  color:"#6B7280",
  marginTop:2
},

decisionVoiceHint:{
  textAlign:"center",
  marginTop:10,
  fontSize:13,
  opacity:0.6
},

decisionDivider:{
  height:1,
  backgroundColor:"rgba(0,0,0,0.08)",
  marginVertical:12
},

chatIconCircle:{
width:42,
height:42,
borderRadius:21,
alignItems:"center",
justifyContent:"center",
backgroundColor:"#7C8DF5"
},

fullMapOverlay:{
position:"absolute",
top:0,
left:0,
right:0,
bottom:0,
backgroundColor:"#000"
},

fullMap:{
flex:1
},

closeMapButton:{
position:"absolute",
top:60,
right:20,
backgroundColor:"rgba(255,255,255,0.9)",
paddingHorizontal:16,
paddingVertical:10,
borderRadius:20
},

closeMapText:{
fontWeight:"600"
},

chatCard:{
backgroundColor:"#F3F4F6",
padding:18,
borderRadius:20,
marginBottom:10
},

chatCardRow:{
flexDirection:"row",
gap:12
},

chatIconCircleSmall:{
width:32,
height:32,
borderRadius:16,
alignItems:"center",
justifyContent:"center",
backgroundColor:"#7C8DF5"
},

chatCardLabel:{
fontSize:14,
opacity:0.7
},

chatCardTitle:{
fontSize:20,
fontWeight:"700",
marginTop:2,
marginBottom:6
},

chatCardText:{
fontSize:14,
lineHeight:20,
opacity:0.8
},

chatInputBar:{
flexDirection:"row",
alignItems:"center",
backgroundColor:"#F3F4F6",
paddingHorizontal:16,
paddingVertical:14,
borderRadius:26,
gap:12,
borderWidth:1,
borderColor:"rgba(0,0,0,0.05)"
},

chatInput:{
flex:1,
fontSize:15,
color:"#1F2937"
},

chatMessages:{
flex:1,
paddingHorizontal:24,
width:"100%",
maxWidth:420,
alignSelf:"center",
},

chatBubbleGuideWrapper:{
alignSelf:"flex-start",
marginBottom:18
},

chatBubbleUserWrapper:{
alignSelf:"flex-end",
marginBottom:18
},

chatTailGuide:{
position:"absolute",
left:-4,
bottom:10,
width:10,
height:10,
backgroundColor:"#F3F4F6",
transform:[{rotate:"45deg"}]
},

chatTailUser:{
position:"absolute",
right:-4,
bottom:10,
width:10,
height:10,
backgroundColor:"#DDE3F5",
transform:[{rotate:"45deg"}]
},

thinkingDot:{
width:8,
height:8,
borderRadius:4,
backgroundColor:"#9CA3AF"
},

emptyState:{
alignItems:"center",
marginTop:40,
gap:14
},

emptyTitle:{
fontSize:16,
fontWeight:"600",
opacity:0.7
},

suggestionChip:{
backgroundColor:"#EEF0FF",
paddingVertical:12,
paddingHorizontal:18,
borderRadius:20
},

suggestionText:{
fontSize:14
},

chatVoiceMini:{
width:34,
height:34,
borderRadius:17,
alignItems:"center",
justifyContent:"center"
},

chatVoicePulse:{
position:"absolute",
width:34,
height:34,
borderRadius:17,
backgroundColor:"rgba(124,141,245,0.25)"
},

chatVoiceCore:{
width:18,
height:18,
borderRadius:9,
backgroundColor:"#7C8DF5"
},

placeImageFrame:{
width:"100%",
height:150,
borderRadius:20,
backgroundColor:"#E9E7FF",
alignItems:"center",
justifyContent:"center",
marginTop:18,
marginBottom:10,
shadowColor:"#000",
shadowOpacity:0.08,
shadowRadius:12,
shadowOffset:{width:0,height:6}
},

placeImagePlaceholder:{
opacity:0.5,
fontSize:14
},

chatSheet:{
  position:"absolute",
  top:0,
  left:0,
  right:0,
  bottom:0,
  zIndex:1000,
  elevation:1000,
  backgroundColor:"#FFF",
  overflow:"hidden"
},

})