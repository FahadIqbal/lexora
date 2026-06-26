import React from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useAppStore } from '../../src/store/useAppStore';
import { hapticSelection } from '../../src/utils/haptics';
import { kidTheme } from '../../src/theme/kidTheme';
import { getKidAdaptiveReviewSummary } from '../../src/services/kidAdaptiveLearningService';

export default function TabsLayout() {
  const dueCount = useAppStore((s) => getKidAdaptiveReviewSummary(s.kid).dueCount || s.getDueWordIds().length);
  const reviewBadge = dueCount > 99 ? '99+' : dueCount ? String(dueCount) : undefined;
  const c = kidTheme.colors;

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      blurEffect="systemMaterialLight"
      tintColor={c.purple}
      iconColor={{
        default: c.muted,
        selected: c.purple,
      }}
      labelStyle={{
        fontFamily: 'DMSans_700Bold',
        fontSize: 11,
      }}
      badgeBackgroundColor={c.coral}
      badgeTextColor="white"
      backgroundColor="rgba(255,255,255,0.94)"
      shadowColor="rgba(71,57,146,0.14)"
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
        <NativeTabs.Trigger.Label>Play</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="social">
        <NativeTabs.Trigger.Icon sf={{ default: 'trophy', selected: 'trophy.fill' }} md="emoji_events" />
        <NativeTabs.Trigger.Label>Social</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
