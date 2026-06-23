import React from 'react';
import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Image } from 'expo-image';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAppStore } from '../../src/store/useAppStore';
import { useShallow } from 'zustand/react/shallow';

function TabIcon({
  symbol,
  fallback,
  focused,
}: {
  symbol: string;
  fallback: string;
  focused: boolean;
}) {
  const t = useTheme();
  const color = focused ? t.colors.accentTeal : 'rgba(242,240,255,0.44)';

  return (
    <View
      style={{
        width: 46,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? 'rgba(0,229,184,0.13)' : 'rgba(255,255,255,0.025)',
        borderRadius: 14,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: focused ? 'rgba(0,229,184,0.24)' : 'rgba(255,255,255,0.04)',
        marginTop: 5,
      }}
    >
      {process.env.EXPO_OS === 'ios' ? (
        <Image
          source={`sf:${symbol}`}
          tintColor={color}
          style={{ width: 19, height: 19 }}
          contentFit="contain"
        />
      ) : (
        <Text style={{ fontSize: 18, color }}>{fallback}</Text>
      )}
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
          height: 76,
          borderRadius: 30,
          borderCurve: 'continuous',
          backgroundColor: 'rgba(16,16,40,0.92)',
          borderTopWidth: 1,
          borderTopColor: t.colors.borderBright,
          boxShadow: '0 18px 34px rgba(0,0,0,0.48)',
        },
        tabBarActiveTintColor: t.colors.accentTeal,
        tabBarInactiveTintColor: 'rgba(242,240,255,0.36)',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
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
          tabBarIcon: ({ focused }) => <TabIcon symbol="house.fill" fallback="⌂" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ focused }) => <TabIcon symbol="book.fill" fallback="L" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarBadge: dueCount > 0 ? dueCount : undefined,
          tabBarIcon: ({ focused }) => <TabIcon symbol="arrow.clockwise" fallback="R" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Games',
          tabBarIcon: ({ focused }) => <TabIcon symbol="gamecontroller.fill" fallback="G" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
          tabBarIcon: ({ focused }) => <TabIcon symbol="trophy.fill" fallback="S" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
