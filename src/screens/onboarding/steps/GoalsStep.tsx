import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { LexText } from '../../../components/LexText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../theme/ThemeProvider';
import { useAppStore } from '../../../store/useAppStore';
import { hapticSelection } from '../../../utils/haptics';

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

  const tap = () => {
    hapticSelection();
  };

  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(520).springify().damping(16)}>
          <LexText variant="h2">Set your daily goal</LexText>
          <LexText variant="muted" style={{ marginTop: 6 }}>
            Pick a pace that feels light enough to repeat. Lexora turns consistency into momentum.
          </LexText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(110).duration(520)} style={{ marginTop: 18 }}>
          <Card>
            <LexText variant="title">Words per day</LexText>
            <View style={styles.goalRow}>
              {GOALS.map((n) => {
                const active = n === dailyGoalWords;
                return (
                  <Pressable
                    key={n}
                    onPress={() => {
                      tap();
                      setDailyGoalWords(n);
                    }}
                    style={({ pressed }) => [
                      styles.goalChip,
                      {
                        borderColor: active ? t.colors.accentTeal : t.colors.border,
                        backgroundColor: active ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.04)',
                        opacity: pressed ? 0.82 : 1,
                      },
                    ]}
                  >
                    <LexText variant="title" style={{ textAlign: 'center' }}>
                      {n}
                    </LexText>
                    <LexText variant="muted" style={{ fontSize: 11, textAlign: 'center' }}>
                      words
                    </LexText>
                  </Pressable>
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
                  <Pressable
                    key={x.slug}
                    onPress={() => {
                      tap();
                      toggleLearningWhy(x.slug);
                    }}
                    style={({ pressed }) => [
                      styles.whyCard,
                      {
                        borderColor: active ? t.colors.accentPurple : t.colors.border,
                        backgroundColor: active ? 'rgba(108,99,255,0.12)' : 'rgba(255,255,255,0.04)',
                        opacity: pressed ? 0.86 : 1,
                      },
                    ]}
                  >
                    <LexText variant="h3" style={{ fontSize: 20 }}>
                      {x.emoji}
                    </LexText>
                    <LexText variant="title" style={{ marginTop: 6 }}>
                      {x.label}
                    </LexText>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(230).duration(520)} style={{ marginTop: 14 }}>
          <View style={[styles.rhythmCard, { borderColor: t.colors.border }]}>
            <LinearGradient
              colors={['rgba(0,229,184,0.14)', 'rgba(123,111,255,0.16)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <LexText variant="label" style={{ color: t.colors.accentTeal }}>
              Your rhythm
            </LexText>
            <View style={styles.rhythmRow}>
              <RhythmUnit value={`${dailyGoalWords}`} label="words" />
              <RhythmUnit value="4 min" label="session" />
              <RhythmUnit value="1 win" label="daily" />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).duration(520)} style={{ marginTop: 18, gap: 10 }}>
          <Button title="Continue" onPress={onNext} />
          <Button title="Back" variant="ghost" onPress={onBack} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function RhythmUnit({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.rhythmUnit}>
      <LexText variant="title" style={{ textAlign: 'center' }}>
        {value}
      </LexText>
      <LexText variant="label" style={{ fontSize: 9, marginTop: 2, textAlign: 'center' }}>
        {label}
      </LexText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, padding: 18, paddingBottom: 34, justifyContent: 'center' },
  goalRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  goalChip: { flex: 1, borderWidth: 1, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 10 },
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  whyCard: { width: '48%', borderWidth: 1, borderRadius: 16, padding: 14 },
  rhythmCard: {
    borderWidth: 1,
    borderRadius: 20,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: 16,
  },
  rhythmRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  rhythmUnit: {
    flex: 1,
    minHeight: 58,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});
