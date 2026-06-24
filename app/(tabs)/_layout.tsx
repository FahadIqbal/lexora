import React from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAppStore } from '../../src/store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { hapticSelection } from '../../src/utils/haptics';

export default function TabsLayout() {
  const t = useTheme();
  const dueCount = useAppStore(useShallow((s) => s.getDueWordIds())).length;
  const reviewBadge = dueCount > 99 ? '99+' : dueCount ? String(dueCount) : undefined;

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      blurEffect="systemMaterialDark"
      tintColor={t.colors.accentTeal}
      iconColor={{
        default: 'rgba(242,240,255,0.54)',
        selected: t.colors.accentTeal,
      }}
      labelStyle={{
        fontFamily: t.font.body.medium,
        fontSize: 11,
      }}
      badgeBackgroundColor={t.colors.accentPink}
      badgeTextColor="white"
      backgroundColor="rgba(8,8,22,0.90)"
      shadowColor="rgba(0,0,0,0.24)"
      disableTransparentOnScrollEdge
      sidebarAdaptable
      screenListeners={{
        tabPress: () => hapticSelection(),
      }}
    >
      <NativeTabs.Trigger name="home" role="featured">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="learn">
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} md="menu_book" />
        <NativeTabs.Trigger.Label>Learn</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="review" role="recents">
        <NativeTabs.Trigger.Icon sf="arrow.clockwise" md="refresh" />
        <NativeTabs.Trigger.Label>Review</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge hidden={!reviewBadge}>{reviewBadge}</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="games" role="topRated">
        <NativeTabs.Trigger.Icon sf={{ default: 'gamecontroller', selected: 'gamecontroller.fill' }} md="stadia_controller" />
        <NativeTabs.Trigger.Label>Games</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="social">
        <NativeTabs.Trigger.Icon sf={{ default: 'trophy', selected: 'trophy.fill' }} md="emoji_events" />
        <NativeTabs.Trigger.Label>Social</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
