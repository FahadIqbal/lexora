import React from 'react';
import { Redirect } from 'expo-router';
import { KidsOnboardingScreen } from '../../src/screens/kids/KidsScreens';
import { useAppStore } from '../../src/store/useAppStore';
import { RouteFallback } from '../../src/components/RouteFallback';

export default function OnboardingRoute() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);

  if (!hydrated) return <RouteFallback label="Setting up your first quest" />;
  if (onboardingCompleted) return <Redirect href="/(tabs)/home" />;
  return <KidsOnboardingScreen />;
}
