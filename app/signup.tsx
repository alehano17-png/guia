import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import {
  TOUR_ACCENT_COLOR,
  TOUR_GRADIENT_COLORS,
  TOUR_TEXT_PRIMARY,
  TOUR_TEXT_SECONDARY,
} from "../lib/tourTheme";

const MIN_PASSWORD_LENGTH = 6;

export default function SignupScreen() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      setErrorMessage("Completa todos los campos.");
      setInfoMessage(null);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      setInfoMessage(null);
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
      );
      setInfoMessage(null);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const { error, hasSession } = await signUp(email.trim(), password);

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error);
      return;
    }

    // Si Supabase ya dio sesión (auto-confirm activado en el proyecto),
    // navegamos explícito — no asumimos que Stack.Protected nos mueve
    // solo de /signup. Si en cambio pide confirmar el correo, todavía no
    // hay sesión real a la que navegar, así que nos quedamos acá y se lo
    // avisamos al usuario.
    if (hasSession) {
      router.replace("/recomendations");
      return;
    }

    setInfoMessage("Cuenta creada. Si tu proyecto pide confirmar el correo, revisa tu bandeja de entrada.");
  };

  return (
    <LinearGradient
      colors={TOUR_GRADIENT_COLORS}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>
              Regístrate para guardar tu progreso con GUÍA.
            </Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Correo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="tucorreo@ejemplo.com"
                  placeholderTextColor="#9C93B5"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9C93B5"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Confirmar contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9C93B5"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}

              {infoMessage && (
                <Text style={styles.infoText}>{infoMessage}</Text>
              )}

              <Pressable
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Crear cuenta</Text>
                )}
              </Pressable>

              <Pressable
                style={styles.linkRow}
                onPress={() => router.back()}
              >
                <Text style={styles.linkText}>
                  ¿Ya tienes cuenta?{" "}
                  <Text style={styles.linkTextAccent}>Inicia sesión</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  title: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
    fontSize: 30,
    color: TOUR_TEXT_PRIMARY,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: TOUR_TEXT_SECONDARY,
    textAlign: "center",
  },

  form: {
    marginTop: 36,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: TOUR_TEXT_SECONDARY,
    marginBottom: 6,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: TOUR_TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: "rgba(124,111,224,0.25)",
  },

  errorText: {
    color: "#C0392B",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },

  infoText: {
    color: TOUR_TEXT_SECONDARY,
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },

  button: {
    backgroundColor: TOUR_ACCENT_COLOR,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    shadowColor: TOUR_ACCENT_COLOR,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  linkRow: {
    marginTop: 20,
    alignItems: "center",
  },

  linkText: {
    fontSize: 14,
    color: TOUR_TEXT_SECONDARY,
  },

  linkTextAccent: {
    color: TOUR_ACCENT_COLOR,
    fontWeight: "700",
  },
});
