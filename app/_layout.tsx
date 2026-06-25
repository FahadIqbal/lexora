import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { useAppFonts } from '../src/theme/useAppFonts';
import { useAppStore } from '../src/store/useAppStore';
import { hasSupabase } from '../src/services/env';
import { getSupabase } from '../src/services/supabase';
import { getUserProfile } from '../src/services/supabaseHelpers';

SplashScreen.preventAutoHideAsync().catch(() => {
  // no-op (can throw if called twice)
});

export default function RootLayout() {
  const { loaded, error } = useAppFonts();
  const hydrated = useAppStore((s) => s.hydrated);
  const setUserId = useAppStore((s) => s.setUserId);
  const setDisplayName = useAppStore((s) => s.setDisplayName);
  const setDailyGoalWords = useAppStore((s) => s.setDailyGoalWords);
  const setProficiencyLevel = useAppStore((s) => s.setProficiencyLevel);
  const setSelectedCategories = useAppStore((s) => s.setSelectedCategories);
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);
  const setIsPremium = useAppStore((s) => s.setIsPremium);
  const setIsAdmin = useAppStore((s) => s.setIsAdmin);

  useEffect(() => {
    if (error) console.warn('Font loading error', error);
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded]);

  useEffect(() => {
    if (!loaded || !hydrated) return;
    if (!hasSupabase()) return;

    const supabase = getSupabase();
    let cancelled = false;

    const applyProfile = async (userId: string) => {
      const profile = await getUserProfile(userId).catch(() => null);
      if (cancelled || !profile) return;

      if (profile.display_name) setDisplayName(profile.display_name);
      if (typeof profile.daily_goal_words === 'number') setDailyGoalWords(profile.daily_goal_words);
      if (profile.proficiency_level) setProficiencyLevel(profile.proficiency_level);
      if (Array.isArray(profile.selected_categories)) setSelectedCategories(profile.selected_categories);
      if (typeof profile.is_admin === 'boolean') setIsAdmin(profile.is_admin);
      if (typeof profile.is_premium === 'boolean') {
        setIsPremium(profile.is_premium);
      }
      if (Array.isArray(profile.selected_categories) && profile.selected_categories.length) {
        setOnboardingCompleted(true);
      }
    };

    (async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (!userId) {
        setUserId(undefined);
        return;
      }
      setUserId(userId);
      await applyProfile(userId);
    })();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id;
      if (!userId) {
        setUserId(undefined);
        return;
      }
      setUserId(userId);
      applyProfile(userId);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [loaded, hydrated]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'default',
            fullScreenGestureEnabled: true,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="auth" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.86, 1], sheetGrabberVisible: true }} />
          <Stack.Screen name="child-profiles" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="lessons/[id]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="practice/[mode]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="rewards" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="parent" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.82, 1], sheetGrabberVisible: true }} />
          <Stack.Screen name="dictionary" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="dictionary/[id]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="games/[slug]" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="progress" options={{ animation: 'ios_from_right' }} />
          <Stack.Screen name="chat" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen
            name="paywall"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.58, 0.92],
              sheetGrabberVisible: true,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.72, 1],
              sheetGrabberVisible: true,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
          <Stack.Screen name="admin" options={{ animation: 'ios_from_right' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
