import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // For now we always start at onboarding. Later this becomes:
  // - if authed + profile exists → /(tabs)/home
  // - else → /onboarding
  return <Redirect href="/onboarding" />;
}

