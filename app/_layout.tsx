import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import OfflineBanner from '@/components/OfflineBanner';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // OfflineBanner va afuera de todo lo demás, incondicional, para que
  // cubra la app completa sin importar en qué pantalla esté la persona —
  // incluidos los blancos de acá abajo (fuente cargando, y la sesión
  // cargando adentro de RootNavigator), no solo una vez que el Stack ya
  // está montado.
  return (
    <>
      <OfflineBanner />

      {/* Mientras carga la fuente, blanco en vez de un flash de texto sin
          estilar — apenas toma un instante, no hace falta un loader propio. */}
      {fontsLoaded ? (
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      ) : null}
    </>
  );
}

// Separado de RootLayout porque useAuth() necesita estar debajo de
// <AuthProvider> para leer el contexto.
function RootNavigator() {
  const colorScheme = useColorScheme();
  const { user, isLoadingSession } = useAuth();

  // Todavía no sabemos si hay sesión o no — ni mostramos la app ni el
  // login, para no redirigir de más y que se vea un parpadeo.
  if (isLoadingSession) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 280,
        }}
      >
        {/* Pantalla de inicio: pública, sin condición de sesión. El botón
            "Empezar" decide a dónde ir según haya o no usuario. */}
        <Stack.Screen name="(tabs)" />

        <Stack.Protected guard={!!user}>
          <Stack.Screen name="discover" />
          <Stack.Screen name="recomendations" />
          <Stack.Screen name="tour" />
        </Stack.Protected>

        <Stack.Protected guard={!user}>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}