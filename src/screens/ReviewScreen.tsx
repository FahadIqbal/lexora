import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  Easing,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { GlowCard } from '../components/GlowCard';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import type { Word } from '../domain/schema';
import { useAppStore } from '../store/useAppStore';
import { repos } from '../data/repositories';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { useShallow } from 'zustand/react/shallow';
import { TAB_BAR_BOTTOM } from '../theme';
import { hapticSelection } from '../utils/haptics';

type Quality = 0 | 1 | 2 | 3 | 5;

export function ReviewScreen() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);
  const dueIds = useAppStore(useShallow((s) => s.getDueWordIds()));
  const wordProgress = useAppStore((s) => s.wordProgress);
  const recordReview = useAppStore((s) => s.recordReview);
  const practiceIds = useMemo(() => {
    return Object.values(wordProgress)
      .filter((progress) => progress.status !== 'new')
      .sort((a, b) => (b.lastReviewedAt ?? b.firstSeenAt ?? 0) - (a.lastReviewedAt ?? a.firstSeenAt ?? 0))
      .map((progress) => progress.wordId)
      .slice(0, 12);
  }, [wordProgress]);
  const activeIds = dueIds.length ? dueIds : practiceIds;
  const isPracticeMode = !dueIds.length && practiceIds.length > 0;

  const { data: due, loading } = useAsyncResource(async () => {
    const ids = activeIds.slice(0, 20);
    const words = await Promise.all(ids.map((id) => repos.words.getById(id)));
    return words.filter(Boolean) as Word[];
  }, [activeIds.join('|')]);

  const [phase, setPhase] = useState<'intro' | 'review' | 'done'>('intro');
  const [i, setI] = useState(0);
  const [counts, setCounts] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const word = (due ?? [])[i];
  const total = (due ?? []).length;

  return (
    <Screen>
      <View style={[styles.wrap, { backgroundColor: t.colors.bg }]}>
        {phase === 'intro' && (
          <ScrollView contentContainerStyle={{ paddingBottom: TAB_BAR_BOTTOM }} showsVerticalScrollIndicator={false}>
            <LexText variant="h2">Spaced Review</LexText>
            <LexText variant="muted" style={{ marginTop: 6 }}>
              Review due cards first, or run a quick refresher when your queue is clear.
            </LexText>

            <GlowCard style={{ marginTop: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={[styles.reviewGlyph, { borderColor: t.colors.border, backgroundColor: 'rgba(0,229,184,0.10)' }]}>
                  <LexText variant="h3" style={{ color: t.colors.accentTeal }}>
                    {isPracticeMode ? 'P' : 'R'}
                  </LexText>
                </View>
                <View style={{ flex: 1 }}>
                  <LexText variant="h3">
                    {total > 0 ? (isPracticeMode ? `${total} refresher cards` : `${total} cards due`) : 'No study cards yet'}
                  </LexText>
                  <LexText variant="muted" style={{ marginTop: 4, fontSize: 13 }}>
                    {total > 0
                      ? isPracticeMode
                        ? 'Your due queue is clear. Practice recent words to keep recall warm.'
                        : 'Rate each card honestly. Lexora schedules your next review.'
                      : 'Learn or add words first, then review becomes your memory engine.'}
                  </LexText>
                </View>
              </View>

              {total > 0 && (
                <>
                  <View style={[styles.ratingGuide, { borderColor: t.colors.border }]}>
                    {[
                      { mark: 'A', label: 'Again', desc: 'Completely forgot', color: '#FF6B9D' },
                      { mark: 'H', label: 'Hard', desc: 'Struggled', color: '#FFB347' },
                      { mark: 'G', label: 'Good', desc: 'Recalled with effort', color: '#00E5B8' },
                      { mark: 'E', label: 'Easy', desc: 'Remembered instantly', color: '#5BA8FF' },
                    ].map((r) => (
                      <View key={r.label} style={styles.ratingRow}>
                        <View style={[styles.ratingMark, { backgroundColor: `${r.color}22` }]}>
                          <LexText variant="label" style={{ color: r.color, fontSize: 10 }}>{r.mark}</LexText>
                        </View>
                        <LexText variant="title" style={{ color: r.color, width: 52, fontSize: 14 }}>
                          {r.label}
                        </LexText>
                        <LexText variant="muted" style={{ flex: 1, fontSize: 13 }}>{r.desc}</LexText>
                      </View>
                    ))}
                  </View>
                  <View style={{ marginTop: 16 }}>
                    <Button
                      title={loading ? 'Loading...' : isPracticeMode ? 'Start refresher' : 'Start review'}
                      onPress={() => setPhase('review')}
                      disabled={loading || !total}
                    />
                  </View>
                </>
              )}
              {!total ? (
                <View style={{ marginTop: 16 }}>
                  <Button title="Learn words first" onPress={() => router.push('/(tabs)/learn')} />
                </View>
              ) : null}
            </GlowCard>
          </ScrollView>
        )}

        {phase === 'review' && word && (
          <ReviewCard
            word={word}
            index={i}
            total={total}
            onRate={(quality) => {
              if (quality <= 1) setCounts((s) => ({ ...s, again: s.again + 1 }));
              else if (quality === 2) setCounts((s) => ({ ...s, hard: s.hard + 1 }));
              else if (quality === 3) setCounts((s) => ({ ...s, good: s.good + 1 }));
              else setCounts((s) => ({ ...s, easy: s.easy + 1 }));

              addXp(quality >= 3 ? 10 : 5);
              recordReview(word.id, quality);

              const ni = i + 1;
              if (ni >= total) setPhase('done');
              else setI(ni);
            }}
          />
        )}

        {phase === 'done' && (
          <ReviewComplete
            counts={counts}
            onHome={() => {
              setI(0);
              setCounts({ again: 0, hard: 0, good: 0, easy: 0 });
              setPhase('intro');
            }}
          />
        )}
      </View>
    </Screen>
  );
}

function ReviewCard({
  word,
  index,
  total,
  onRate,
}: {
  word: Word;
  index: number;
  total: number;
  onRate: (q: Quality) => void;
}) {
  const t = useTheme();
  const flipped = useSharedValue(0);
  const [revealed, setReveal] = useState(false);

  // Reset card state when moving to next word
  useEffect(() => {
    flipped.value = 0;
    setReveal(false);
  }, [word.id]);

  const progressFill = useSharedValue(index / total);
  useEffect(() => {
    progressFill.value = withTiming(index / total, { duration: 350 });
  }, [index, total]);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressFill.value * 100}%`,
  }));

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flipped.value, [0, 1], [0, 180])}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flipped.value, [0, 1], [180, 360])}deg` },
    ],
    backfaceVisibility: 'hidden',
  }));

  const flip = () => {
    hapticSelection();
    const next = flipped.value ? 0 : 1;
    flipped.value = withSpring(next, { damping: 20, stiffness: 200 });
    if (next === 1) setReveal(true);
  };

  const ratingButtons: { quality: Quality; label: string; emoji: string; colors: [string, string] }[] = [
    { quality: 0, label: 'Again', emoji: '🔴', colors: ['rgba(255,107,157,0.25)', 'rgba(255,107,157,0.12)'] },
    { quality: 2, label: 'Hard', emoji: '🟡', colors: ['rgba(255,179,71,0.25)', 'rgba(255,179,71,0.12)'] },
    { quality: 3, label: 'Good', emoji: '🟢', colors: ['rgba(0,229,184,0.25)', 'rgba(0,229,184,0.12)'] },
    { quality: 5, label: 'Easy', emoji: '💙', colors: ['rgba(91,168,255,0.25)', 'rgba(91,168,255,0.12)'] },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[StyleSheet.absoluteFill, progressStyle]}>
          <LinearGradient
            colors={[t.colors.accentPurple, t.colors.accentTeal]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.duration(300)}
        style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}
      >
        <LexText variant="label" style={{ color: t.colors.muted }}>
          Review
        </LexText>
        <LexText variant="muted" style={{ fontSize: 13 }}>
          {index + 1} / {total}
        </LexText>
      </Animated.View>

      {/* Card */}
      <View style={{ flex: 1, marginTop: 12 }}>
        <Pressable onPress={flip} style={{ flex: 1 }}>
          <View
            style={[
              styles.reviewCard,
              { backgroundColor: t.colors.surface, borderColor: t.colors.border },
            ]}
          >
            <LinearGradient
              colors={['rgba(123,111,255,0.18)', 'rgba(0,229,184,0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Front */}
            <Animated.View
              style={[StyleSheet.absoluteFill, frontStyle, styles.cardFace]}
            >
              <LexText variant="h2" style={{ fontSize: 44, textAlign: 'center' }}>
                {word.word}
              </LexText>
              <LexText
                variant="muted"
                style={{ marginTop: 10, color: t.colors.accentPink, fontStyle: 'italic', textAlign: 'center' }}
              >
                {word.phonetic}
              </LexText>
              <LexText variant="label" style={{ marginTop: 24, color: t.colors.muted, textAlign: 'center' }}>
                Tap to flip
              </LexText>
            </Animated.View>

            {/* Back */}
            <Animated.View style={[StyleSheet.absoluteFill, backStyle, styles.cardFace]}>
              <View style={{ gap: 14, width: '100%' }}>
                <View>
                  <LexText variant="label" style={{ color: t.colors.accentPurple }}>MEANING</LexText>
                  <LexText variant="body" style={{ marginTop: 6, lineHeight: 22 }}>
                    {word.definition}
                  </LexText>
                </View>
                {word.example_sentences[0]?.sentence ? (
                  <View>
                    <LexText variant="label" style={{ color: t.colors.accentTeal }}>EXAMPLE</LexText>
                    <LexText variant="muted" style={{ marginTop: 6, fontStyle: 'italic', lineHeight: 20 }}>
                      "{word.example_sentences[0].sentence}"
                    </LexText>
                  </View>
                ) : null}
              </View>
              <LexText variant="label" style={{ marginTop: 20, color: t.colors.muted, textAlign: 'center' }}>
                How well did you remember?
              </LexText>
            </Animated.View>
          </View>
        </Pressable>
      </View>

      {/* Rating buttons */}
      <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.ratingArea}>
        {revealed ? (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {ratingButtons.slice(0, 2).map((rb) => (
                <RatingButton key={rb.quality} {...rb} onPress={() => onRate(rb.quality)} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {ratingButtons.slice(2).map((rb) => (
                <RatingButton key={rb.quality} {...rb} onPress={() => onRate(rb.quality)} />
              ))}
            </View>
          </View>
        ) : (
          <Button title="Show answer" onPress={flip} />
        )}
      </Animated.View>
    </View>
  );
}

function RatingButton({
  emoji,
  label,
  colors,
  onPress,
}: {
  emoji: string;
  label: string;
  colors: [string, string];
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => {
        hapticSelection();
        onPress();
      }}
      style={({ pressed }) => [
        styles.ratingBtn,
        { borderColor: t.colors.border, transform: [{ scale: pressed ? 0.95 : 1 }] },
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LexText style={{ fontSize: 20 }}>{emoji}</LexText>
      <LexText variant="title" style={{ marginTop: 4, fontSize: 13 }}>{label}</LexText>
    </Pressable>
  );
}

function ReviewComplete({
  counts,
  onHome,
}: {
  counts: { again: number; hard: number; good: number; easy: number };
  onHome: () => void;
}) {
  const t = useTheme();
  const total = Math.max(1, counts.again + counts.hard + counts.good + counts.easy);
  const successRate = Math.round(((counts.good + counts.easy) / total) * 100);
  const guidance =
    successRate >= 85
      ? 'Your recall is strong. A short game will turn it into speed.'
      : successRate >= 60
      ? 'Good progress. Replay difficult cards later today for a stronger curve.'
      : 'The weak spots are visible now. Slow review will help more than speed.';

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: TAB_BAR_BOTTOM }}
      showsVerticalScrollIndicator={false}
    >
      <GlowCard colors={['rgba(0,229,184,0.55)', 'rgba(123,111,255,0.35)']}>
        <LexText style={{ fontSize: 44, textAlign: 'center' }}>✅</LexText>
        <LexText variant="h2" style={{ textAlign: 'center', marginTop: 10 }}>
          Review done!
        </LexText>
        <LexText variant="muted" style={{ textAlign: 'center', marginTop: 6 }}>
          {total} cards · {successRate}% success rate
        </LexText>

        <View style={[styles.resultPieRow, { marginTop: 18 }]}>
          <RatingPie {...counts} />
          <View style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
            {[
              { label: 'Again', count: counts.again, color: '#FF6B9D' },
              { label: 'Hard', count: counts.hard, color: '#FFB347' },
              { label: 'Good', count: counts.good, color: '#00E5B8' },
              { label: 'Easy', count: counts.easy, color: '#5BA8FF' },
            ].map((r) => (
              <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <LexText variant="muted" style={{ fontSize: 13 }}>{r.label}</LexText>
                <LexText variant="title" style={{ color: r.color, fontSize: 13 }}>
                  {r.count}
                </LexText>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.reviewNextPanel, { borderColor: t.colors.border }]}>
          <LexText variant="label" style={{ color: t.colors.muted }}>
            Coach note
          </LexText>
          <LexText variant="muted" style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}>
            {guidance}
          </LexText>
        </View>

        <View style={{ marginTop: 16, gap: 10 }}>
          <Button
            title={successRate >= 85 ? 'Play recall game' : 'Back to review hub'}
            onPress={() => {
              if (successRate >= 85) router.push('/games/true-false');
              else onHome();
            }}
          />
          <Button
            title={successRate >= 85 ? 'Back to review hub' : 'Learn new words'}
            variant="ghost"
            onPress={() => {
              if (successRate >= 85) onHome();
              else router.push('/(tabs)/learn');
            }}
          />
        </View>
      </GlowCard>
    </ScrollView>
  );
}

function RatingPie({ again, hard, good, easy }: { again: number; hard: number; good: number; easy: number }) {
  const t = useTheme();
  const total = Math.max(1, again + hard + good + easy);
  const size = 110;
  const r = 40;
  const c = 2 * Math.PI * r;

  const segs = [
    { v: again, color: '#FF6B9D' },
    { v: hard, color: '#FFB347' },
    { v: good, color: '#00E5B8' },
    { v: easy, color: '#5BA8FF' },
  ];

  let acc = 0;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={10}
        fill="none"
      />
      {segs.map((s, idx) => {
        const frac = s.v / total;
        const dash = c * frac;
        const offset = c * (1 - acc - frac);
        acc += frac;
        if (!s.v) return null;
        return (
          <Circle
            key={idx}
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={s.color}
            strokeWidth={10}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${dash} ${c}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18 },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  reviewCard: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
  },
  reviewGlyph: {
    width: 54,
    height: 54,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFace: {
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingArea: {
    marginTop: 14,
    marginBottom: 8,
  },
  ratingBtn: {
    flex: 1,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ratingGuide: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginTop: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingMark: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultPieRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  reviewNextPanel: {
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginTop: 16,
  },
});
