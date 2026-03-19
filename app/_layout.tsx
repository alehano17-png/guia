import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';



export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
  screenOptions={{
    headerShown: false,
    animation: "slide_from_right",
    animationDuration: 280,
  }}
>
  <Stack.Screen name="index" />
  <Stack.Screen name="intent" />
  <Stack.Screen name="recommendations" />
  <Stack.Screen name="tour" />
</Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
