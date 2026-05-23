import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LexText } from '../../../components/LexText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../theme/ThemeProvider';
import { useAppStore } from '../../../store/useAppStore';
import { repos } from '../../../data/repositories';
import { useAsyncResource } from '../../../hooks/useAsyncResource';

function levelFromScore(score: number) {
  if (score <= 2) return 'A2';
  if (score <= 4) return 'B1';
  if (score <= 6) return 'B2';
  if (score <= 8) return 'C1';
  return 'C2';
}

export function PlacementStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const t = useTheme();
  const setProficiencyLevel = useAppStore((s) => s.setProficiencyLevel);

  const { data: base, loading } = useAsyncResource(() => repos.placement.list(), []);
  const questions = useMemo(() => {
    const q = base ?? [];
    return [...q, ...q, ...q, ...q].slice(0, 10);
  }, [base]);

  const [idx, setIdx] = useState(0);
  const [focused, setFocused] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const q = questions[idx];
  const done = idx >= questions.length;

  const ring = useSharedValue(0);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: withSpring(1) }] }));

  const swipeX = useSharedValue(0);
  const swipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeX.value }],
  }));

  const pan = Gesture.Pan()
    .onChange((e) => {
      swipeX.value = e.translationX * 0.2;
    })
    .onEnd((e) => {
      if (e.translationX > 60) {
        // right → next option
        setFocused((f) => Math.min(3, f + 1));
        swipeX.value = withTiming(0, { duration: 180 });
      } else if (e.translationX < -60) {
        // left → prev option
        setFocused((f) => Math.max(0, f - 1));
        swipeX.value = withTiming(0, { duration: 180 });
      } else {
        swipeX.value = withTiming(0, { duration: 180 });
      }
    });

  const confirm = () => {
    const isCorrect = focused === q.correctIndex;
    setCorrectCount((c) => c + (isCorrect ? 1 : 0));

    const nextIdx = idx + 1;
    ring.value = withTiming(nextIdx / questions.length, { duration: 280 });

    if (nextIdx >= questions.length) {
      const level = levelFromScore(correctCount + (isCorrect ? 1 : 0));
      setProficiencyLevel(level);
      onNext();
      return;
    }

    setIdx(nextIdx);
    setFocused(0);
  };

  // ring math
  const size = 72;
  const r = 30;
  const c = 2 * Math.PI * r;
  const progress = (idx + 1) / questions.length;
  const dashOffset = c * (1 - progress);

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
        <View style={styles.content}>
          <LexText variant="h2">Loading placement test…</LexText>
        </View>
      </View>
    );
  }

  if (done) return null;

  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(520).springify().damping(16)}>
          <LexText variant="h2">Let’s find your level</LexText>
          <LexText variant="muted" style={{ marginTop: 6 }}>
            Swipe left/right to change the highlighted choice. Tap “Confirm”.
          </LexText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(520)} style={{ marginTop: 18 }}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <LexText variant="title">Question</LexText>
              <Animated.View style={ringStyle}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                  <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={6} fill="none" />
                  <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke={t.colors.accentTeal}
                    strokeWidth={6}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${c} ${c}`}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  />
                </Svg>
                <View style={styles.ringText}>
                  <LexText variant="title" style={{ textAlign: 'center' }}>
                    {idx + 1}/{questions.length}
                  </LexText>
                </View>
              </Animated.View>
            </View>

            <View style={{ marginTop: 14 }}>
              <LexText variant="h2" style={{ fontSize: 34 }}>
                {q.word}
              </LexText>
            </View>

            <GestureDetector gesture={pan}>
              <Animated.View style={[styles.choicesWrap, swipeStyle]}>
                {q.choices.map((choice, i) => {
                  const active = i === focused;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.choice,
                        {
                          borderColor: active ? t.colors.accentPurple : t.colors.border,
                          backgroundColor: active ? 'rgba(108,99,255,0.14)' : 'rgba(255,255,255,0.04)',
                        },
                      ]}
                    >
                      <LexText variant="body" style={{ color: active ? t.colors.text : 'rgba(240,238,255,0.75)' }}>
                        {choice}
                      </LexText>
                    </View>
                  );
                })}
              </Animated.View>
            </GestureDetector>

            <View style={{ marginTop: 14, gap: 10 }}>
              <Button title="Confirm" onPress={confirm} />
              <Button title="Back" variant="ghost" onPress={onBack} />
            </View>
          </Card>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: 18, justifyContent: 'center' },
  ringText: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choicesWrap: { marginTop: 12, gap: 10 },
  choice: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
});
