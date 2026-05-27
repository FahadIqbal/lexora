import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { GameShell } from './GameShell';
import { GameResultCard } from './GameResultCard';
import { Card } from '../../components/Card';
import { LexText } from '../../components/LexText';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppStore } from '../../store/useAppStore';
import { repos } from '../../data/repositories';
import { useAsyncResource } from '../../hooks/useAsyncResource';

export function DefinitionTypeGame() {
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
    () => repos.words.getDailySessionWords(8, { categories: selectedCategories, difficultyMax, seed: day + 303 }),
    [categoriesKey, difficultyMax]
  );

  const [i, setI] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [text, setText] = useState('');
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const word = (set ?? [])[i];

  const submit = () => {
    if (!word) return;
    const ok = text.trim().toLowerCase() === word.word.toLowerCase();
    if (ok) {
      setScore((s) => s + 12);
      addXp(15);
      next();
      return;
    }
    setAttempts((a) => a + 1);
    addXp(6);
    if (attempts >= 2) {
      setMissed((m) => [...m, word.word]);
      next();
    }
  };

  const next = () => {
    const ni = i + 1;
    if (ni >= (set ?? []).length) {
      setDone(true);
    } else {
      setI(ni);
      setAttempts(0);
      setText('');
    }
  };

  return (
    <GameShell title="Definition Match" subtitle="Type the word. Max 3 attempts.">
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
            setAttempts(0);
            setText('');
            setScore(0);
            setMissed([]);
            setDone(false);
          }}
          onDone={() => {}}
        />
      ) : (
        <>
          <Card style={{ marginTop: 14 }}>
            <LexText variant="title">
              {i + 1}/{(set ?? []).length} · Attempt {attempts + 1}/3
            </LexText>
            <LexText variant="h3" style={{ marginTop: 10 }}>
              {word?.definition}
            </LexText>
          </Card>

          <View style={{ marginTop: 12 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type the word…"
              placeholderTextColor={t.colors.muted}
              autoCapitalize="none"
              style={[
                styles.input,
                { borderColor: t.colors.border, backgroundColor: t.colors.surface, color: t.colors.text, fontFamily: t.font.body.regular },
              ]}
              onSubmitEditing={submit}
            />
          </View>

          <View style={{ marginTop: 12 }}>
            <Pressable
              onPress={submit}
              style={[styles.submit, { backgroundColor: t.colors.accentTeal }]}
            >
              <LexText variant="title" style={{ color: '#041015', textAlign: 'center' }}>
                Submit
              </LexText>
            </Pressable>
          </View>
        </>
      )}
    </GameShell>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  submit: { padding: 14, borderRadius: 16 },
});
