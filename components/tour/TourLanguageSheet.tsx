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
import type { TourLocale } from "../../data/tours/index";
import { useTranslation } from "../../lib/i18n/useTranslation";
import {
  TOUR_ACCENT_COLOR,
  TOUR_TEXT_MUTED,
  TOUR_TEXT_PRIMARY,
} from "../../lib/tourTheme";
import {
  FONT_BOLD,
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_SIZE_MD,
  FONT_SIZE_SM,
  FONT_SIZE_XL,
} from "../../lib/typography";
import TourPrimaryButton from "./TourPrimaryButton";

type Props = {
  visible: boolean;
  tourTitle: string;
  defaultLocale: TourLocale;
  onConfirm: (locale: TourLocale) => void;
  onClose: () => void;
};

// Cada idioma se nombra en su propio idioma y nunca se traduce: alguien
// con el celular en inglés tiene que poder reconocer "Español", y
// viceversa.
const LANGUAGE_OPTIONS: { locale: TourLocale; label: string }[] = [
  { locale: "es", label: "Español" },
  { locale: "en", label: "English" },
];

// Distancia desde la que sube la hoja: de sobra para que arranque fuera
// de la pantalla sin tener que medir su altura real.
const SHEET_HIDDEN_OFFSET = 600;

// Elige el idioma del TOUR (contenido, voz y chat) antes de entrar. Los
// textos de esta hoja siguen el idioma de la interfaz, como el resto de la
// app.
export default function TourLanguageSheet({
  visible,
  tourTitle,
  defaultLocale,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const progress = useState(() => new Animated.Value(0))[0];
  const [selected, setSelected] = useState<TourLocale>(defaultLocale);
  // El Modal se queda montado mientras corre la animación de salida, y
  // recién se desmonta cuando termina.
  const [isMounted, setIsMounted] = useState(visible);

  // Valor de `visible` más reciente, para leerlo dentro del callback de la
  // animación de cierre — ese callback puede llegar tarde, ya con la hoja
  // vuelta a abrir. Se actualiza al inicio del efecto, no durante el
  // render, para no romper las reglas de react-hooks del proyecto.
  const visibleRef = useRef(visible);

  // Si la hoja nunca se abrió de verdad, el efecto no debe lanzar ninguna
  // animación de cierre (ver más abajo): lanzarla en el primer montaje era
  // justo lo que creaba un callback "fantasma" que llegaba apenas después
  // de abrir la hoja por primera vez y la desmontaba al instante.
  const hasBeenOpenedRef = useRef(false);

  // Cada vez que se abre, arranca con el idioma por defecto (no con lo
  // que se eligió la vez anterior). Se ajusta durante el render, con el
  // patrón de "estado previo" de React, en vez de en un efecto.
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setSelected(defaultLocale);
      setIsMounted(true);
    }
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

    // Todavía no se abrió ni una vez: no hay nada que animar cerrando.
    if (!hasBeenOpenedRef.current) return;

    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      // !visibleRef.current: por si este callback (de un cierre que ya
      // no corresponde) llega después de que la hoja se volvió a abrir —
      // así nunca desmonta una apertura real en curso.
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

          <Text style={styles.tourTitle}>{tourTitle}</Text>
          <Text style={styles.title}>{t.tour.languageTitle}</Text>
          <Text style={styles.subtitle}>{t.tour.languageSubtitle}</Text>

          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = option.locale === selected;

            return (
              <Pressable
                key={option.locale}
                style={[styles.option, isSelected && styles.optionSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelected(option.locale)}
              >
                <View style={styles.radio}>
                  {isSelected ? <View style={styles.radioDot} /> : null}
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </Pressable>
            );
          })}

          <TourPrimaryButton
            label={t.tour.languageContinue}
            onPress={() => onConfirm(selected)}
          />

          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>{t.tour.cancel}</Text>
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

  tourTitle: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_SM,
    color: TOUR_ACCENT_COLOR,
    textAlign: "center",
  },

  title: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_XL,
    color: TOUR_TEXT_PRIMARY,
    textAlign: "center",
    marginTop: 4,
  },

  subtitle: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_SM,
    color: TOUR_TEXT_MUTED,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#F6F2FF",
  },

  optionSelected: {
    backgroundColor: "rgba(124,111,224,0.12)",
    borderColor: TOUR_ACCENT_COLOR,
  },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: TOUR_ACCENT_COLOR,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: TOUR_ACCENT_COLOR,
  },

  optionLabel: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_MD,
    color: TOUR_TEXT_PRIMARY,
  },

  cancel: {
    marginTop: 14,
    paddingVertical: 4,
    alignItems: "center",
  },

  cancelText: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_SM,
    color: TOUR_TEXT_MUTED,
    textAlign: "center",
  },
});
