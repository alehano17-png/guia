import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import ReanimatedAnimated, {
    interpolate,
    useAnimatedKeyboard,
    useAnimatedRef,
    useAnimatedStyle,
    useDerivedValue,
} from "react-native-reanimated";
import { ChatMessage } from "../../lib/chatTypes";
import { TOUR_ACCENT_COLOR, TOUR_TEXT_PRIMARY } from "../../lib/tourTheme";

type Props = {
  visible: boolean;
  insetsTop: number;
  insetsBottom: number;
  pulseAnim: Animated.Value;
  thinkingAnim: Animated.Value;
  stepTitle: string;
  input: string;
  messages: ChatMessage[];
  isThinking: boolean;
  isDictating: boolean;
  onClose: () => void;
  onChangeInput: (text: string) => void;
  onSend: () => void;
  onSuggestionPress: (text: string) => void;
  onMicPress: () => void;
};

export default function TourChatSheet({
  visible,
  insetsTop,
  insetsBottom,
  pulseAnim,
  thinkingAnim,
  stepTitle,
  input,
  messages,
  isThinking,
  isDictating,
  onClose,
  onChangeInput,
  onSend,
  onSuggestionPress,
  onMicPress,
}: Props) {
  const scrollRef = useAnimatedRef<ReanimatedAnimated.ScrollView>();

  // El "padding" de KeyboardAvoidingView no era confiable con este layout
  // (position: absolute + varios niveles de flex). useAnimatedKeyboard da
  // la altura real del teclado, frame a frame — única fuente de verdad
  // para todo lo que reacciona al teclado en este componente (antes había
  // un boolean + Animated.timing aparte para el colapso de la tarjeta,
  // desincronizado de esto).
  const keyboard = useAnimatedKeyboard();
  const keyboardAvoidingStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboard.height.value,
  }));

  // Progreso de colapso de la tarjeta de info: 1 = totalmente expandida
  // (teclado cerrado), 0 = totalmente colapsada. 300 es el mismo alto
  // máximo que ya tenía la tarjeta — a partir de esa altura de teclado se
  // la considera colapsada del todo. 'clamp' por si el teclado real mide
  // más en algún dispositivo.
  const CARD_COLLAPSE_RANGE = 300;
  const cardProgress = useDerivedValue(() =>
    interpolate(keyboard.height.value, [0, CARD_COLLAPSE_RANGE], [1, 0], "clamp")
  );

  const cardStyle = useAnimatedStyle(() => ({
    height: interpolate(cardProgress.value, [0, 1], [0, 300]),
    opacity: cardProgress.value,
    transform: [
      { translateY: interpolate(cardProgress.value, [0, 1], [-30, 0]) },
    ],
  }));

  const chatMessagesStyle = useAnimatedStyle(() => ({
    marginTop: interpolate(cardProgress.value, [0, 1], [-40, 0]),
  }));

  // Mismo comportamiento que el boolean externo que reemplaza (swap
  // instantáneo, no gradual): apenas el teclado tiene 1px de alto ya vale
  // 14, sin esperar a que termine de subir.
  const inputContainerStyle = useAnimatedStyle(() => ({
    paddingBottom: interpolate(
      keyboard.height.value,
      [0, 1],
      [insetsBottom + 12, 14],
      "clamp"
    ),
  }));

  if (!visible) return null;

  return (
    <View style={styles.chatSheet}>
      <View style={[styles.chatOverlay, { paddingTop: insetsTop }]}>
        <View style={styles.chatHeader}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.chatClose}>Cerrar</Text>
          </Pressable>

          <Text style={styles.chatTitle}>GUÍA</Text>

          <View style={{ width: 40 }} />
        </View>

        <ReanimatedAnimated.View
          style={[styles.chatCard, cardStyle, { overflow: "hidden" }]}
        >
          <View style={styles.chatCardRow}>
            <View style={styles.chatVoiceMini}>
              <Animated.View
                style={[
                  styles.chatVoicePulse,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <View style={styles.chatVoiceCore} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.chatCardLabel}>
                Estoy narrando el punto:
              </Text>

              <Text style={styles.chatCardTitle}>{stepTitle}</Text>

              <Text style={styles.chatCardText}>
                Puedes preguntarme algo sobre este lugar o sobre cualquier parte
                del tour.
              </Text>
            </View>
          </View>
        </ReanimatedAnimated.View>

        <ReanimatedAnimated.View style={[styles.chatBody, keyboardAvoidingStyle]}>
        <ReanimatedAnimated.ScrollView
          ref={scrollRef}
          style={[styles.chatMessages, chatMessagesStyle]}
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
                onPress={() => onSuggestionPress("¿Qué historia tiene este lugar?")}
              >
                <Text style={styles.suggestionText}>
                  ¿Qué historia tiene este lugar?
                </Text>
              </Pressable>

              <Pressable
                style={styles.suggestionChip}
                onPress={() => onSuggestionPress("¿Qué debería ver cerca de aquí?")}
              >
                <Text style={styles.suggestionText}>
                  ¿Qué debería ver cerca de aquí?
                </Text>
              </Pressable>

              <Pressable
                style={styles.suggestionChip}
                onPress={() => onSuggestionPress("¿Cuánto tiempo toma este tour?")}
              >
                <Text style={styles.suggestionText}>
                  ¿Cuánto tiempo toma este tour?
                </Text>
              </Pressable>
            </View>
          )}

          {messages.map((m) => {
            const isUser = m.role === "user";

            return (
              <View
                key={m.id}
                style={
                  isUser
                    ? styles.chatBubbleUserWrapper
                    : styles.chatBubbleGuideWrapper
                }
              >
                <View style={isUser ? styles.chatBubbleUser : styles.chatBubbleGuide}>
                  <Text style={styles.chatMessageText}>{m.text}</Text>
                </View>

                <View style={isUser ? styles.chatTailUser : styles.chatTailGuide} />
              </View>
            );
          })}

          {isThinking && (
            <View style={styles.chatBubbleGuideWrapper}>
              <View style={styles.chatBubbleGuide}>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <Animated.View
                    style={[
                      styles.thinkingDot,
                      {
                        opacity: thinkingAnim,
                      },
                    ]}
                  />

                  <Animated.View
                    style={[
                      styles.thinkingDot,
                      {
                        opacity: thinkingAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.3, 1],
                        }),
                      },
                    ]}
                  />

                  <Animated.View
                    style={[
                      styles.thinkingDot,
                      {
                        opacity: thinkingAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.1, 1],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}
        </ReanimatedAnimated.ScrollView>

        <ReanimatedAnimated.View
          style={[styles.chatInputContainer, inputContainerStyle]}
        >
          <View style={styles.chatInputBar}>
            <Pressable onPress={onMicPress} hitSlop={10}>
              <Ionicons
                name="mic"
                size={18}
                color={isDictating ? TOUR_ACCENT_COLOR : "#6B7280"}
              />
            </Pressable>

            <TextInput
              placeholder="Haz una pregunta..."
              placeholderTextColor="#9CA3AF"
              style={styles.chatInput}
              value={input}
              onChangeText={onChangeInput}
            />

            <Pressable onPress={onSend} hitSlop={10}>
              <Ionicons name="send" size={18} color={TOUR_ACCENT_COLOR} />
            </Pressable>
          </View>
        </ReanimatedAnimated.View>
        </ReanimatedAnimated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chatSheet: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: "#FFF",
    overflow: "hidden",
  },

  chatOverlay: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexDirection: "column",
  },

  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 6,
  },

  chatTitle: {
    fontWeight: "800",
  },

  chatClose: {
    color: "#6B7280",
  },

  chatCard: {
    backgroundColor: "#F3F4F6",
    padding: 18,
    borderRadius: 20,
    marginBottom: 10,
  },

  chatCardRow: {
    flexDirection: "row",
    gap: 12,
  },

  chatCardLabel: {
    fontSize: 14,
    opacity: 0.7,
  },

  chatCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
    marginBottom: 6,
  },

  chatCardText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },

  chatVoiceMini: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  chatVoicePulse: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(142,123,255,0.22)",
  },

  chatVoiceCore: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#8E7BFF",
  },

  // Envuelve el scroll de mensajes + la barra de entrada; su paddingBottom
  // se anima con la altura real del teclado (useAnimatedKeyboard).
  chatBody: {
    flex: 1,
  },

  chatMessages: {
    flex: 1,
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },

  chatBubbleGuideWrapper: {
    alignSelf: "flex-start",
    marginBottom: 18,
  },

  chatBubbleUserWrapper: {
    alignSelf: "flex-end",
    marginBottom: 18,
  },

  chatBubbleGuide: {
    backgroundColor: "#F1EEFF",
    padding: 16,
    borderRadius: 18,
    alignSelf: "flex-start",
    maxWidth: "78%",
    minHeight: 36,
  },

  chatBubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: "#E7E1FF",
    padding: 16,
    borderRadius: 18,
    maxWidth: "72%",
  },

  chatMessageText: {
    fontSize: 15,
    lineHeight: 20,
    color: TOUR_TEXT_PRIMARY,
  },

  chatTailGuide: {
    position: "absolute",
    left: -4,
    bottom: 10,
    width: 10,
    height: 10,
    backgroundColor: "#F1EEFF",
    transform: [{ rotate: "45deg" }],
  },

  chatTailUser: {
    position: "absolute",
    right: -4,
    bottom: 10,
    width: 10,
    height: 10,
    backgroundColor: "#E7E1FF",
    transform: [{ rotate: "45deg" }],
  },

  thinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9CA3AF",
  },

  emptyState: {
    alignItems: "center",
    marginTop: 40,
    gap: 14,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.7,
  },

  suggestionChip: {
    backgroundColor: "#EEF0FF",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
  },

  suggestionText: {
    fontSize: 14,
  },

  chatInputContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "#FFF",
    flexShrink: 0,
  },

  chatInputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 26,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },

  chatInput: {
    flex: 1,
    fontSize: 15,
    color: TOUR_TEXT_PRIMARY,
  },
});