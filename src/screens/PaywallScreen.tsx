import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { IconSymbol } from '../components/IconSymbol';
import { useTheme } from '../theme/ThemeProvider';
import { TAB_BAR_BOTTOM } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Haptics, hapticNotify, hapticSelection } from '../utils/haptics';

type PlanKey = 'monthly' | 'yearly';

const perks = [
  {
    title: 'Unlimited AI tutor coaching',
    detail: 'Ask, retry, and get sentence-level guidance whenever you need it.',
    icon: 'sparkles',
    fallback: 'A',
  },
  {
    title: 'Premium topic packs',
    detail: 'Advanced words grouped by travel, work, exams, and conversation.',
    icon: 'square.grid.2x2.fill',
    fallback: 'P',
  },
  {
    title: 'Deep progress insights',
    detail: 'See weak spots, recall strength, streak rhythm, and next-best practice.',
    icon: 'chart.line.uptrend.xyaxis',
    fallback: 'I',
  },
  {
    title: 'Offline learning queue',
    detail: 'Keep studying when your connection is unreliable.',
    icon: 'arrow.down.circle.fill',
    fallback: 'O',
  },
  {
    title: 'All challenge modes',
    detail: 'Unlock the most engaging ways to play through review and recall.',
    icon: 'gamecontroller.fill',
    fallback: 'G',
  },
];

export function PaywallScreen() {
  const t = useTheme();
  const isPremium = useAppStore((s) => s.user.isPremium);
  const setIsPremium = useAppStore((s) => s.setIsPremium);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('yearly');
  const [status, setStatus] = useState(isPremium ? 'Premium is active on this device.' : '');

  const plans = [
    {
      key: 'monthly' as const,
      title: 'Monthly',
      price: 'RM14.90',
      caption: 'Flexible access',
      detail: 'Best when you want to test a focused study sprint.',
      badge: 'Starter',
    },
    {
      key: 'yearly' as const,
      title: 'Yearly',
      price: 'RM89.90',
      caption: 'Save 50%',
      detail: 'Best for consistent vocabulary growth and long streaks.',
      badge: 'Best value',
    },
  ];

  const activatePreview = () => {
    setIsPremium(true);
    setStatus(selectedPlan === 'yearly' ? 'Yearly preview trial is active.' : 'Monthly preview access is active.');
    hapticNotify(Haptics.NotificationFeedbackType.Success);
  };

  const restorePreview = () => {
    setStatus(isPremium ? 'Premium access is already active.' : 'No previous premium access was found on this device.');
    hapticSelection();
  };

  return (
    <Screen>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(460).springify().damping(17)} style={styles.hero}>
          <LinearGradient
            colors={['rgba(123,111,255,0.26)', 'rgba(0,229,184,0.12)', 'rgba(255,107,157,0.10)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroTop}>
            <View style={styles.brandRow}>
              <View style={[styles.brandGlyph, { backgroundColor: 'rgba(0,229,184,0.14)' }]}>
                <IconSymbol name="crown.fill" fallback="P" color={t.colors.accentTeal} size={17} />
              </View>
              <LexText variant="label" style={{ color: t.colors.accentTeal }}>
                Lexora Premium
              </LexText>
            </View>
            <View style={[styles.liveBadge, { borderColor: isPremium ? t.colors.accentTeal : 'rgba(255,255,255,0.14)' }]}>
              <LexText variant="label" style={{ color: isPremium ? t.colors.accentTeal : t.colors.muted, fontSize: 10 }}>
                {isPremium ? 'Active' : 'Preview'}
              </LexText>
            </View>
          </View>
          <LexText variant="h2" style={{ marginTop: 10 }}>
            Train without limits.
          </LexText>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            Turn Lexora into a deeper coaching loop with richer practice, smarter review, and more ways to stay engaged.
          </LexText>
          <View style={styles.metricRow}>
            <Metric icon="message.fill" fallback="T" label="Tutor" value="Unlimited" />
            <Metric icon="bolt.fill" fallback="G" label="Games" value="6 modes" />
            <Metric icon="chart.bar.fill" fallback="I" label="Insight" value="Deep stats" />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(420)}>
          <Card style={{ marginTop: 14 }}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardTitleGlyph, { backgroundColor: 'rgba(123,111,255,0.14)' }]}>
                <IconSymbol name="checkmark.seal.fill" fallback="C" color={t.colors.accentPurple} size={16} />
              </View>
              <LexText variant="title">Included</LexText>
            </View>
            <View style={styles.perkList}>
              {perks.map((perk, index) => (
                <Animated.View
                  key={perk.title}
                  entering={FadeInDown.delay(120 + index * 35).duration(360)}
                  style={[styles.perkRow, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.035)' }]}
                >
                  <View style={[styles.checkDot, { backgroundColor: 'rgba(0,229,184,0.14)' }]}>
                    <IconSymbol name={perk.icon} fallback={perk.fallback} color={t.colors.accentTeal} size={15} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <LexText variant="title" style={{ fontSize: 15 }}>
                      {perk.title}
                    </LexText>
                    <LexText variant="muted" style={{ marginTop: 3, fontSize: 12, lineHeight: 17 }}>
                      {perk.detail}
                    </LexText>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Card>
        </Animated.View>

        <View style={styles.planGrid}>
          {plans.map((plan, index) => {
            const selected = selectedPlan === plan.key;
            return (
              <AnimatedPressable
                key={plan.key}
                entering={FadeInDown.delay(130 + index * 55).duration(420).springify().damping(17)}
                onPress={() => {
                  setSelectedPlan(plan.key);
                  hapticSelection();
                }}
                style={({ pressed }) => [
                  styles.planCard,
                  {
                    borderColor: selected ? t.colors.accentTeal : t.colors.border,
                    backgroundColor: selected ? 'rgba(0,229,184,0.09)' : t.colors.surface,
                    opacity: pressed ? 0.86 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <View style={styles.planTop}>
                  <LexText variant="title">{plan.title}</LexText>
                  {selected ? (
                    <IconSymbol name="checkmark.circle.fill" fallback="Y" color={t.colors.accentTeal} size={21} />
                  ) : (
                    <View style={[styles.radio, { borderColor: t.colors.border }]} />
                  )}
                </View>
                <View
                  style={[
                    styles.planBadge,
                    {
                      borderColor: selected ? t.colors.accentTeal : t.colors.border,
                      backgroundColor: selected ? 'rgba(0,229,184,0.12)' : 'rgba(255,255,255,0.04)',
                    },
                  ]}
                >
                  <LexText variant="label" style={{ color: selected ? t.colors.accentTeal : t.colors.muted, fontSize: 9 }}>
                    {plan.badge}
                  </LexText>
                </View>
                <LexText variant="h2" style={{ fontSize: 25, lineHeight: 30, marginTop: 8 }}>
                  {plan.price}
                </LexText>
                <LexText variant="label" style={{ color: selected ? t.colors.accentTeal : t.colors.muted, marginTop: 4 }}>
                  {plan.caption}
                </LexText>
                <LexText variant="muted" style={{ marginTop: 8, fontSize: 13, lineHeight: 18 }}>
                  {plan.detail}
                </LexText>
              </AnimatedPressable>
            );
          })}
        </View>

        <Animated.View entering={FadeInDown.delay(210).duration(420)}>
          <Card style={{ marginTop: 12, backgroundColor: isPremium ? 'rgba(0,229,184,0.08)' : t.colors.surface2 }}>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryGlyph, { backgroundColor: isPremium ? 'rgba(0,229,184,0.14)' : 'rgba(255,179,71,0.14)' }]}>
                <IconSymbol name={isPremium ? 'checkmark.seal.fill' : 'gift.fill'} fallback={isPremium ? 'Y' : 'G'} color={isPremium ? t.colors.accentTeal : t.colors.accentAmber} size={17} />
              </View>
              <View style={{ flex: 1 }}>
                <LexText variant="label" style={{ color: t.colors.muted }}>
                  Selected plan
                </LexText>
                <LexText variant="title" style={{ marginTop: 4 }}>
                  {selectedPlan === 'yearly' ? 'Yearly preview trial' : 'Monthly preview'}
                </LexText>
              </View>
              <LexText variant="title" style={{ color: t.colors.accentTeal }}>
                {selectedPlan === 'yearly' ? '7 days' : 'Now'}
              </LexText>
            </View>
            {status ? (
              <LexText variant="muted" style={{ marginTop: 10, color: isPremium ? t.colors.accentTeal : t.colors.muted }}>
                {status}
              </LexText>
            ) : null}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).duration(420)} style={styles.actions}>
          <Button
            title={isPremium ? 'Premium active' : selectedPlan === 'yearly' ? 'Start preview trial' : 'Activate preview'}
            onPress={activatePreview}
            disabled={isPremium}
          />
          <Button title="Restore access" variant="ghost" onPress={restorePreview} />
          <Button title="Not now" variant="ghost" onPress={() => router.back()} />
          <LexText variant="muted" style={{ textAlign: 'center', fontSize: 12 }}>
            Premium status is saved locally and synced from your profile when available.
          </LexText>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Metric({ icon, fallback, label, value }: { icon: string; fallback: string; label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={[styles.metric, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
      <View style={[styles.metricIcon, { backgroundColor: 'rgba(0,229,184,0.11)' }]}>
        <IconSymbol name={icon} fallback={fallback} color={t.colors.accentTeal} size={13} />
      </View>
      <LexText variant="label" style={{ color: t.colors.muted, fontSize: 9, marginTop: 7 }}>
        {label}
      </LexText>
      <LexText variant="title" style={{ marginTop: 3, fontSize: 14 }}>
        {value}
      </LexText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, paddingBottom: TAB_BAR_BOTTOM, gap: 0 },
  hero: {
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    padding: 18,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandGlyph: { width: 30, height: 30, borderRadius: 12, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  liveBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  metricRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  metric: { flex: 1, borderWidth: 1, borderRadius: 14, borderCurve: 'continuous', padding: 10 },
  metricIcon: { width: 26, height: 26, borderRadius: 10, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitleGlyph: { width: 32, height: 32, borderRadius: 12, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  perkList: { marginTop: 12, gap: 10 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 18, borderCurve: 'continuous', padding: 12 },
  checkDot: {
    width: 34,
    height: 34,
    borderRadius: 13,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planGrid: { marginTop: 12, flexDirection: 'row', gap: 10 },
  planCard: {
    flex: 1,
    minHeight: 178,
    borderWidth: 1,
    borderRadius: 18,
    borderCurve: 'continuous',
    padding: 14,
  },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  planBadge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, marginTop: 10 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  summaryGlyph: { width: 36, height: 36, borderRadius: 14, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  actions: { marginTop: 14, gap: 10 },
});
