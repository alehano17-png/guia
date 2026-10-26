import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HOME_BUTTON_TEXT_COLOR } from "../lib/homeTheme";
import {
  TOUR_ERROR_COLOR,
  TOUR_TEXT_PRIMARY,
  TOUR_TEXT_SECONDARY,
} from "../lib/tourTheme";
import {
  FONT_BOLD,
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_SIZE_MD,
  FONT_SIZE_XL,
  FONT_SIZE_XS,
} from "../lib/typography";

type Props = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  // Color del botón principal: TOUR_DANGER_COLOR para acciones
  // destructivas (eliminar cuenta), TOUR_ACCENT_COLOR para el resto.
  confirmColor: string;
  cancelLabel: string;
  // Mientras es true, el botón muestra carga y la hoja no se puede cerrar
  // ni volver a confirmar.
  isBusy?: boolean;
  // Mensaje de error dentro de la hoja (null = sin error).
  errorMessage?: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

// Distancia desde la que sube la hoja (igual que TourLanguageSheet).
const SHEET_HIDDEN_OFFSET = 600;

// Hoja inferior de confirmación (eliminar cuenta, cerrar sesión...): misma
// hoja y misma animación que la del idioma del tour (TourLanguageSheet).
export default function ConfirmSheet({
  visible,
  title,
  body,
  confirmLabel,
  confirmColor,
  cancelLabel,
  isBusy = false,
  errorMessage = null,
  onConfirm,
  onClose,
}: Props) {
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

  const handleClose = () => {
    if (!isBusy) onClose();
  };

  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType="none"
      visible={isMounted}
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: progress }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
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

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <Pressable
            style={[
              styles.confirmButton,
              { backgroundColor: confirmColor },
              isBusy && styles.buttonBusy,
            ]}
            onPress={onConfirm}
            disabled={isBusy}
            accessibilityRole="button"
          >
            {isBusy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.cancelButton, isBusy && styles.buttonBusy]}
            onPress={handleClose}
            disabled={isBusy}
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
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
  },

  body: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_MD,
    color: TOUR_TEXT_SECONDARY,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  errorText: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_XS,
    color: TOUR_ERROR_COLOR,
    textAlign: "center",
    marginBottom: 12,
  },

  confirmButton: {
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  confirmButtonText: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_MD,
    color: "#FFFFFF",
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

  buttonBusy: {
    opacity: 0.7,
  },
});
