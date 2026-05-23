import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import { useAppStore } from '../store/useAppStore';

export function SettingsScreen() {
  const t = useTheme();
  const dailyGoalWords = useAppStore((s) => s.user.dailyGoalWords);
  const setDailyGoalWords = useAppStore((s) => s.setDailyGoalWords);

  const [dailyReminder, setDailyReminder] = useState(true);
  const [reviewDue, setReviewDue] = useState(true);
  const [streakRisk, setStreakRisk] = useState(true);
  const [achievements, setAchievements] = useState(true);

  const enableNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Notifications disabled', 'Please enable notifications in system settings.');
      return;
    }

    // Mock schedule: daily reminder at 9pm local time
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

    Alert.alert('Enabled', 'Notification permissions granted (scheduling is scaffolded).');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <LexText variant="h2">Settings</LexText>
        <LexText variant="muted" style={{ marginTop: 6 }}>
          Learning preferences, notifications, and premium (scaffolded).
        </LexText>

        <Card style={{ marginTop: 16 }}>
          <LexText variant="title">Learning preferences</LexText>
          <View style={{ marginTop: 10, gap: 8 }}>
            <View style={styles.row}>
              <LexText variant="muted">Daily goal</LexText>
              <View style={styles.goalRow}>
                {[5, 10, 15, 20, 30].map((n) => (
                  <View
                    key={n}
                    onTouchEnd={() => setDailyGoalWords(n)}
                    style={[
                      styles.goalChip,
                      {
                        borderColor: dailyGoalWords === n ? t.colors.accentTeal : t.colors.border,
                        backgroundColor: dailyGoalWords === n ? 'rgba(0,212,170,0.10)' : 'rgba(255,255,255,0.04)',
                      },
                    ]}
                  >
                    <LexText variant="body" style={{ fontSize: 12 }}>
                      {n}
                    </LexText>
                  </View>
                ))}
              </View>
            </View>
            <LexText variant="muted">Preferred study time: 9:00 PM (time picker coming next)</LexText>
            <LexText variant="muted">Sounds: On · Haptics: On</LexText>
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <LexText variant="title">Notifications</LexText>
          <View style={{ marginTop: 10, gap: 8 }}>
            <ToggleRow label="Daily reminder" value={dailyReminder} onChange={setDailyReminder} />
            <ToggleRow label="Review due" value={reviewDue} onChange={setReviewDue} />
            <ToggleRow label="Streak at risk" value={streakRisk} onChange={setStreakRisk} />
            <ToggleRow label="Achievements" value={achievements} onChange={setAchievements} />
            <View style={{ marginTop: 6 }}>
              <Button title="Enable notifications" onPress={enableNotifications} />
            </View>
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <LexText variant="title">Premium</LexText>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            Paywall UI is ready; RevenueCat wiring will be added after products + API key are ready.
          </LexText>
          <View style={{ marginTop: 12 }}>
            <Button title="Open Paywall" onPress={() => router.push('/paywall')} />
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const t = useTheme();
  return (
    <View style={styles.toggleRow}>
      <LexText variant="muted">{label}</LexText>
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
  wrap: { padding: 18, paddingBottom: 32 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { gap: 8 },
  goalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  goalChip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
});
