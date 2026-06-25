import React from 'react';
import { Redirect } from 'expo-router';
import { KidsOnboardingScreen } from '../../src/screens/kids/KidsScreens';
import { useAppStore } from '../../src/store/useAppStore';

export default function OnboardingRoute() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);

  if (!hydrated) return null;
  if (onboardingCompleted) return <Redirect href="/(tabs)/home" />;
  return <KidsOnboardingScreen />;
}
