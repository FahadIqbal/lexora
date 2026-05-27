import React from 'react';
import { Redirect } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';

export default function Index() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);
  const userId = useAppStore((s) => s.user.id);

  if (!hydrated) return null;
  if (onboardingCompleted) return <Redirect href="/(tabs)/home" />;
  if (userId) return <Redirect href="/onboarding" />;
  return <Redirect href="/onboarding" />;
}
