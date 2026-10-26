import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HOME_BUTTON_TEXT_COLOR } from "../../lib/homeTheme";
import { useTranslation } from "../../lib/i18n/useTranslation";
import {
  TOUR_ACCENT_COLOR,
  TOUR_DANGER_COLOR,
  TOUR_TEXT_PRIMARY,
} from "../../lib/tourTheme";
import {
  FONT_BOLD,
  FONT_SEMIBOLD,
  FONT_SIZE_MD,
  FONT_SIZE_XL,
} from "../../lib/typography";

type Props = {
  visible: boolean;
  hasPhoto: boolean;
  onChoose: () => void;
  onRemove: () => void;
  onClose: () => void;
};

// Distancia desde la que sube la hoja (igual que TourLanguageSheet).
const SHEET_HIDDEN_OFFSET = 600;

// Hoja "Foto de perfil": misma hoja inferior y animación que
// DeleteAccountSheet / TourLanguageSheet.
export default function AvatarSheet({
  visible,
  hasPhoto,
  onChoose,
  onRemove,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const progress = useState(() => new Animated.Value(0))[0];
  // El Modal se queda montado mientras corre la animación de salida.
  const [isMounted, setIsMounted] = useState(visible);
  const visibleRef = useRef(visible);
  const hasBeenOpenedRef = useRef(false);

  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setIsMounted(true);
  }

  useEffect(() => {
    visibleRef.current = visible;

    if (visible) {
      hasBeenOpenedRef.current = true;
      Animated.timing(progress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!hasBeenOpenedRef.current) return;

    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visibleRef.current) setIsMounted(false);
    });
  }, [visible, progress]);

  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType="none"
      visible={isMounted}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: progress }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 24) + 12,
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SHEET_HIDDEN_OFFSET, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.handle} />

          <Text style={styles.title}>{t.account.photoTitle}</Text>

          <Pressable
            style={styles.primaryButton}
            onPress={onChoose}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>{t.account.photoChoose}</Text>
          </Pressable>

          {hasPhoto ? (
            <Pressable
              style={styles.removeButton}
              onPress={onRemove}
              accessibilityRole="button"
            >
              <Text style={styles.removeButtonText}>
                {t.account.photoRemove}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            style={styles.cancelButton}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>{t.account.cancel}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.38)",
  },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },

  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#DDD6F3",
    alignSelf: "center",
    marginBottom: 18,
  },

  title: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_XL,
    color: TOUR_TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: TOUR_ACCENT_COLOR,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
  },

  primaryButtonText: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_MD,
    color: "#FFFFFF",
  },

  removeButton: {
    marginTop: 10,
    paddingVertical: 16,
    alignItems: "center",
  },

  removeButtonText: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_MD,
    color: TOUR_DANGER_COLOR,
  },

  cancelButton: {
    marginTop: 10,
    backgroundColor: "rgba(124,111,224,0.10)",
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
  },

  cancelButtonText: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_MD,
    color: HOME_BUTTON_TEXT_COLOR,
  },
});
