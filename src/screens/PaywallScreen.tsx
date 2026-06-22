import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeProvider';
import { TAB_BAR_BOTTOM } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Haptics, hapticNotify, hapticSelection } from '../utils/haptics';

type PlanKey = 'monthly' | 'yearly';

const perks = [
  'Unlimited AI tutor coaching',
  'Premium topic packs and advanced words',
  'Deep progress insights',
  'Offline learning queue',
  'All game modes and challenge streaks',
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
    },
    {
      key: 'yearly' as const,
      title: 'Yearly',
      price: 'RM89.90',
      caption: 'Save 50%',
      detail: 'Best for consistent vocabulary growth and long streaks.',
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
        <View style={styles.hero}>
          <LinearGradient
            colors={['rgba(123,111,255,0.26)', 'rgba(0,229,184,0.12)', 'rgba(255,107,157,0.10)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroTop}>
            <LexText variant="label" style={{ color: t.colors.accentTeal }}>
              Lexora Premium
            </LexText>
            <View style={[styles.liveBadge, { borderColor: isPremium ? t.colors.accentTeal : t.colors.border }]}>
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
            <Metric label="Tutor" value="Unlimited" />
            <Metric label="Games" value="6 modes" />
            <Metric label="Insight" value="Deep stats" />
          </View>
        </View>

        <Card style={{ marginTop: 14 }}>
          <LexText variant="title">Included</LexText>
          <View style={styles.perkList}>
            {perks.map((perk) => (
              <View key={perk} style={styles.perkRow}>
                <View style={[styles.checkDot, { backgroundColor: 'rgba(0,229,184,0.16)' }]}>
                  <LexText variant="label" style={{ color: t.colors.accentTeal, fontSize: 10 }}>
                    OK
                  </LexText>
                </View>
                <LexText variant="body" style={{ flex: 1 }}>
                  {perk}
                </LexText>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.planGrid}>
          {plans.map((plan) => {
            const selected = selectedPlan === plan.key;
            return (
              <Pressable
                key={plan.key}
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
              >
                <View style={styles.planTop}>
                  <LexText variant="title">{plan.title}</LexText>
                  <View style={[styles.radio, { borderColor: selected ? t.colors.accentTeal : t.colors.border }]}>
                    {selected ? <View style={[styles.radioDot, { backgroundColor: t.colors.accentTeal }]} /> : null}
                  </View>
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
              </Pressable>
            );
          })}
        </View>

        <Card style={{ marginTop: 12, backgroundColor: isPremium ? 'rgba(0,229,184,0.08)' : t.colors.surface2 }}>
          <View style={styles.summaryRow}>
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

        <View style={styles.actions}>
          <Button
            title={isPremium ? 'Premium active' : selectedPlan === 'yearly' ? 'Start preview trial' : 'Activate preview'}
            onPress={activatePreview}
            disabled={isPremium}
          />
          <Button title="Restore access" variant="ghost" onPress={restorePreview} />
          <Button title="Close" variant="ghost" onPress={() => router.back()} />
          <LexText variant="muted" style={{ textAlign: 'center', fontSize: 12 }}>
            Premium status is saved locally and synced from your profile when available.
          </LexText>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={[styles.metric, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
      <LexText variant="label" style={{ color: t.colors.muted, fontSize: 10 }}>
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
  liveBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  metricRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  metric: { flex: 1, borderWidth: 1, borderRadius: 14, borderCurve: 'continuous', padding: 10 },
  perkList: { marginTop: 12, gap: 10 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  actions: { marginTop: 14, gap: 10 },
});
