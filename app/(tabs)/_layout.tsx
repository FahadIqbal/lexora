import React from 'react';
import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAppStore } from '../../src/store/useAppStore';
import { useShallow } from 'zustand/react/shallow';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 44,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? 'rgba(0,229,184,0.14)' : 'transparent',
        borderRadius: 10,
        marginTop: 6,
      }}
    >
      <Text style={{ fontSize: 19 }}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const t = useTheme();
  const dueCount = useAppStore(useShallow((s) => s.getDueWordIds())).length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: process.env.EXPO_OS === 'ios' ? 26 : 14,
          left: 14,
          right: 14,
          height: 72,
          borderRadius: 28,
          backgroundColor: t.colors.surface2,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.09)',
          boxShadow: '0 18px 34px rgba(0,0,0,0.48)',
        },
        tabBarActiveTintColor: t.colors.accentTeal,
        tabBarInactiveTintColor: 'rgba(242,240,255,0.36)',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 8,
          fontFamily: t.font.body.medium,
        },
        tabBarItemStyle: {
          paddingTop: 0,
          paddingBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarBadge: dueCount > 0 ? dueCount : undefined,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔁" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Games',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🎮" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
