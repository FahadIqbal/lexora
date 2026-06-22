import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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
import { TAB_BAR_BOTTOM } from '../theme';
import { Haptics, hapticImpact, hapticNotify, hapticSelection } from '../utils/haptics';

export function LearnScreen() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);
  const addToStudyList = useAppStore((s) => s.addToStudyList);
  const recordLearned = useAppStore((s) => s.recordLearned);
  const selectedCategories = useAppStore((s) => s.selectedCategories);
  const proficiency = useAppStore((s) => s.user.proficiencyLevel);
  const dailyGoalWords = useAppStore((s) => s.user.dailyGoalWords);

  const difficultyMax = useMemo(() => {
    if (!proficiency) return null;
    const p = proficiency.toUpperCase();
    if (p === 'A1' || p === 'A2') return 2;
    if (p === 'B1') return 3;
    if (p === 'B2') return 4;
    return 5;
  }, [proficiency]);

  const categoriesKey = useMemo(
    () => selectedCategories.slice().sort().join('|'),
    [selectedCategories]
  );
  const count = Math.max(6, Math.min(14, dailyGoalWords || 10));
  const day = Math.floor(Date.now() / 86_400_000);
  const { data: words, loading, error } = useAsyncResource(
    () =>
      repos.words.getDailySessionWords(count, {
        categories: selectedCategories,
        difficultyMax,
        seed: day,
      }),
    [categoriesKey, difficultyMax, count]
  );

  const [phase, setPhase] = useState<'intro' | 'cards' | 'quiz' | 'complete'>('intro');
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [xpPopup, setXpPopup] = useState<{ amount: number; key: number } | null>(null);

  const current = (words ?? [])[index];
  const next = (words ?? [])[index + 1];
  const after = (words ?? [])[index + 2];
  const total = (words ?? []).length;

  const toQuiz = (i: number) => i > 0 && i % 5 === 0;

  const showXpPopup = useCallback((amount: number) => {
    const key = Date.now();
    setXpPopup({ amount, key });
    setTimeout(() => setXpPopup((prev) => (prev?.key === key ? null : prev)), 1100);
  }, []);

  const onDoneWord = useCallback(() => {
    const nextIndex = index + 1;
    if (nextIndex >= total) {
      setPhase('complete');
      return;
    }
    if (toQuiz(nextIndex)) {
      setIndex(nextIndex);
      setPhase('quiz');
      return;
    }
    setIndex(nextIndex);
  }, [index, total]);

  const handleSwipe = useCallback(
    (dir: 'left' | 'right') => {
      if (dir === 'right') {
        const newCombo = combo + 1;
        setCombo(newCombo);
        const multiplier = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;
        const xp = 10 * multiplier;
        addXp(xp);
        recordLearned(current.id);
        showXpPopup(xp);
        hapticImpact(Haptics.ImpactFeedbackStyle.Light);
      } else {
        setCombo(0);
        addToStudyList(current.id);
        addXp(3);
        showXpPopup(3);
      }
      onDoneWord();
    },
    [combo, current, addXp, recordLearned, addToStudyList, onDoneWord, showXpPopup]
  );

  const progressFill = useSharedValue(0);
  useEffect(() => {
    if (total > 0) {
      progressFill.value = withTiming(index / total, { duration: 350 });
    }
  }, [index, total]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressFill.value * 100}%`,
  }));

  const comboMultiplier = combo >= 5 ? 3 : combo >= 3 ? 2 : 1;

  return (
    <Screen>
      <View style={[styles.wrap, { backgroundColor: t.colors.bg }]}>
        {phase === 'intro' && (
          <>
            <LexText variant="h2">Learn Mode</LexText>
            <LexText variant="muted" style={{ marginTop: 6 }}>
              You're about to learn {total} new words.
            </LexText>
            <GlowCard style={{ marginTop: 20 }}>
              <LexText variant="title" style={{ fontSize: 15 }}>
                How it works
              </LexText>
              <View style={{ gap: 10, marginTop: 12 }}>
                <HintRow emoji="👉" text="Swipe RIGHT — Got it! (+10 XP)" color={t.colors.accentTeal} />
                <HintRow emoji="👈" text="Swipe LEFT — Still learning (+3 XP)" color={t.colors.accentPink} />
                <HintRow emoji="🔥" text="3+ in a row = Combo! (2× or 3× XP)" color={t.colors.accentAmber} />
                <HintRow emoji="🧠" text="Mini quiz every 5 cards" color={t.colors.accentPurple} />
              </View>
              {!!error && (
                <LexText variant="muted" style={{ marginTop: 12, color: t.colors.accentPink }}>
                  Can't load words. Check Supabase config.
                </LexText>
              )}
              <View style={{ marginTop: 16 }}>
                <Button
                  title={loading ? 'Loading…' : `Start ${total} words →`}
                  onPress={() => setPhase('cards')}
                  disabled={loading || !total}
                />
              </View>
            </GlowCard>
          </>
        )}

        {phase === 'cards' && (
          <>
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

            {/* Header row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <LexText variant="muted" style={{ fontSize: 13 }}>
                {index + 1} / {total}
              </LexText>
              {combo >= 3 ? (
                <ComboChip multiplier={comboMultiplier} combo={combo} />
              ) : (
                <LexText variant="label" style={{ color: t.colors.muted }}>Learn</LexText>
              )}
            </View>

            {/* Card area with XP popup */}
            <View style={{ flex: 1, marginTop: 12 }}>
              {current && (
                <CardStack
                  top={current}
                  second={next}
                  third={after}
                  onSwipe={handleSwipe}
                />
              )}
              {xpPopup && <XpPopup key={xpPopup.key} amount={xpPopup.amount} />}
            </View>
          </>
        )}

        {phase === 'quiz' && (
          <MiniQuiz
            word={(words ?? [])[index - 1] as Word}
            words={words ?? []}
            onAnswer={(ok) => {
              setCorrect((c) => c + (ok ? 1 : 0));
              addXp(ok ? 15 : 0);
              if (ok) showXpPopup(15);
              setPhase('cards');
            }}
            onBack={() => setPhase('cards')}
          />
        )}

        {phase === 'complete' && (
          <CompletionScreen
            total={total}
            correct={correct}
            onLearnMore={() => {
              setIndex(0);
              setCombo(0);
              setCorrect(0);
              setPhase('intro');
            }}
          />
        )}
      </View>
    </Screen>
  );
}

function HintRow({ emoji, text, color }: { emoji: string; text: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LexText style={{ fontSize: 18, width: 28 }}>{emoji}</LexText>
      <LexText variant="muted" style={{ flex: 1, fontSize: 14 }}>
        <LexText variant="body" style={{ color, fontSize: 14 }}>{text.split(' —')[0]}</LexText>
        {' —' + (text.split(' —')[1] ?? '')}
      </LexText>
    </View>
  );
}

function ComboChip({ multiplier, combo }: { multiplier: number; combo: number }) {
  const scale = useSharedValue(0.8);
  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  }, [combo]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <LinearGradient
        colors={multiplier >= 3 ? ['#FF8C42', '#FFB347'] : ['#7B6FFF', '#00E5B8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.comboChip}
      >
        <LexText variant="label" style={{ color: 'white', fontSize: 11 }}>
          {combo}× COMBO · {multiplier}× XP
        </LexText>
      </LinearGradient>
    </Animated.View>
  );
}

function XpPopup({ amount }: { amount: number }) {
  const ty = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    ty.value = withTiming(-80, { duration: 900, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(0, { duration: 900, easing: Easing.in(Easing.cubic) });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.xpPopup, style]} pointerEvents="none">
      <LinearGradient
        colors={['#7B6FFF', '#00E5B8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.xpPopupGradient}
      >
        <LexText variant="title" style={{ color: 'white', fontFamily: 'Syne_700Bold', fontSize: 16 }}>
          +{amount} XP
        </LexText>
      </LinearGradient>
    </Animated.View>
  );
}

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

  const triggerSwipe = useCallback(
    (dir: 'left' | 'right') => {
      onSwipe(dir);
    },
    [onSwipe]
  );

  const pan = Gesture.Pan()
    .onChange((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY * 0.18;
      rot.value = e.translationX / 26;
    })
    .onEnd(() => {
      const dir = tx.value > 110 ? 'right' : tx.value < -110 ? 'left' : null;
      if (!dir) {
        tx.value = withSpring(0, { damping: 16, stiffness: 220 });
        ty.value = withSpring(0);
        rot.value = withSpring(0);
        return;
      }
      tx.value = withTiming(
        dir === 'right' ? 560 : -560,
        { duration: 200, easing: Easing.out(Easing.quad) },
        () => {
          tx.value = 0;
          ty.value = 0;
          rot.value = 0;
          runOnJS(triggerSwipe)(dir);
        }
      );
    });

  const topStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
    ],
  }));

  const rightOpacity = useAnimatedStyle(() => ({
    opacity: tx.value > 0 ? Math.min(1, tx.value / 100) : 0,
  }));
  const leftOpacity = useAnimatedStyle(() => ({
    opacity: tx.value < 0 ? Math.min(1, -tx.value / 100) : 0,
  }));

  return (
    <View style={{ flex: 1 }}>
      {third && (
        <View
          style={[
            stylesCard.back,
            { transform: [{ scale: 0.91 }], top: 20, backgroundColor: t.colors.surface3, borderColor: t.colors.border },
          ]}
        />
      )}
      {second && (
        <View
          style={[
            stylesCard.back,
            { transform: [{ scale: 0.96 }], top: 10, backgroundColor: t.colors.surface2, borderColor: t.colors.border },
          ]}
        />
      )}

      <GestureDetector gesture={pan}>
        <Animated.View style={[stylesCard.topWrap, topStyle]}>
          <WordFlipCard word={top} />

          {/* Swipe indicators */}
          <Animated.View
            pointerEvents="none"
            style={[stylesCard.swipeIndicator, { left: 18, borderColor: 'rgba(0,229,184,0.5)', backgroundColor: 'rgba(0,229,184,0.12)' }, rightOpacity]}
          >
            <LexText style={{ fontSize: 26 }}>✓</LexText>
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[stylesCard.swipeIndicator, { right: 18, borderColor: 'rgba(255,107,157,0.5)', backgroundColor: 'rgba(255,107,157,0.12)' }, leftOpacity]}
          >
            <LexText style={{ fontSize: 26 }}>✕</LexText>
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
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(flipped.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: 'hidden',
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(flipped.value, [0, 1], [180, 360])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const flip = () => {
    hapticSelection();
    flipped.value = withSpring(flipped.value ? 0 : 1, { damping: 20, stiffness: 200 });
  };

  return (
    <View style={stylesCard.card}>
      <LinearGradient
        colors={['rgba(123,111,255,0.22)', 'rgba(0,229,184,0.10)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.28)' }]} />

      {/* Front */}
      <Animated.View
        style={[StyleSheet.absoluteFill, frontStyle, { padding: 22, justifyContent: 'space-between' }]}
        onTouchEnd={flip}
      >
        <View>
          {word.difficulty_level ? (
            <DifficultyDots level={word.difficulty_level} />
          ) : null}
          <LexText variant="h2" style={{ marginTop: 10, fontSize: 38 }}>
            {word.word}
          </LexText>
          <LexText variant="muted" style={{ marginTop: 6, color: t.colors.accentPink, fontStyle: 'italic' }}>
            {word.phonetic}
          </LexText>
          {word.part_of_speech ? (
            <View style={[styles.posBadge, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.07)' }]}>
              <LexText variant="label" style={{ fontSize: 10 }}>{word.part_of_speech}</LexText>
            </View>
          ) : null}
        </View>
        <LexText variant="label" style={{ color: t.colors.muted, textAlign: 'center' }}>
          Tap to reveal meaning
        </LexText>
      </Animated.View>

      {/* Back */}
      <Animated.View
        style={[StyleSheet.absoluteFill, backStyle, { padding: 22, justifyContent: 'space-between' }]}
        onTouchEnd={flip}
      >
        <View style={{ gap: 14 }}>
          <View>
            <LexText variant="label" style={{ color: t.colors.accentPurple }}>DEFINITION</LexText>
            <LexText variant="body" style={{ marginTop: 6, lineHeight: 22 }}>
              {word.definition}
            </LexText>
          </View>
          {word.mnemonic ? (
            <View style={[styles.mnemonicBox, { backgroundColor: 'rgba(255,179,71,0.08)', borderColor: 'rgba(255,179,71,0.25)' }]}>
              <LexText variant="label" style={{ color: t.colors.accentAmber, fontSize: 10 }}>💡 MEMORY TIP</LexText>
              <LexText variant="muted" style={{ marginTop: 4, fontSize: 13 }}>
                {word.mnemonic}
              </LexText>
            </View>
          ) : null}
        </View>
        <LexText variant="label" style={{ color: t.colors.muted, textAlign: 'center' }}>
          Swipe right ✓ or left ✕
        </LexText>
      </Animated.View>
    </View>
  );
}

function DifficultyDots({ level }: { level: number }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i <= level ? t.colors.accentPurple : 'rgba(255,255,255,0.15)',
          }}
        />
      ))}
    </View>
  );
}

function MiniQuiz({
  word,
  words,
  onAnswer,
  onBack,
}: {
  word: Word;
  words: Word[];
  onAnswer: (ok: boolean) => void;
  onBack: () => void;
}) {
  const t = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const options = useMemo(() => {
    const correct = word.short_definition || word.definition;
    const wrong = words
      .filter((w) => w.id !== word.id)
      .map((w) => w.short_definition || w.definition)
      .filter((definition): definition is string => Boolean(definition && definition !== correct))
      .slice(0, 3);
    const fallback = ['A related but incorrect meaning', 'A different usage pattern', 'An unrelated definition'];
    const choices = [correct, ...wrong, ...fallback].slice(0, 4);
    return choices.sort(() => Math.random() - 0.5);
  }, [word.definition, word.id, word.short_definition, words]);

  const handleAnswer = (x: string) => {
    if (selected) return;
    setSelected(x);
    const ok = x === (word.short_definition || word.definition);
    hapticNotify(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    setTimeout(() => onAnswer(ok), 700);
  };

  return (
    <View style={{ flex: 1 }}>
      <LexText variant="label" style={{ color: t.colors.accentPurple }}>MINI QUIZ</LexText>
      <LexText variant="h2" style={{ marginTop: 6 }}>
        What does "{word.word}" mean?
      </LexText>

      <View style={{ gap: 10, marginTop: 18 }}>
        {options.map((x) => {
          const isCorrect = x === (word.short_definition || word.definition);
          const isSelected = x === selected;
          const showResult = !!selected;

          let borderColor: string = t.colors.border;
          let bg: string = 'rgba(255,255,255,0.04)';
          if (showResult && isCorrect) {
            borderColor = 'rgba(0,229,184,0.5)';
            bg = 'rgba(0,229,184,0.1)';
          } else if (showResult && isSelected && !isCorrect) {
            borderColor = 'rgba(255,107,157,0.5)';
            bg = 'rgba(255,107,157,0.1)';
          }

          return (
            <Pressable
              key={x}
              onPress={() => handleAnswer(x)}
              style={[stylesCard.choice, { borderColor, backgroundColor: bg }]}
            >
              <LexText variant="body" style={{ fontSize: 14 }}>
                {showResult && isCorrect ? '✓ ' : showResult && isSelected ? '✕ ' : ''}{x}
              </LexText>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: 18 }}>
        <Button title="Skip" variant="ghost" onPress={onBack} />
      </View>
    </View>
  );
}

function CompletionScreen({
  total,
  correct,
  onLearnMore,
}: {
  total: number;
  correct: number;
  onLearnMore: () => void;
}) {
  const t = useTheme();
  const quizCount = Math.max(1, Math.ceil(total / 5));
  const accuracy = total > 0 ? Math.round((correct / quizCount) * 100) : 0;
  const nextAction = accuracy >= 80 ? 'Lock it in with a fast game.' : 'Review the tricky cards before adding more.';
  const scale = useSharedValue(0.7);
  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.completeScroll} showsVerticalScrollIndicator={false}>
      <Animated.View style={style}>
        <GlowCard colors={['rgba(0,229,184,0.55)', 'rgba(123,111,255,0.35)']}>
          <LexText style={{ fontSize: 52, textAlign: 'center' }}>🎉</LexText>
          <LexText variant="h2" style={{ textAlign: 'center', marginTop: 12 }}>
            Session complete
          </LexText>
          <LexText variant="muted" style={{ textAlign: 'center', marginTop: 8 }}>
            You moved {total} words into your memory queue.
          </LexText>

          <View style={{ marginTop: 20, gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <StatBox value={String(total)} label="Words" color={t.colors.accentTeal} />
              <StatBox value={String(correct)} label="Correct" color={t.colors.accentPurple} />
              <StatBox value={total > 0 ? `${accuracy}%` : '—'} label="Accuracy" color={t.colors.accentAmber} />
            </View>

            <View style={[styles.nextStepPanel, { borderColor: t.colors.border }]}>
              <LexText variant="label" style={{ color: t.colors.muted }}>
                Best next step
              </LexText>
              <LexText variant="title" style={{ marginTop: 6 }}>
                {nextAction}
              </LexText>
            </View>

            <View style={styles.completionActions}>
              <View style={{ flex: 1 }}>
                <Button
                  title={accuracy >= 80 ? 'Play a game' : 'Review now'}
                  onPress={() => router.push(accuracy >= 80 ? '/(tabs)/games' : '/(tabs)/review')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Learn more" variant="ghost" onPress={onLearnMore} />
              </View>
            </View>
          </View>
        </GlowCard>
      </Animated.View>
    </ScrollView>
  );
}

function StatBox({ value, label, color }: { value: string; label: string; color: string }) {
  const t = useTheme();
  return (
    <View style={[styles.statBox, { backgroundColor: t.colors.surface2, borderColor: t.colors.border }]}>
      <LexText variant="h3" style={{ color, textAlign: 'center' }}>{value}</LexText>
      <LexText variant="label" style={{ textAlign: 'center', marginTop: 4, fontSize: 10 }}>{label}</LexText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18, paddingBottom: TAB_BAR_BOTTOM },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  comboChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  xpPopup: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  xpPopupGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  posBadge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  mnemonicBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  completeScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: TAB_BAR_BOTTOM,
  },
  nextStepPanel: {
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 13,
  },
  completionActions: {
    flexDirection: 'row',
    gap: 10,
  },
});

const stylesCard = StyleSheet.create({
  back: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '94%',
    borderRadius: 24,
    borderWidth: 1,
  },
  topWrap: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  swipeIndicator: {
    position: 'absolute',
    top: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choice: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
});
