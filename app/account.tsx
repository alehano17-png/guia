import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, type ComponentProps } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DeleteAccountSheet from "../components/account/DeleteAccountSheet";
import { getUserDisplayName, useAuth } from "../hooks/useAuth";
import { PRIVACY_POLICY_URL } from "../lib/appLinks";
import { useTranslation } from "../lib/i18n/useTranslation";
import {
  TOUR_ACCENT_COLOR,
  TOUR_DANGER_COLOR,
  TOUR_GRADIENT_COLORS,
  TOUR_TEXT_MUTED,
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
  FONT_SIZE_XL,
} from "../lib/typography";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type Row = {
  key: string;
  icon: IoniconName;
  label: string;
  onPress: () => void;
};

// Vuelve al inicio: atrás si se llegó desde ahí, si no, reemplaza.
function goHome() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/");
  }
}

export default function AccountScreen() {
  const { t } = useTranslation();
  const { user, signOut, deleteAccount } = useAuth();

  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasDeleteError, setHasDeleteError] = useState(false);

  const displayName = getUserDisplayName(user);
  const email = user?.email ?? "";
  // Inicial del nombre; sin nombre, la del correo.
  const initial = (displayName ?? email).trim().charAt(0).toUpperCase();

  const rows: Row[] = [
    {
      key: "how",
      icon: "help-circle-outline",
      label: t.account.howItWorks,
      onPress: () =>
        router.push({ pathname: "/tutorial", params: { from: "home" } }),
    },
    // Oculta mientras PRIVACY_POLICY_URL esté vacía (lib/appLinks.ts).
    ...(PRIVACY_POLICY_URL
      ? [
          {
            key: "privacy",
            icon: "document-text-outline" as IoniconName,
            label: t.account.privacyPolicy,
            onPress: () => {
              Linking.openURL(PRIVACY_POLICY_URL).catch(() => {});
            },
          },
        ]
      : []),
    {
      key: "signout",
      icon: "log-out-outline",
      label: t.account.signOut,
      onPress: () => {
        router.replace("/");
        signOut();
      },
    },
  ];

  const openDeleteSheet = () => {
    setHasDeleteError(false);
    setIsSheetVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setHasDeleteError(false);

    const { error } = await deleteAccount();

    if (error) {
      setIsDeleting(false);
      setHasDeleteError(true);
      return;
    }

    // Éxito: la sesión local ya se cerró en deleteAccount; el inicio
    // muestra el aviso "Tu cuenta fue eliminada.".
    router.replace("/");
  };

  return (
    <LinearGradient
      colors={TOUR_GRADIENT_COLORS}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fill}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.fill}>
        <View style={styles.content}>
          <Pressable
            style={styles.backButton}
            onPress={goHome}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={16} color={TOUR_TEXT_SECONDARY} />
            <Text style={styles.backText}>{t.account.back}</Text>
          </Pressable>

          <Text style={styles.title}>{t.account.title}</Text>

          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
            {displayName ? (
              <Text style={styles.name}>{displayName}</Text>
            ) : null}
            <Text style={styles.email}>{email}</Text>
          </View>

          <View style={styles.card}>
            {rows.map((row, index) => (
              <Pressable
                key={row.key}
                style={[styles.row, index > 0 && styles.rowDivider]}
                onPress={row.onPress}
                accessibilityRole="button"
              >
                <Ionicons name={row.icon} size={22} color={TOUR_ACCENT_COLOR} />
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={TOUR_TEXT_MUTED}
                />
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.deleteLink}
            onPress={openDeleteSheet}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text style={styles.deleteLinkText}>{t.account.deleteAccount}</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <DeleteAccountSheet
        visible={isSheetVisible}
        isDeleting={isDeleting}
        hasError={hasDeleteError}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsSheetVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 6,
  },

  // Mismo estilo que el "Salir" del tour (TourHeader).
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },

  backText: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_SM,
    color: TOUR_TEXT_SECONDARY,
  },

  title: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_DISPLAY,
    color: TOUR_TEXT_PRIMARY,
    marginTop: 12,
  },

  profile: {
    alignItems: "center",
    marginTop: 28,
    marginBottom: 28,
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: TOUR_ACCENT_COLOR,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: TOUR_ACCENT_COLOR,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  avatarInitial: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: 34,
    color: "#FFFFFF",
  },

  name: {
    fontFamily: FONT_BOLD,
    fontWeight: "700",
    fontSize: FONT_SIZE_XL,
    color: TOUR_TEXT_PRIMARY,
    marginTop: 14,
  },

  email: {
    fontFamily: FONT_REGULAR,
    fontWeight: "400",
    fontSize: FONT_SIZE_MD,
    color: TOUR_TEXT_SECONDARY,
    marginTop: 4,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 22,
    paddingHorizontal: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
  },

  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(124,111,224,0.25)",
  },

  rowLabel: {
    flex: 1,
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_MD,
    color: TOUR_TEXT_PRIMARY,
  },

  deleteLink: {
    alignSelf: "center",
    marginTop: 28,
    paddingVertical: 6,
  },

  deleteLinkText: {
    fontFamily: FONT_SEMIBOLD,
    fontWeight: "600",
    fontSize: FONT_SIZE_MD,
    color: TOUR_DANGER_COLOR,
  },
});
