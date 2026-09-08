import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { TOUR_ACCENT_COLOR, TOUR_TEXT_PRIMARY } from "../lib/tourTheme";

// Se considera "sin conexión" si el radio (WiFi/datos) está desconectado, O
// si está conectado pero no llega a internet de verdad (WiFi de un
// restaurante sin señal real, por ejemplo). `isInternetReachable` puede
// venir `null` mientras NetInfo todavía no terminó de comprobarlo (por
// ejemplo, justo al abrir la app) — ahí se trata como "no sabemos todavía",
// no como offline, para no mostrar el aviso de arranque por error.
function isOfflineState(state: { isConnected: boolean | null; isInternetReachable: boolean | null }) {
  return state.isConnected === false || state.isInternetReachable === false;
}

// Aviso global de conectividad — bloquea toda la pantalla mientras no haya
// internet, sin importar en qué parte de la app esté la persona (se monta
// una sola vez, en app/_layout.tsx, en el nivel más externo). Misma
// estructura que TourDecisionModal (overlay a pantalla completa + tarjeta
// centrada animada), pero autónomo: no depende de que ninguna pantalla le
// pase `visible` ni un Animated.Value — se gestiona solo.
export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  // useState (no useRef) por la misma razón que ya se aplicó en
  // app/tour.tsx: el nuevo lint react-hooks/refs no deja leer un ref
  // durante el render (los .interpolate() de más abajo), y un Animated.Value
  // guardado en useState no cuenta como ref para esa regla.
  const anim = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(isOfflineState(state));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isOffline) return;

    // Arranca siempre desde 0 — si se muestra de nuevo tras un reintento
    // fallido, vuelve a jugar la misma entrada en vez de saltar a 1.
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isOffline, anim]);

  const handleRetry = async () => {
    setIsRetrying(true);

    try {
      // fetch() fuerza una comprobación real ahora mismo, en vez de
      // esperar al próximo evento espontáneo de NetInfo — es lo que hace
      // que "Reintentar" se sienta como un botón y no como un adorno.
      const state = await NetInfo.fetch();
      setIsOffline(isOfflineState(state));
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isOffline) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              {
                scale: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.92, 1],
                }),
              },
            ],
            opacity: anim,
          },
        ]}
      >
        <Image
          source={require("../assets/images/guia-sin-internet.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Parece que no hay conexión</Text>

        <Text style={styles.message}>
          Revisa tu WiFi o datos móviles, e inténtalo de nuevo.
        </Text>

        <Pressable
          style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
          onPress={handleRetry}
          disabled={isRetrying}
        >
          <Text style={styles.retryText}>
            {isRetrying ? "Comprobando..." : "Reintentar"}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.38)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    // Por encima de cualquier otra cosa que la app esté mostrando en ese
    // momento (modales del tour incluidos).
    zIndex: 1000,
    elevation: 1000,
  },

  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 26,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
  },

  image: {
    width: 120,
    height: 139,
    marginBottom: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: TOUR_TEXT_PRIMARY,
  },

  message: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: TOUR_ACCENT_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
  },

  retryButtonDisabled: {
    opacity: 0.6,
  },

  retryText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
