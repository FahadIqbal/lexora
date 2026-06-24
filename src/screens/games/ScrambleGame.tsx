import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { GameShell } from './GameShell';
import { GameResultCard } from './GameResultCard';
import { Card } from '../../components/Card';
import { LexText } from '../../components/LexText';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppStore } from '../../store/useAppStore';
import { repos } from '../../data/repositories';
import { useAsyncResource } from '../../hooks/useAsyncResource';

function scramble(s: string) {
  return s
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

export function ScrambleGame() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);
  const recordReview = useAppStore((s) => s.recordReview);
  const selectedCategories = useAppStore((s) => s.selectedCategories);
  const proficiency = useAppStore((s) => s.user.proficiencyLevel);

  const difficultyMax = useMemo(() => {
    if (!proficiency) return null;
    const p = proficiency.toUpperCase();
    if (p === 'A1' || p === 'A2') return 2;
    if (p === 'B1') return 3;
    if (p === 'B2') return 4;
    return 5;
  }, [proficiency]);

  const categoriesKey = useMemo(() => selectedCategories.slice().sort().join('|'), [selectedCategories]);
  const day = Math.floor(Date.now() / 86_400_000);
  const { data: set, loading, error } = useAsyncResource(
    () => repos.words.getDailySessionWords(8, { categories: selectedCategories, difficultyMax, seed: day + 202 }),
    [categoriesKey, difficultyMax]
  );

  const [i, setI] = useState(0);
  const [pickedIndexes, setPickedIndexes] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const word = (set ?? [])[i];
  const letters = useMemo(() => (word ? scramble(word.word.toUpperCase()).split('') : []), [word?.id]);

  const current = pickedIndexes.map((idx) => letters[idx]).join('');

  const pick = (idx: number) => {
    if (!word) return;
    if (pickedIndexes.includes(idx) || pickedIndexes.length >= letters.length) return;
    setPickedIndexes((p) => [...p, idx]);
  };

  const reset = () => setPickedIndexes([]);

  const submit = () => {
    if (!word) return;
    const ok = current.toLowerCase() === word.word.toLowerCase();
    if (ok) setScore((s) => s + 12);
    else setMissed((m) => [...m, word.word]);
    addXp(ok ? 15 : 8);
    recordReview(word.id, ok ? 5 : 2);

    const ni = i + 1;
    if (ni >= (set ?? []).length) setDone(true);
    else {
      setI(ni);
      setPickedIndexes([]);
    }
  };

  return (
    <GameShell title="Word Scramble" subtitle="Tap letters to spell the word.">
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
            setPickedIndexes([]);
            setScore(0);
            setMissed([]);
            setDone(false);
          }}
          onDone={() => router.push('/(tabs)/games')}
        />
      ) : (
        <>
          <Card style={{ marginTop: 14 }}>
            <LexText variant="title">
              {i + 1}/{(set ?? []).length}
            </LexText>
            <LexText variant="muted" style={{ marginTop: 8 }}>
              Hint (definition): {word.short_definition}
            </LexText>
            <View style={{ height: 12 }} />
            <View style={[styles.answer, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <LexText variant="h2" style={{ fontSize: 28, letterSpacing: 0 }}>
                {current || '—'}
              </LexText>
            </View>
          </Card>

          <View style={styles.grid}>
            {letters.map((ch, idx) => (
              <Pressable
                key={`${ch}-${idx}`}
                disabled={pickedIndexes.includes(idx)}
                onPress={() => pick(idx)}
                style={[
                  styles.letter,
                  {
                    borderColor: pickedIndexes.includes(idx) ? 'rgba(0,229,184,0.35)' : t.colors.border,
                    backgroundColor: pickedIndexes.includes(idx) ? 'rgba(0,229,184,0.12)' : t.colors.surface,
                    opacity: pickedIndexes.includes(idx) ? 0.48 : 1,
                  },
                ]}
              >
                <LexText variant="h3" style={{ textAlign: 'center' }}>
                  {ch}
                </LexText>
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Pressable
                onPress={reset}
                style={[styles.action, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}
              >
                <LexText variant="title" style={{ textAlign: 'center' }}>
                  Reset
                </LexText>
              </Pressable>
            </View>
            <View style={{ flex: 1 }}>
              <Pressable
                onPress={submit}
                style={[styles.action, { borderColor: 'transparent', backgroundColor: t.colors.accentPurple }]}
              >
                <LexText variant="title" style={{ textAlign: 'center', color: 'white' }}>
                  Submit
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
  answer: { borderWidth: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
  grid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  letter: { width: '22%', borderWidth: 1, borderRadius: 14, paddingVertical: 12 },
  action: { borderWidth: 1, borderRadius: 16, padding: 14 },
});
