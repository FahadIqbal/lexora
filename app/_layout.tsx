import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { useAppFonts } from '../src/theme/useAppFonts';

SplashScreen.preventAutoHideAsync().catch(() => {
  // no-op (can throw if called twice)
});

export default function RootLayout() {
  const { loaded, error } = useAppFonts();

  useEffect(() => {
    if (error) console.warn('Font loading error', error);
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="dictionary" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="settings" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

