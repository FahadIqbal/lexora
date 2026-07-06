import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { GameShell } from './GameShell';
import { GameResultCard } from './GameResultCard';
import { Card } from '../../components/Card';
import { LexText } from '../../components/LexText';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppStore } from '../../store/useAppStore';
import { repos } from '../../data/repositories';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { getDifficultyMaxForProficiency } from '../../utils/proficiency';

export function WordChainGame() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);
  const recordReview = useAppStore((s) => s.recordReview);

  const selectedCategories = useAppStore((s) => s.selectedCategories);
  const proficiency = useAppStore((s) => s.user.proficiencyLevel);

  const difficultyMax = useMemo(() => getDifficultyMaxForProficiency(proficiency), [proficiency]);

  const categoriesKey = useMemo(() => selectedCategories.slice().sort().join('|'), [selectedCategories]);
  const day = Math.floor(Date.now() / 86_400_000);
  const { data: set, loading, error } = useAsyncResource(
    () => repos.words.getDailySessionWords(1, { categories: selectedCategories, difficultyMax, seed: day + 505 }),
    [categoriesKey, difficultyMax]
  );

  const startWord = (set ?? [])[0];
  const start = startWord?.word ?? '';
  const [chain, setChain] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const targetLen = 10;

  useEffect(() => {
    if (!start) return;
    setChain((c) => (c.length ? c : [start]));
  }, [start]);

  const validate = async (candidate: string) => {
    const c = candidate.trim().toLowerCase();
    if (!c) return false;
    if (chain.map((x) => x.toLowerCase()).includes(c)) return false;
    if (!/^[a-z][a-z -]*$/i.test(candidate.trim())) return false;
    return true;
  };

  const submit = async () => {
    const cand = text.trim();
    const ok = await validate(cand);
    if (!ok) {
      setMissed((m) => [...m, cand || '(empty)']);
      addXp(2);
      return;
    }
    setChain((c) => [...c, cand]);
    setScore((s) => s + 10);
    addXp(10);
    setText('');

    if (chain.length + 1 >= targetLen) {
      if (startWord) recordReview(startWord.id, 4);
      setDone(true);
    }
  };

  return (
    <GameShell title="Word Chain" subtitle="Build a chain of 10 connected words.">
      {loading ? (
        <Card style={{ marginTop: 14 }}>
          <LexText variant="title">Loading starter word…</LexText>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            Pulling a fresh prompt from your dictionary.
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
          missed={missed.filter(Boolean).slice(0, 8)}
          onPlayAgain={() => {
            setChain(start ? [start] : []);
            setText('');
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
              Chain {chain.length}/{targetLen}
            </LexText>
            <LexText variant="muted" style={{ marginTop: 8 }}>
              Enter a synonym, association, or word that naturally connects to the chain.
            </LexText>
            <View style={{ marginTop: 12, gap: 6 }}>
              {chain.slice(-6).map((w, idx) => (
                <LexText key={`${w}-${idx}`} variant="body">
                  {idx === chain.slice(-6).length - 1 ? '→ ' : '  '} {w}
                </LexText>
              ))}
            </View>
          </Card>

          <View style={{ marginTop: 12 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a related word…"
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
            <Button title="Add link" onPress={submit} disabled={!text.trim().length} />
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
});
