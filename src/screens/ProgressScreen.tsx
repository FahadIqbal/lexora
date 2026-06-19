import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import { useAppStore } from '../store/useAppStore';
import { addDays } from 'date-fns';
import { isoDate } from '../utils/date';
import { useShallow } from 'zustand/react/shallow';
import { TAB_BAR_BOTTOM } from '../theme';

export function ProgressScreen() {
  const t = useTheme();
  const streak = useAppStore((s) => s.streakCurrent);
  const streakLongest = useAppStore((s) => s.streakLongest);
  const xpToday = useAppStore((s) => s.xpToday);
  const xpTotal = useAppStore((s) => s.xpTotal);
  const wordProgress = useAppStore((s) => s.wordProgress);
  const dailyStats = useAppStore((s) => s.dailyStats);
  const heatmap = useAppStore(useShallow((s) => s.getHeatmap30()));
  const weeklyWords = useAppStore(useShallow((s) => s.getWeeklyWordsLearned()));

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

  const achievements = [
    { slug: 'streak-7', name: '🔥 7-Day Streak', unlocked: true },
    { slug: 'words-100', name: '📚 100 Words', unlocked: true },
    { slug: 'perfect-week', name: '🎯 Perfect Week', unlocked: false },
    { slug: 'speed-demon', name: '⚡ Speed Demon', unlocked: false },
  ];

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

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <LexText variant="h2">Progress</LexText>
        <LexText variant="muted" style={{ marginTop: 6 }}>
          Your level, streaks, mastery, and weekly performance.
        </LexText>

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
                style={[
                  styles.ach,
                  {
                    borderColor: a.unlocked ? 'rgba(255,179,71,0.35)' : 'rgba(255,255,255,0.08)',
                    backgroundColor: a.unlocked ? 'rgba(255,179,71,0.10)' : 'rgba(255,255,255,0.03)',
                    opacity: a.unlocked ? 1 : 0.55,
                  },
                ]}
              >
                <LexText variant="body" style={{ fontSize: 12 }}>
                  {a.name}
                </LexText>
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
        <View style={[styles.skillFill, { width: `${clamped}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
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
  metric: { width: '48%', borderWidth: 1, borderRadius: 16, padding: 14 },
  skillTrack: { height: 5, borderRadius: 999, overflow: 'hidden' },
  skillFill: { height: '100%', borderRadius: 999 },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  ach: { width: '48%', borderWidth: 1, borderRadius: 16, padding: 12 },
});
