import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GameShell } from './GameShell';
import { GameResultCard } from './GameResultCard';
import { Card } from '../../components/Card';
import { LexText } from '../../components/LexText';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppStore } from '../../store/useAppStore';
import { repos } from '../../data/repositories';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { getDifficultyMaxForProficiency } from '../../utils/proficiency';

export function TrueFalseGame() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);
  const recordReview = useAppStore((s) => s.recordReview);
  const selectedCategories = useAppStore((s) => s.selectedCategories);
  const proficiency = useAppStore((s) => s.user.proficiencyLevel);

  const difficultyMax = useMemo(() => getDifficultyMaxForProficiency(proficiency), [proficiency]);

  const categoriesKey = useMemo(() => selectedCategories.slice().sort().join('|'), [selectedCategories]);
  const day = Math.floor(Date.now() / 86_400_000);
  const { data: set, loading, error } = useAsyncResource(
    () => repos.words.getDailySessionWords(10, { categories: selectedCategories, difficultyMax, seed: day + 404 }),
    [categoriesKey, difficultyMax]
  );

  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const word = (set ?? [])[i];
  const isTrue = useMemo(() => Math.random() > 0.5, [i]);
  const wrong = useMemo(() => {
    const pool = (set ?? []).filter((w) => w.id !== word?.id && Boolean(w.short_definition || w.definition));
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [i, word?.id]);
  const shownDef = isTrue ? (word?.short_definition || word?.definition) : (wrong?.short_definition || wrong?.definition);

  const tx = useSharedValue(0);
  const pan = Gesture.Pan()
    .onChange((e) => {
      tx.value = e.translationX;
    })
    .onEnd(() => {
      if (tx.value > 90) {
        answer(true);
      } else if (tx.value < -90) {
        answer(false);
      }
      tx.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) });
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { rotate: `${tx.value / 24}deg` }],
  }));

  const answer = (userSaysTrue: boolean) => {
    if (!word) return;
    const ok = userSaysTrue === isTrue;
    setScore((s) => s + (ok ? 10 : 0));
    if (!ok) setMissed((m) => [...m, word.word]);
    addXp(ok ? 12 : 6);
    recordReview(word.id, ok ? 4 : 2);

    const ni = i + 1;
    if (ni >= (set ?? []).length) setDone(true);
    else setI(ni);
  };

  return (
    <GameShell title="True or False" subtitle="Swipe right = True, left = False.">
      {loading ? (
        <Card style={{ marginTop: 14 }}>
          <LexText variant="title">Loading words…</LexText>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            Building a fresh round from your dictionary.
          </LexText>
        </Card>
      ) : error ? (
        <Card style={{ marginTop: 14 }}>
          <LexText variant="title">Can’t load words</LexText>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            Check that Supabase is configured and reachable, then reload.
          </LexText>
        </Card>
      ) : done ? (
        <GameResultCard
          score={score}
          xp={score}
          missed={[...new Set(missed)]}
          onPlayAgain={() => {
            setI(0);
            setScore(0);
            setMissed([]);
            setDone(false);
          }}
          onDone={() => router.push('/(tabs)/games')}
        />
      ) : (
        <>
          <LexText variant="muted" style={{ marginTop: 14 }}>
            {i + 1}/{(set ?? []).length}
          </LexText>

          <GestureDetector gesture={pan}>
            <Animated.View style={[{ marginTop: 12 }, cardStyle]}>
              <Card style={{ borderRadius: 22 }}>
                <LexText variant="h2" style={{ fontSize: 34 }}>
                  {word?.word}
                </LexText>
                <LexText variant="muted" style={{ marginTop: 10 }}>
                  {shownDef}
                </LexText>
                <View style={{ height: 14 }} />
                <View style={styles.hintRow}>
                  <LexText variant="label" style={{ color: t.colors.accentPink }}>
                    ← FALSE
                  </LexText>
                  <LexText variant="label" style={{ color: t.colors.accentTeal }}>
                    TRUE →
                  </LexText>
                </View>
              </Card>
            </Animated.View>
          </GestureDetector>

          <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Pressable
                onPress={() => answer(false)}
                style={[styles.btn, { backgroundColor: 'rgba(255,107,157,0.14)', borderColor: 'rgba(255,107,157,0.35)' }]}
              >
                <LexText variant="title" style={{ textAlign: 'center', color: t.colors.accentPink }}>
                  False
                </LexText>
              </Pressable>
            </View>
            <View style={{ flex: 1 }}>
              <Pressable
                onPress={() => answer(true)}
                style={[styles.btn, { backgroundColor: 'rgba(0,212,170,0.14)', borderColor: 'rgba(0,212,170,0.35)' }]}
              >
                <LexText variant="title" style={{ textAlign: 'center', color: t.colors.accentTeal }}>
                  True
                </LexText>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </GameShell>
  );
}

const styles = StyleSheet.create({
  hintRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { borderWidth: 1, borderRadius: 16, padding: 14 },
});
