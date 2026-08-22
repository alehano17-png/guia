import { PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_700Bold,
  });

  // Mientras carga la fuente, blanco en vez de un flash de texto sin
  // estilar — apenas toma un instante, no hace falta un loader propio.
  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
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
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" />
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