import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { AppHeader } from '../components/AppHeader';
import { useTheme } from '../theme/ThemeProvider';
import { useAppStore } from '../store/useAppStore';
import { addDays } from 'date-fns';
import { isoDate } from '../utils/date';
import { useShallow } from 'zustand/react/shallow';
import { TAB_BAR_BOTTOM } from '../theme';
import { hapticSelection } from '../utils/haptics';

export function ProgressScreen() {
  const t = useTheme();
  const streak = useAppStore((s) => s.streakCurrent);
  const streakLongest = useAppStore((s) => s.streakLongest);
  const xpToday = useAppStore((s) => s.xpToday);
  const xpTotal = useAppStore((s) => s.xpTotal);
  const dailyGoalWords = useAppStore((s) => s.user.dailyGoalWords);
  const wordProgress = useAppStore((s) => s.wordProgress);
  const dailyStats = useAppStore((s) => s.dailyStats);
  const heatmap = useAppStore(useShallow((s) => s.getHeatmap30()));
  const weeklyWords = useAppStore(useShallow((s) => s.getWeeklyWordsLearned()));
  const dueIds = useAppStore(useShallow((s) => s.getDueWordIds()));

  const level = Math.max(1, Math.floor(xpTotal / 600) + 1);
  const xpToNext = level * 600 - xpTotal;
  const ringP = 1 - xpToNext / 600;

  const weeklyAccuracy = useMemo(() => {
    const today = isoDate();
    const out: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(new Date(`${today}T00:00:00.000Z`), -i).toISOString().slice(0, 10);
      const s = dailyStats[d];
      if (!s || !s.accuracyTotal) out.push(0);
      else out.push(Math.min(1, s.accuracyCorrect / s.accuracyTotal));
    }
    return out;
  }, [dailyStats]);

  const totals = useMemo(() => {
    const all = Object.values(wordProgress);
    const seen = all.length;
    const mastered = all.filter((p) => p.status === 'mastered').length;
    const inReview = all.filter((p) => p.status === 'reviewing' || p.status === 'learning').length;
    const accCorrect = Object.values(dailyStats).reduce((a, s) => a + (s.accuracyCorrect ?? 0), 0);
    const accTotal = Object.values(dailyStats).reduce((a, s) => a + (s.accuracyTotal ?? 0), 0);
    const accuracy = accTotal ? Math.round((accCorrect / accTotal) * 100) : 0;
    return { seen, mastered, inReview, accuracy };
  }, [wordProgress, dailyStats]);

  const dueCount = dueIds.length;

  const skillMastery = useMemo(
    () => [
      {
        label: 'Vocabulary',
        value: Math.min(100, Math.round((totals.seen / Math.max(1, 120)) * 100)),
        color: t.colors.accentPurple,
      },
      {
        label: 'Recall',
        value: totals.accuracy,
        color: t.colors.accentTeal,
      },
      {
        label: 'Consistency',
        value: Math.min(100, Math.round((streak / Math.max(1, 14)) * 100)),
        color: t.colors.accentAmber,
      },
      {
        label: 'Mastery',
        value: totals.seen ? Math.round((totals.mastered / totals.seen) * 100) : 0,
        color: t.colors.accentPink,
      },
    ],
    [streak, t.colors.accentAmber, t.colors.accentPink, t.colors.accentPurple, t.colors.accentTeal, totals]
  );

  const weeklyTotal = weeklyWords.reduce((sum, value) => sum + value, 0);
  const activeDays = heatmap.filter((value) => value > 0).length;
  const momentumScore = Math.min(
    100,
    Math.round(Math.min(1, streak / 7) * 38 + Math.min(1, weeklyTotal / Math.max(1, dailyGoalWords * 4)) * 34 + Math.min(1, totals.accuracy / 85) * 28)
  );
  const focus = useMemo(() => {
    if (dueCount > 0) {
      return {
        title: `Review ${dueCount} due ${dueCount === 1 ? 'card' : 'cards'}`,
        body: 'Your memory curve has work waiting. Clear reviews before adding new words.',
        action: 'Start review',
        route: '/(tabs)/review' as const,
        accent: t.colors.accentPink,
      };
    }

    if (!totals.seen) {
      return {
        title: 'Start your first learning loop',
        body: 'Learn a small set, then let spaced review take over.',
        action: 'Learn words',
        route: '/(tabs)/learn' as const,
        accent: t.colors.accentTeal,
      };
    }

    if (totals.accuracy < 70) {
      return {
        title: 'Strengthen recall',
        body: 'Your accuracy has room to climb. A short review session will pay off quickly.',
        action: 'Review now',
        route: '/(tabs)/review' as const,
        accent: t.colors.accentAmber,
      };
    }

    return {
      title: 'Convert knowledge into speed',
      body: 'Your accuracy is healthy. A game will build faster recall without adding friction.',
      action: 'Play a game',
      route: '/(tabs)/games' as const,
      accent: t.colors.accentPurple,
    };
  }, [dueCount, t.colors.accentAmber, t.colors.accentPink, t.colors.accentPurple, t.colors.accentTeal, totals.accuracy, totals.seen]);

  const achievements = useMemo(
    () => [
      { slug: 'streak-7', name: '7-Day Streak', icon: '🔥', unlocked: streak >= 7, progress: Math.min(1, streak / 7) },
      { slug: 'words-100', name: '100 Words', icon: '📚', unlocked: totals.seen >= 100, progress: Math.min(1, totals.seen / 100) },
      { slug: 'perfect-week', name: 'Perfect Week', icon: '🎯', unlocked: weeklyAccuracy.every((a) => a >= 0.9), progress: weeklyAccuracy.filter((a) => a >= 0.9).length / 7 },
      { slug: 'master-25', name: '25 Mastered', icon: '💎', unlocked: totals.mastered >= 25, progress: Math.min(1, totals.mastered / 25) },
    ],
    [streak, totals.mastered, totals.seen, weeklyAccuracy]
  );

  return (
    <Screen>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <AppHeader
          eyebrow="Growth"
          title="Progress"
          subtitle="Your momentum, mastery, and next best move."
          icon="chart.bar.fill"
          fallback="P"
          accent={t.colors.accentTeal}
          metric={`L${level}`}
        />

        <Animated.View entering={FadeInDown.duration(420)} style={styles.insightCard}>
          <LinearGradient
            colors={['rgba(123,111,255,0.24)', 'rgba(0,229,184,0.10)', 'rgba(255,179,71,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.insightHeader}>
            <View style={{ flex: 1 }}>
              <LexText variant="label" style={{ color: focus.accent }}>
                Momentum insight
              </LexText>
              <LexText variant="h3" style={{ marginTop: 6 }}>
                {focus.title}
              </LexText>
              <LexText variant="muted" style={{ marginTop: 6, fontSize: 13 }}>
                {focus.body}
              </LexText>
            </View>
            <MomentumRing score={momentumScore} color={focus.accent} />
          </View>
          <View style={styles.insightStats}>
            <InsightMetric value={String(activeDays)} label="active days" color={t.colors.accentTeal} />
            <InsightMetric value={String(weeklyTotal)} label="week words" color={t.colors.accentPurple} />
            <InsightMetric value={String(dueCount)} label="due now" color={dueCount ? t.colors.accentPink : t.colors.muted} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${focus.action}. ${focus.title}`}
            onPress={() => {
              hapticSelection();
              router.push(focus.route);
            }}
            style={({ pressed }) => [
              styles.insightAction,
              { borderColor: `${focus.accent}55`, backgroundColor: `${focus.accent}16`, opacity: pressed ? 0.84 : 1 },
            ]}
          >
            <LexText variant="title" style={{ color: focus.accent, fontSize: 14 }}>
              {focus.action}
            </LexText>
            <LexText variant="title" style={{ color: focus.accent, fontSize: 18 }}>
              →
            </LexText>
          </Pressable>
        </Animated.View>

        <Card style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <LexText variant="title">Level & XP</LexText>
              <LexText variant="h2" style={{ marginTop: 8 }}>
                Level {level} · Wordsmith
              </LexText>
              <LexText variant="muted" style={{ marginTop: 6 }}>
                {xpTotal} XP total · {xpToday} XP today
              </LexText>
              <LexText variant="muted" style={{ marginTop: 6 }}>
                {xpToNext} XP to next level
              </LexText>
            </View>
            <XpRing progress={ringP} />
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <LexText variant="title">Streak</LexText>
          <View style={{ height: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <LexText variant="h2" style={{ color: t.colors.accentAmber }}>
              🔥 {streak}
            </LexText>
            <LexText variant="muted">longest {streakLongest}</LexText>
          </View>
          <View style={{ height: 12 }} />
          <Heatmap30Days intensities={heatmap} />
        </Card>

        <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <MetricCard label="Total words seen" value={String(totals.seen)} />
          <MetricCard label="Mastered" value={String(totals.mastered)} />
          <MetricCard label="In review" value={String(totals.inReview)} />
          <MetricCard label="Accuracy" value={`${totals.accuracy}%`} />
        </View>

        <Card style={{ marginTop: 12 }}>
          <LexText variant="title">Skill Mastery</LexText>
          <LexText variant="muted" style={{ marginTop: 6 }}>
            A cleaner snapshot of your learning balance.
          </LexText>
          <View style={{ marginTop: 12, gap: 10 }}>
            {skillMastery.map((skill) => (
              <SkillBar key={skill.label} {...skill} />
            ))}
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <LexText variant="title">Weekly activity</LexText>
          <LexText variant="muted" style={{ marginTop: 6 }}>
            Bars = words learned · Line = accuracy
          </LexText>
          <View style={{ height: 12 }} />
          <WeeklyComboChart words={weeklyWords} accuracy={weeklyAccuracy} />
        </Card>

        <Card style={{ marginTop: 12 }}>
          <LexText variant="title">Achievements</LexText>
          <View style={styles.achGrid}>
            {achievements.map((a) => (
              <Pressable
                key={a.slug}
                accessibilityRole="button"
                accessibilityState={{ selected: a.unlocked }}
                accessibilityLabel={`${a.name}. ${a.unlocked ? 'Unlocked' : `${Math.round(a.progress * 100)} percent complete`}.`}
                onPress={hapticSelection}
                style={[
                  styles.ach,
                  {
                    borderColor: a.unlocked ? 'rgba(255,179,71,0.35)' : 'rgba(255,255,255,0.08)',
                    backgroundColor: a.unlocked ? 'rgba(255,179,71,0.10)' : 'rgba(255,255,255,0.03)',
                    opacity: a.unlocked ? 1 : 0.55,
                  },
                ]}
              >
                <LexText style={{ fontSize: 20 }}>{a.icon}</LexText>
                <LexText variant="title" style={{ fontSize: 12, marginTop: 6 }}>
                  {a.name}
                </LexText>
                <View style={styles.achTrack}>
                  <AnimatedFill progress={a.progress} color={a.unlocked ? t.colors.accentAmber : 'rgba(255,255,255,0.22)'} />
                </View>
              </Pressable>
            ))}
          </View>
        </Card>

        <View style={{ marginTop: 14 }}>
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function MomentumRing({ score, color }: { score: number; color: string }) {
  const size = 70;
  const r = 25;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  const dashOffset = c * (1 - clamped / 100);

  return (
    <View style={styles.momentumRing}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.10)" strokeWidth={7} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.momentumText}>
        <LexText variant="title" style={{ color, fontSize: 14 }}>
          {clamped}
        </LexText>
      </View>
    </View>
  );
}

function InsightMetric({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.insightMetric}>
      <LexText variant="h3" style={{ color, fontSize: 18, textAlign: 'center' }}>
        {value}
      </LexText>
      <LexText variant="label" style={{ fontSize: 9, marginTop: 2, textAlign: 'center' }}>
        {label}
      </LexText>
    </View>
  );
}

function XpRing({ progress }: { progress: number }) {
  const t = useTheme();
  const size = 92;
  const r = 34;
  const c = 2 * Math.PI * r;
  const dashOffset = c * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={8} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={t.colors.accentTeal}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={[styles.metric, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}>
      <LexText variant="label">{label}</LexText>
      <LexText variant="h2" style={{ fontSize: 24, marginTop: 8 }}>
        {value}
      </LexText>
    </View>
  );
}

function SkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  const t = useTheme();
  const clamped = Math.max(0, Math.min(100, value));
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(clamped / 100, { duration: 720, easing: Easing.out(Easing.cubic) });
  }, [clamped, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.round(fill.value * 100)}%`,
  }));

  return (
    <View style={{ gap: 5 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <LexText variant="muted" style={{ fontSize: 13 }}>
          {label}
        </LexText>
        <LexText variant="label" style={{ color, fontSize: 11 }}>
          {clamped}%
        </LexText>
      </View>
      <View style={[styles.skillTrack, { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
        <Animated.View style={[styles.skillFill, { backgroundColor: color }, fillStyle]} />
      </View>
    </View>
  );
}

function AnimatedFill({ progress, color }: { progress: number; color: string }) {
  const fill = useSharedValue(0);
  const clamped = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    fill.value = withTiming(clamped, { duration: 680, easing: Easing.out(Easing.cubic) });
  }, [clamped, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.round(fill.value * 100)}%`,
  }));

  return <Animated.View style={[styles.achFill, { backgroundColor: color }, fillStyle]} />;
}

function Heatmap30Days({ intensities }: { intensities: number[] }) {
  const t = useTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {intensities.map((v, i) => (
        <View
          key={i}
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            backgroundColor:
              v === 0
                ? 'rgba(255,255,255,0.05)'
                : v === 1
                  ? 'rgba(108,99,255,0.18)'
                  : v === 2
                    ? 'rgba(108,99,255,0.28)'
                    : v === 3
                      ? 'rgba(0,212,170,0.26)'
                      : 'rgba(0,212,170,0.36)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        />
      ))}
    </View>
  );
}

function WeeklyComboChart({ words, accuracy }: { words: number[]; accuracy: number[] }) {
  const t = useTheme();
  const w = 320;
  const h = 120;
  const pad = 10;
  const maxW = Math.max(...words, 1);

  const barGap = 8;
  const barW = (w - pad * 2 - barGap * (words.length - 1)) / words.length;

  const pts = accuracy.map((a, i) => {
    const x = pad + i * (barW + barGap) + barW / 2;
    const y = pad + (1 - a) * (h - pad * 2);
    return { x, y };
  });

  return (
    <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
      {/* bars */}
      {words.map((v, i) => {
        const bh = (v / maxW) * (h - pad * 2);
        const x = pad + i * (barW + barGap);
        const y = h - pad - bh;
        return <Rect key={i} x={x} y={y} width={barW} height={Math.max(6, bh)} rx={6} fill="rgba(108,99,255,0.28)" />;
      })}
      {/* line */}
      {pts.map((p, i) => {
        const n = pts[i + 1];
        if (!n) return null;
        return <Line key={i} x1={p.x} y1={p.y} x2={n.x} y2={n.y} stroke={t.colors.accentTeal} strokeWidth={3} />;
      })}
      {pts.map((p, i) => (
        <Circle key={`c-${i}`} cx={p.x} cy={p.y} r={4} fill={t.colors.accentTeal} />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, paddingBottom: TAB_BAR_BOTTOM },
  insightCard: {
    minHeight: 244,
    marginTop: 16,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    padding: 18,
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  insightStats: { flexDirection: 'row', gap: 8, marginTop: 16 },
  insightMetric: {
    flex: 1,
    minHeight: 62,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  insightAction: {
    minHeight: 46,
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 15,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  momentumRing: { width: 70, height: 70, alignItems: 'center', justifyContent: 'center' },
  momentumText: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metric: { width: '48%', borderWidth: 1, borderRadius: 16, padding: 14 },
  skillTrack: { height: 5, borderRadius: 999, overflow: 'hidden' },
  skillFill: { height: '100%', borderRadius: 999 },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  ach: { width: '48%', minHeight: 106, borderWidth: 1, borderRadius: 16, padding: 12 },
  achTrack: {
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 10,
  },
  achFill: { height: '100%', borderRadius: 999 },
});
