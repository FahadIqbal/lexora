import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GameShell } from './GameShell';
import { GameResultCard } from './GameResultCard';
import { Card } from '../../components/Card';
import { LexText } from '../../components/LexText';
import { useTheme } from '../../theme/ThemeProvider';
import { getGameWordSet } from './gamesData';
import { useAppStore } from '../../store/useAppStore';

export function FillBlankGame() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);
  const set = useMemo(() => getGameWordSet(10), []);

  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const word = set[i];

  const sentence = useMemo(() => {
    if (!word) return '';
    return `The idea was ____ at first, but it quickly changed.`;
  }, [word?.id]);

  const options = useMemo(() => {
    if (!word) return [];
    const wrong = set
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
    if (ni >= set.length) {
      setDone(true);
      addXp(ok ? 15 : 10);
    } else {
      setI(ni);
      addXp(ok ? 15 : 10);
    }
  };

  return (
    <GameShell title="Fill in the Blank" subtitle="Choose the missing word.">
      {done ? (
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
          onDone={() => {}}
        />
      ) : (
        <>
          <Card style={{ marginTop: 14 }}>
            <LexText variant="title">
              {i + 1}/{set.length}
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

