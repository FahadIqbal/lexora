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

export function FillBlankGame() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);
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
    () => repos.words.getDailySessionWords(10, { categories: selectedCategories, difficultyMax, seed: day + 101 }),
    [categoriesKey, difficultyMax]
  );

  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const word = (set ?? [])[i];

  const sentence = useMemo(() => {
    if (!word) return '';
    return `The idea was ____ at first, but it quickly changed.`;
  }, [word?.id]);

  const options = useMemo(() => {
    if (!word) return [];
    const wrong = (set ?? [])
      .filter((w) => w.id !== word.id)
      .slice(0, 3)
      .map((w) => w.word);
    return [word.word, ...wrong].sort(() => Math.random() - 0.5);
  }, [word?.id]);

  const choose = (opt: string) => {
    const ok = opt === word.word;
    if (ok) setScore((s) => s + 10);
    else setMissed((m) => [...m, word.word]);

    const ni = i + 1;
    if (ni >= (set ?? []).length) {
      setDone(true);
      addXp(ok ? 15 : 10);
    } else {
      setI(ni);
      addXp(ok ? 15 : 10);
    }
  };

  return (
    <GameShell title="Fill in the Blank" subtitle="Choose the missing word.">
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
          <Card style={{ marginTop: 14 }}>
            <LexText variant="title">
              {i + 1}/{(set ?? []).length}
            </LexText>
            <LexText variant="h3" style={{ marginTop: 10 }}>
              {sentence}
            </LexText>
          </Card>

          <View style={{ marginTop: 12, gap: 10 }}>
            {options.map((x) => (
              <Pressable
                key={x}
                onPress={() => choose(x)}
                style={[
                  styles.opt,
                  { borderColor: t.colors.border, backgroundColor: t.colors.surface },
                ]}
              >
                <LexText variant="title">{x}</LexText>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </GameShell>
  );
}

const styles = StyleSheet.create({
  opt: { borderWidth: 1, borderRadius: 16, padding: 14 },
});
