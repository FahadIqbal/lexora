import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LexText } from '../../../components/LexText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../theme/ThemeProvider';
import { useAppStore } from '../../../store/useAppStore';

const GOALS = [5, 10, 15, 20] as const;
const WHY = [
  { slug: 'ielts', label: 'IELTS', emoji: '🌐' },
  { slug: 'career', label: 'Career', emoji: '💼' },
  { slug: 'reading', label: 'Reading', emoji: '📖' },
  { slug: 'travel', label: 'Travel', emoji: '🧳' },
  { slug: 'fun', label: 'Fun', emoji: '✨' },
];

export function GoalsStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const t = useTheme();
  const dailyGoalWords = useAppStore((s) => s.user.dailyGoalWords);
  const learningWhy = useAppStore((s) => s.learningWhy);
  const setDailyGoalWords = useAppStore((s) => s.setDailyGoalWords);
  const toggleLearningWhy = useAppStore((s) => s.toggleLearningWhy);

  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(520).springify().damping(16)}>
          <LexText variant="h2">Set your daily goal</LexText>
          <LexText variant="muted" style={{ marginTop: 6 }}>
            Pick a pace you can keep. Consistency beats intensity.
          </LexText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(110).duration(520)} style={{ marginTop: 18 }}>
          <Card>
            <LexText variant="title">Words per day</LexText>
            <View style={styles.goalRow}>
              {GOALS.map((n) => {
                const active = n === dailyGoalWords;
                return (
                  <View
                    key={n}
                    style={[
                      styles.goalChip,
                      {
                        borderColor: active ? t.colors.accentTeal : t.colors.border,
                        backgroundColor: active ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.04)',
                      },
                    ]}
                    onTouchEnd={() => setDailyGoalWords(n)}
                  >
                    <LexText variant="title" style={{ textAlign: 'center' }}>
                      {n}
                    </LexText>
                    <LexText variant="muted" style={{ fontSize: 11, textAlign: 'center' }}>
                      words
                    </LexText>
                  </View>
                );
              })}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(520)} style={{ marginTop: 12 }}>
          <Card>
            <LexText variant="title">Why are you learning?</LexText>
            <View style={styles.whyGrid}>
              {WHY.map((x) => {
                const active = learningWhy.includes(x.slug);
                return (
                  <View
                    key={x.slug}
                    style={[
                      styles.whyCard,
                      {
                        borderColor: active ? t.colors.accentPurple : t.colors.border,
                        backgroundColor: active ? 'rgba(108,99,255,0.12)' : 'rgba(255,255,255,0.04)',
                      },
                    ]}
                    onTouchEnd={() => toggleLearningWhy(x.slug)}
                  >
                    <LexText variant="h3" style={{ fontSize: 20 }}>
                      {x.emoji}
                    </LexText>
                    <LexText variant="title" style={{ marginTop: 6 }}>
                      {x.label}
                    </LexText>
                  </View>
                );
              })}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(520)} style={{ marginTop: 18, gap: 10 }}>
          <Button title="Continue" onPress={onNext} />
          <Button title="Back" variant="ghost" onPress={onBack} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: 18, justifyContent: 'center' },
  goalRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  goalChip: { flex: 1, borderWidth: 1, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 10 },
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  whyCard: { width: '48%', borderWidth: 1, borderRadius: 16, padding: 14 },
});

