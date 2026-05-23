import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import type { Word } from '../domain/schema';
import { useAppStore } from '../store/useAppStore';
import { repos } from '../data/repositories';
import { useAsyncResource } from '../hooks/useAsyncResource';

export function LearnScreen() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);
  const addToStudyList = useAppStore((s) => s.addToStudyList);
  const recordLearned = useAppStore((s) => s.recordLearned);
  const { data: words, loading } = useAsyncResource(() => repos.words.getDailySessionWords(10), []);
  const [phase, setPhase] = useState<'intro' | 'cards' | 'quiz' | 'complete'>('intro');
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);

  const current = (words ?? [])[index];
  const next = (words ?? [])[index + 1];
  const after = (words ?? [])[index + 2];

  const answered = index;

  const toQuiz = (i: number) => i > 0 && i % 5 === 0;

  const onDoneWord = () => {
    const nextIndex = index + 1;
    if (nextIndex >= (words ?? []).length) {
      setPhase('complete');
      return;
    }
    if (toQuiz(nextIndex)) {
      setPhase('quiz');
      return;
    }
    setIndex(nextIndex);
  };

  return (
    <Screen>
      <View style={[styles.wrap, { backgroundColor: t.colors.bg }]}>
        {phase === 'intro' ? (
          <>
            <LexText variant="h2">Learn Mode</LexText>
            <LexText variant="muted" style={{ marginTop: 6 }}>
              You’re about to learn {(words ?? []).length} new words. Ready?
            </LexText>
            <Card style={{ marginTop: 16 }}>
              <LexText variant="title">Today’s session</LexText>
              <LexText variant="muted" style={{ marginTop: 8 }}>
                Swipe right = “Got it ✓” (+10 XP). Swipe left = “Still learning” (returns later).
              </LexText>
              <View style={{ marginTop: 12 }}>
                <Button title={loading ? 'Loading…' : 'Start'} onPress={() => setPhase('cards')} disabled={loading || !(words ?? []).length} />
              </View>
            </Card>
          </>
        ) : null}

        {phase === 'cards' ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <LexText variant="title">Session</LexText>
              <LexText variant="muted">
                {index + 1}/{(words ?? []).length}
              </LexText>
            </View>

            <View style={{ flex: 1, marginTop: 14 }}>
              {current ? (
                <CardStack
                  top={current}
                  second={next}
                  third={after}
                  onSwipe={(dir) => {
                    if (dir === 'right') {
                      addXp(10);
                      recordLearned(current.id);
                    } else {
                      // still learning -> add to study list (does not count as learned)
                      addToStudyList(current.id);
                      addXp(3);
                    }
                    onDoneWord();
                  }}
                />
              ) : null}
            </View>
          </>
        ) : null}

        {phase === 'quiz' ? (
          <MiniQuiz
            word={(words ?? [])[index - 1] as Word}
            onAnswer={(ok) => {
              setCorrect((c) => c + (ok ? 1 : 0));
              addXp(ok ? 15 : 0);
              setPhase('cards');
              setIndex(index); // unchanged
            }}
            onBack={() => setPhase('cards')}
          />
        ) : null}

        {phase === 'complete' ? (
          <Card style={{ marginTop: 18 }}>
            <LexText variant="h2">Session Complete!</LexText>
            <LexText variant="muted" style={{ marginTop: 10 }}>
              Words learned: {(words ?? []).length} · Quiz correct: {correct}
            </LexText>
            <View style={{ marginTop: 14, gap: 10 }}>
              <Button title="Review what I learned" onPress={() => {}} />
              <Button title="Go Home" variant="ghost" onPress={() => setPhase('intro')} />
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

function CardStack({
  top,
  second,
  third,
  onSwipe,
}: {
  top: Word;
  second?: Word;
  third?: Word;
  onSwipe: (dir: 'left' | 'right') => void;
}) {
  const t = useTheme();
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const rot = useSharedValue(0);

  const pan = Gesture.Pan()
    .onChange((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY * 0.2;
      rot.value = e.translationX / 28;
    })
    .onEnd(() => {
      const dir = tx.value > 120 ? 'right' : tx.value < -120 ? 'left' : null;
      if (!dir) {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
        rot.value = withSpring(0);
        return;
      }
      tx.value = withTiming(dir === 'right' ? 520 : -520, { duration: 220, easing: Easing.out(Easing.quad) }, () => {
        tx.value = 0;
        ty.value = 0;
        rot.value = 0;
      });
      onSwipe(dir);
    });

  const topStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { rotate: `${rot.value}deg` }],
  }));

  const overlayStyle = useAnimatedStyle(() => {
    const p = Math.min(1, Math.abs(tx.value) / 120);
    return { opacity: p };
  });

  const rightStyle = useAnimatedStyle(() => ({
    opacity: tx.value > 0 ? Math.min(1, tx.value / 120) : 0,
  }));
  const leftStyle = useAnimatedStyle(() => ({
    opacity: tx.value < 0 ? Math.min(1, -tx.value / 120) : 0,
  }));

  return (
    <View style={{ flex: 1 }}>
      {/* back cards */}
      {third ? (
        <View style={[stylesCard.back, { transform: [{ scale: 0.92 }], top: 18, backgroundColor: t.colors.surface2, borderColor: t.colors.border }]} />
      ) : null}
      {second ? (
        <View style={[stylesCard.back, { transform: [{ scale: 0.96 }], top: 10, backgroundColor: t.colors.surface2, borderColor: t.colors.border }]} />
      ) : null}

      <GestureDetector gesture={pan}>
        <Animated.View style={[stylesCard.topWrap, topStyle]}>
          <WordFlipCard word={top} />
          <Animated.View pointerEvents="none" style={[stylesCard.overlay, overlayStyle]}>
            <Animated.View style={rightStyle}>
              <LexText variant="h2" style={{ fontSize: 40, color: 'rgba(0,212,170,0.75)' }}>
                ✓
              </LexText>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }, leftStyle]}>
              <LexText variant="h2" style={{ fontSize: 40, color: 'rgba(255,107,157,0.75)' }}>
                ✕
              </LexText>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function WordFlipCard({ word }: { word: Word }) {
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
    <View style={stylesCard.card}>
      <LinearGradient
        colors={['rgba(108,99,255,0.28)', 'rgba(0,212,170,0.12)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />

      <Animated.View
        style={[StyleSheet.absoluteFill, frontStyle, { padding: 18, justifyContent: 'space-between' }]}
        onTouchEnd={() => {
          flipped.value = withSpring(flipped.value ? 0 : 1, { damping: 18, stiffness: 180 });
        }}
      >
        <View>
          <LexText variant="h2" style={{ fontSize: 36 }}>
            {word.word}
          </LexText>
          <LexText variant="muted" style={{ marginTop: 6, color: t.colors.accentPink, fontStyle: 'italic' }}>
            {word.phonetic}
          </LexText>
        </View>
        <LexText variant="label" style={{ color: t.colors.muted, textAlign: 'center' }}>
          Tap to see meaning
        </LexText>
      </Animated.View>

      <Animated.View
        style={[StyleSheet.absoluteFill, backStyle, { padding: 18, justifyContent: 'space-between' }]}
        onTouchEnd={() => {
          flipped.value = withSpring(flipped.value ? 0 : 1, { damping: 18, stiffness: 180 });
        }}
      >
        <View>
          <LexText variant="title">Definition</LexText>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            {word.definition}
          </LexText>
          <View style={{ height: 10 }} />
          <LexText variant="title">Mnemonic</LexText>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            💡 {word.mnemonic}
          </LexText>
        </View>
        <LexText variant="label" style={{ color: t.colors.muted, textAlign: 'center' }}>
          Swipe to continue
        </LexText>
      </Animated.View>
    </View>
  );
}

function MiniQuiz({ word, onAnswer, onBack }: { word: Word; onAnswer: (ok: boolean) => void; onBack: () => void }) {
  const t = useTheme();
  const options = useMemo(() => {
    const wrong = ['A place to rest', 'A type of clothing', 'To speak loudly'];
    return [word.short_definition, ...wrong].sort(() => Math.random() - 0.5);
  }, [word.id]);

  return (
    <View style={{ flex: 1 }}>
      <LexText variant="h2">Mini quiz</LexText>
      <LexText variant="muted" style={{ marginTop: 6 }}>
        What does “{word.word}” mean?
      </LexText>

      <Card style={{ marginTop: 16 }}>
        <View style={{ gap: 10 }}>
          {options.map((x) => (
            <View
              key={x}
              style={[stylesCard.choice, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}
              onTouchEnd={() => onAnswer(x === word.short_definition)}
            >
              <LexText variant="body">{x}</LexText>
            </View>
          ))}
        </View>
      </Card>

      <View style={{ marginTop: 16 }}>
        <Button title="Back" variant="ghost" onPress={onBack} />
      </View>
    </View>
  );
}

const stylesCard = StyleSheet.create({
  back: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '92%',
    borderRadius: 22,
    borderWidth: 1,
  },
  topWrap: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  overlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  choice: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
});
