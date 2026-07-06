import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { IconSymbol } from '../components/IconSymbol';
import { AppHeader } from '../components/AppHeader';
import { useTheme } from '../theme/ThemeProvider';
import { useAppStore } from '../store/useAppStore';
import { TAB_BAR_BOTTOM } from '../theme';
import { Haptics, hapticNotify } from '../utils/haptics';

export function SettingsScreen() {
  const t = useTheme();
  const dailyGoalWords = useAppStore((s) => s.user.dailyGoalWords);
  const isPremium = useAppStore((s) => s.user.isPremium);
  const setDailyGoalWords = useAppStore((s) => s.setDailyGoalWords);

  const [dailyReminder, setDailyReminder] = useState(true);
  const [reviewDue, setReviewDue] = useState(true);
  const [streakRisk, setStreakRisk] = useState(true);
  const [achievements, setAchievements] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState('');

  const enableNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      setNotificationStatus('Notifications are off. Enable them in system settings to receive reminders.');
      hapticNotify(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (dailyReminder) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Your daily words are waiting!',
          body: 'Keep your streak alive 🔥',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 21,
          minute: 0,
          repeats: true,
        },
      });
    }

    setNotificationStatus(dailyReminder ? 'Daily reminders are scheduled for 9:00 PM.' : 'Notification permission is enabled.');
    hapticNotify(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Screen>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <AppHeader
          eyebrow="Control center"
          title="Settings"
          subtitle="Tune Lexora around your pace, reminders, and learning energy."
          icon="slider.horizontal.3"
          fallback="S"
          accent={t.colors.accentTeal}
          metric={isPremium ? 'Pro' : 'Free'}
        />

        <View style={styles.hero}>
          <LinearGradient
            colors={['rgba(0,229,184,0.18)', 'rgba(123,111,255,0.16)', 'rgba(255,107,157,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroTop}>
            <View>
              <LexText variant="label" style={{ color: t.colors.accentTeal }}>
                Learning rhythm
              </LexText>
              <LexText variant="h3" style={{ marginTop: 5 }}>
                Keep the loop light.
              </LexText>
            </View>
            <View style={[styles.heroIcon, { backgroundColor: 'rgba(0,229,184,0.14)' }]}>
              <IconSymbol name="sparkles" fallback="*" color={t.colors.accentTeal} size={22} />
            </View>
          </View>
          <View style={styles.heroStats}>
            <HeroStat label="Daily goal" value={`${dailyGoalWords} words`} />
            <HeroStat label="Reminder" value={dailyReminder ? '9:00 PM' : 'Off'} />
            <HeroStat label="Plan" value={isPremium ? 'Premium' : 'Free'} />
          </View>
        </View>

        <Card style={{ marginTop: 16 }}>
          <SectionHeading icon="target" fallback="T" color={t.colors.accentTeal} title="Learning preferences" />
          <View style={{ marginTop: 14, gap: 12 }}>
            <View style={[styles.goalPanel, { borderColor: t.colors.border, backgroundColor: t.colors.surfaceGlass }]}>
              <View style={styles.goalHeader}>
                <View>
                  <LexText variant="label" style={{ color: t.colors.muted }}>
                    Daily goal
                  </LexText>
                  <LexText variant="title" style={{ marginTop: 3 }}>
                    {dailyGoalWords} focused words
                  </LexText>
                </View>
                <LexText variant="muted" style={{ fontSize: 13 }}>
                  Adaptive
                </LexText>
              </View>
              <View style={styles.goalRow}>
                {[5, 10, 15, 20, 30].map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => setDailyGoalWords(n)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: dailyGoalWords === n }}
                    style={({ pressed }) => [
                      styles.goalChip,
                      {
                        borderColor: dailyGoalWords === n ? t.colors.accentTeal : t.colors.border,
                        backgroundColor: dailyGoalWords === n ? 'rgba(0,229,184,0.14)' : 'rgba(255,255,255,0.04)',
                        opacity: pressed ? 0.82 : 1,
                      },
                    ]}
                  >
                    <LexText variant="label" style={{ color: dailyGoalWords === n ? t.colors.accentTeal : t.colors.muted, fontSize: 11 }}>
                      {n}
                    </LexText>
                  </Pressable>
                ))}
              </View>
            </View>
            <PreferenceRow icon="clock.fill" fallback="C" title="Preferred study time" detail="9:00 PM evening review" color={t.colors.accentPurple} />
            <PreferenceRow icon="waveform" fallback="W" title="Feedback" detail="Sounds and haptics are on" color={t.colors.accentPink} />
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <SectionHeading icon="bell.badge.fill" fallback="B" color={t.colors.accentAmber} title="Notifications" />
          <View style={{ marginTop: 14, gap: 10 }}>
            <ToggleRow icon="sun.max.fill" fallback="D" label="Daily reminder" detail="A calm evening nudge" value={dailyReminder} onChange={setDailyReminder} color={t.colors.accentAmber} />
            <ToggleRow icon="arrow.triangle.2.circlepath" fallback="R" label="Review due" detail="Words ready for memory refresh" value={reviewDue} onChange={setReviewDue} color={t.colors.accentBlue} />
            <ToggleRow icon="flame.fill" fallback="F" label="Streak at risk" detail="Only when momentum needs attention" value={streakRisk} onChange={setStreakRisk} color={t.colors.accentPink} />
            <ToggleRow icon="medal.fill" fallback="M" label="Achievements" detail="Celebrate milestones and wins" value={achievements} onChange={setAchievements} color={t.colors.accentTeal} />
            <View style={{ marginTop: 6 }}>
              <Button title="Enable notifications" onPress={enableNotifications} />
            </View>
            {notificationStatus ? (
              <View style={[styles.inlineStatus, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <LexText variant="muted" style={{ fontSize: 13 }}>
                  {notificationStatus}
                </LexText>
              </View>
            ) : null}
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <View style={styles.premiumHeader}>
            <View style={[styles.premiumIcon, { backgroundColor: isPremium ? 'rgba(0,229,184,0.14)' : 'rgba(123,111,255,0.14)' }]}>
              <IconSymbol name="crown.fill" fallback="P" color={isPremium ? t.colors.accentTeal : t.colors.accentPurple} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <LexText variant="title">Premium</LexText>
              <LexText variant="muted" style={{ marginTop: 8 }}>
                {isPremium ? 'Premium learning tools are active on this device.' : 'Unlock deeper practice, tutor access, and progress insights.'}
              </LexText>
            </View>
            <View
              style={[
                styles.statusPill,
                {
                  borderColor: isPremium ? t.colors.accentTeal : t.colors.border,
                  backgroundColor: isPremium ? 'rgba(0,229,184,0.10)' : 'rgba(255,255,255,0.04)',
                },
              ]}
            >
              <LexText variant="label" style={{ color: isPremium ? t.colors.accentTeal : t.colors.muted, fontSize: 10 }}>
                {isPremium ? 'Active' : 'Free'}
              </LexText>
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <Button title={isPremium ? 'Manage Premium' : 'Open Premium'} onPress={() => router.push('/paywall')} />
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function SectionHeading({ icon, fallback, color, title }: { icon: string; fallback: string; color: string; title: string }) {
  const t = useTheme();
  return (
    <View style={styles.sectionHeading}>
      <View style={[styles.sectionGlyph, { backgroundColor: `${color}22`, borderColor: t.colors.border }]}>
        <IconSymbol name={icon} fallback={fallback} color={color} size={16} />
      </View>
      <LexText variant="title">{title}</LexText>
    </View>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={[styles.heroStat, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
      <LexText variant="label" style={{ color: t.colors.muted, fontSize: 9 }}>
        {label}
      </LexText>
      <LexText variant="title" style={{ marginTop: 3, fontSize: 13 }}>
        {value}
      </LexText>
    </View>
  );
}

function PreferenceRow({ icon, fallback, title, detail, color }: { icon: string; fallback: string; title: string; detail: string; color: string }) {
  const t = useTheme();
  return (
    <View style={[styles.preferenceRow, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.035)' }]}>
      <View style={[styles.preferenceIcon, { backgroundColor: `${color}1F` }]}>
        <IconSymbol name={icon} fallback={fallback} color={color} size={16} />
      </View>
      <View style={{ flex: 1 }}>
        <LexText variant="title" style={{ fontSize: 15 }}>
          {title}
        </LexText>
        <LexText variant="muted" style={{ marginTop: 2, fontSize: 13 }}>
          {detail}
        </LexText>
      </View>
    </View>
  );
}

function ToggleRow({
  icon,
  fallback,
  label,
  detail,
  value,
  onChange,
  color,
}: {
  icon: string;
  fallback: string;
  label: string;
  detail: string;
  value: boolean;
  onChange: (v: boolean) => void;
  color: string;
}) {
  const t = useTheme();
  return (
    <View style={[styles.toggleRow, { borderColor: t.colors.border, backgroundColor: value ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.025)' }]}>
      <View style={[styles.preferenceIcon, { backgroundColor: `${color}1F` }]}>
        <IconSymbol name={icon} fallback={fallback} color={color} size={15} />
      </View>
      <View style={{ flex: 1 }}>
        <LexText variant="title" style={{ fontSize: 15 }}>
          {label}
        </LexText>
        <LexText variant="muted" style={{ marginTop: 2, fontSize: 12, lineHeight: 17 }}>
          {detail}
        </LexText>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: 'rgba(255,255,255,0.10)', true: 'rgba(0,212,170,0.35)' }}
        thumbColor={value ? t.colors.accentTeal : 'rgba(255,255,255,0.45)'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, paddingBottom: TAB_BAR_BOTTOM },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerGlyph: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    marginTop: 16,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    padding: 16,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  heroIcon: { width: 44, height: 44, borderRadius: 18, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  heroStats: { flexDirection: 'row', gap: 8, marginTop: 15 },
  heroStat: { flex: 1, borderWidth: 1, borderRadius: 14, borderCurve: 'continuous', padding: 10 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionGlyph: { width: 32, height: 32, borderRadius: 12, borderCurve: 'continuous', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  goalPanel: { borderWidth: 1, borderRadius: 18, borderCurve: 'continuous', padding: 12 },
  goalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  goalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  goalChip: { minWidth: 45, alignItems: 'center', paddingHorizontal: 11, paddingVertical: 9, borderRadius: 999, borderWidth: 1 },
  preferenceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 18, borderCurve: 'continuous', padding: 12 },
  preferenceIcon: { width: 34, height: 34, borderRadius: 13, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 18, borderCurve: 'continuous', padding: 12 },
  premiumHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  premiumIcon: { width: 38, height: 38, borderRadius: 15, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  statusPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  inlineStatus: { borderWidth: 1, borderRadius: 14, borderCurve: 'continuous', padding: 12 },
});
