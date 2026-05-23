import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import type { Word } from '../domain/schema';
import { sm2Update } from '../utils/srs';
import { useAppStore } from '../store/useAppStore';
import { repos } from '../data/repositories';
import { useAsyncResource } from '../hooks/useAsyncResource';

export function ReviewScreen() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);
  const dueIds = useAppStore((s) => s.getDueWordIds());
  const recordReview = useAppStore((s) => s.recordReview);

  const { data: due, loading } = useAsyncResource(async () => {
    const ids = dueIds.slice(0, 20);
    const words = await Promise.all(ids.map((id) => repos.words.getById(id)));
    return words.filter(Boolean) as Word[];
  }, [dueIds.join('|')]);

  const [phase, setPhase] = useState<'intro' | 'review' | 'done'>('intro');
  const [i, setI] = useState(0);
  const [counts, setCounts] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const word = (due ?? [])[i];
  const total = (due ?? []).length;

  return (
    <Screen>
      <View style={[styles.wrap, { backgroundColor: t.colors.bg }]}>
        {phase === 'intro' ? (
          <>
            <LexText variant="h2">Review</LexText>
            <LexText variant="muted" style={{ marginTop: 6 }}>
              Spaced repetition (SM-2). Rate each card to schedule the next review.
            </LexText>
            <Card style={{ marginTop: 16 }}>
              <LexText variant="title">Cards due</LexText>
              <LexText variant="h3" style={{ marginTop: 6 }}>
                {total}
              </LexText>
              <View style={{ marginTop: 12 }}>
                <Button
                  title={loading ? 'Loading…' : 'Start review'}
                  onPress={() => setPhase('review')}
                  disabled={loading || !total}
                />
              </View>
            </Card>
          </>
        ) : null}



        {phase === 'review' && word ? (
          <ReviewCard
            word={word}
            index={i}
            total={total}
            onRate={(quality) => {
              // mock state; later: update user_word_progress in Supabase
              const next = sm2Update({ easeFactor: 2.5, interval: 1, repetitions: 0, quality });
              if (quality <= 1) setCounts((s) => ({ ...s, again: s.again + 1 }));
              else if (quality === 2) setCounts((s) => ({ ...s, hard: s.hard + 1 }));
              else if (quality === 3) setCounts((s) => ({ ...s, good: s.good + 1 }));
              else setCounts((s) => ({ ...s, easy: s.easy + 1 }));

              addXp(quality >= 3 ? 10 : 5);
              recordReview(word.id, quality);

              const ni = i + 1;
              if (ni >= total) {
                setPhase('done');
              } else {
                setI(ni);
              }

              // eslint-disable-next-line no-console
              console.log('Next review', next.nextReviewDate, next.interval, next.easeFactor);
            }}
          />
        ) : null}

        {phase === 'done' ? (
          <Card style={{ marginTop: 18 }}>
            <LexText variant="h2">Review complete</LexText>
            <LexText variant="muted" style={{ marginTop: 10 }}>
              Again {counts.again} · Hard {counts.hard} · Good {counts.good} · Easy {counts.easy}
            </LexText>
            <View style={{ marginTop: 14 }}>
              <RatingPie {...counts} />
            </View>
            <View style={{ marginTop: 14, gap: 10 }}>
              <Button title="Go Home" onPress={() => setPhase('intro')} />
            </View>
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18 },
});

function ReviewCard({
  word,
  index,
  total,
  onRate,
}: {
  word: Word;
  index: number;
  total: number;
  onRate: (q: 0 | 1 | 2 | 3 | 5) => void;
}) {
  const t = useTheme();
  const flipped = useSharedValue(0);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(flipped.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: 'hidden',
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(flipped.value, [0, 1], [180, 360])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  return (
    <View style={{ flex: 1 }}>
      <Animated.View entering={FadeInDown.duration(420)} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <LexText variant="title">Review · {total} due</LexText>
        <LexText variant="muted">
          {index + 1}/{total}
        </LexText>
      </Animated.View>

      <View style={{ flex: 1, marginTop: 14 }}>
        <Card style={{ flex: 1, borderRadius: 22, overflow: 'hidden' }}>
          <Animated.View
            style={[StyleSheet.absoluteFill, frontStyle, stylesCard.face, { justifyContent: 'center', alignItems: 'center' }]}
            onTouchEnd={() => (flipped.value = withSpring(flipped.value ? 0 : 1, { damping: 18, stiffness: 180 }))}
          >
            <LexText variant="h2" style={{ fontSize: 44, textAlign: 'center' }}>
              {word.word}
            </LexText>
            <LexText variant="muted" style={{ marginTop: 10, color: t.colors.accentPink, fontStyle: 'italic' }}>
              {word.phonetic}
            </LexText>
            <LexText variant="label" style={{ marginTop: 18 }}>
              Tap to flip
            </LexText>
          </Animated.View>

          <Animated.View
            style={[StyleSheet.absoluteFill, backStyle, stylesCard.face]}
            onTouchEnd={() => (flipped.value = withSpring(flipped.value ? 0 : 1, { damping: 18, stiffness: 180 }))}
          >
            <LexText variant="title">Meaning</LexText>
            <LexText variant="muted" style={{ marginTop: 8 }}>
              {word.definition}
            </LexText>
            <View style={{ height: 10 }} />
            <LexText variant="title">Example</LexText>
            <LexText variant="muted" style={{ marginTop: 8 }}>
              {word.example_sentences[0]?.sentence}
            </LexText>
          </Animated.View>
        </Card>
      </View>

      <Animated.View entering={FadeInDown.delay(120).duration(420)} style={{ marginTop: 14, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button title="🔴 Again" variant="ghost" onPress={() => onRate(0)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="🟡 Hard" variant="ghost" onPress={() => onRate(2)} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button title="🟢 Good" onPress={() => onRate(3)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="💙 Easy" onPress={() => onRate(5)} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function RatingPie({ again, hard, good, easy }: { again: number; hard: number; good: number; easy: number }) {
  const t = useTheme();
  const total = Math.max(1, again + hard + good + easy);
  const size = 120;
  const r = 44;
  const c = 2 * Math.PI * r;

  const segs = [
    { v: again, color: 'rgba(255,107,157,0.9)' },
    { v: hard, color: 'rgba(255,179,71,0.95)' },
    { v: good, color: 'rgba(0,212,170,0.95)' },
    { v: easy, color: 'rgba(108,99,255,0.95)' },
  ];

  let acc = 0;
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={10} fill="none" />
        {segs.map((s, idx) => {
          const frac = s.v / total;
          const dash = c * frac;
          const dashOffset = c * (1 - acc - frac);
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
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </Svg>
      <LexText variant="muted" style={{ marginTop: 8, textAlign: 'center', color: t.colors.muted }}>
        Breakdown of your ratings
      </LexText>
    </View>
  );
}

const stylesCard = StyleSheet.create({
  face: {
    padding: 18,
  },
});
