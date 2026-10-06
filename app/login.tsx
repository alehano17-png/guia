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
import { useTranslation } from "../lib/i18n/useTranslation";
import {
  TOUR_ACCENT_COLOR,
  TOUR_ERROR_COLOR,
  TOUR_GRADIENT_COLORS,
  TOUR_PLACEHOLDER_COLOR,
  TOUR_TEXT_PRIMARY,
  TOUR_TEXT_SECONDARY,
} from "../lib/tourTheme";
import {
  FONT_BOLD,
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_SIZE_DISPLAY,
  FONT_SIZE_MD,
  FONT_SIZE_SM,
  FONT_SIZE_XS,
} from "../lib/typography";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setErrorMessage(t.auth.login.missingFields);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const { error, hasSession } = await signIn(email.trim(), password);

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error);
      return;
    }

    // No asumimos que Stack.Protected (app/_layout.tsx) nos saca solo de
    // /login al detectar la sesión nueva — navegamos explícito.
    if (hasSession) {
      router.replace("/recomendations");
    }
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
            <Text style={styles.title}>{t.auth.login.title}</Text>
            <Text style={styles.subtitle}>
              {t.auth.login.subtitle}
            </Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>{t.auth.login.emailLabel}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t.auth.login.emailPlaceholder}
                  placeholderTextColor={TOUR_PLACEHOLDER_COLOR}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t.auth.login.passwordLabel}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={TOUR_PLACEHOLDER_COLOR}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}

              <Pressable
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>{t.auth.login.submit}</Text>
                )}
              </Pressable>

              <Pressable
                style={styles.linkRow}
                onPress={() => router.push("/signup")}
              >
                <Text style={styles.linkText}>
                  {t.auth.login.noAccount}{" "}
                  <Text style={styles.linkTextAccent}>{t.auth.login.signUpLink}</Text>
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
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_DISPLAY,
    color: TOUR_TEXT_PRIMARY,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_MD,
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
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_XS,
    color: TOUR_TEXT_SECONDARY,
    marginBottom: 6,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_MD,
    color: TOUR_TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: "rgba(124,111,224,0.25)",
  },

  errorText: {
    color: TOUR_ERROR_COLOR,
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_XS,
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
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_MD,
  },

  linkRow: {
    marginTop: 20,
    alignItems: "center",
  },

  linkText: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_SM,
    color: TOUR_TEXT_SECONDARY,
  },

  linkTextAccent: {
    color: TOUR_ACCENT_COLOR,
    fontWeight: "700",
  },
});
