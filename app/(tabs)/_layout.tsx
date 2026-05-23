import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function TabsLayout() {
  const t = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.colors.surface,
          borderTopColor: t.colors.border,
          height: 64,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: t.colors.accentTeal,
        tabBarInactiveTintColor: t.colors.muted,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="review" options={{ title: 'Review' }} />
      <Tabs.Screen name="games" options={{ title: 'Games' }} />
      <Tabs.Screen name="social" options={{ title: 'Social' }} />
    </Tabs>
  );
}

