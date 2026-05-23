import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GameShell } from './GameShell';
import { GameResultCard } from './GameResultCard';
import { Card } from '../../components/Card';
import { LexText } from '../../components/LexText';
import { useTheme } from '../../theme/ThemeProvider';
import { getGameWordSet } from './gamesData';
import { useAppStore } from '../../store/useAppStore';

function scramble(s: string) {
  return s
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

export function ScrambleGame() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);
  const set = useMemo(() => getGameWordSet(8), []);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const word = set[i];
  const letters = useMemo(() => (word ? scramble(word.word.toUpperCase()).split('') : []), [word?.id]);

  const current = picked.join('');

  const pick = (ch: string, idx: number) => {
    if (!word) return;
    if (picked.length >= letters.length) return;
    setPicked((p) => [...p, ch]);
  };

  const reset = () => setPicked([]);

  const submit = () => {
    if (!word) return;
    const ok = current.toLowerCase() === word.word.toLowerCase();
    if (ok) setScore((s) => s + 12);
    else setMissed((m) => [...m, word.word]);
    addXp(ok ? 15 : 8);

    const ni = i + 1;
    if (ni >= set.length) setDone(true);
    else {
      setI(ni);
      setPicked([]);
    }
  };

  return (
    <GameShell title="Word Scramble" subtitle="Tap letters to spell the word.">
      {done ? (
        <GameResultCard
          score={score}
          xp={score}
          missed={[...new Set(missed)]}
          onPlayAgain={() => {
            setI(0);
            setPicked([]);
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
            <LexText variant="muted" style={{ marginTop: 8 }}>
              Hint (definition): {word.short_definition}
            </LexText>
            <View style={{ height: 12 }} />
            <View style={[styles.answer, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <LexText variant="h2" style={{ fontSize: 28, letterSpacing: 2 }}>
                {current || '—'}
              </LexText>
            </View>
          </Card>

          <View style={styles.grid}>
            {letters.map((ch, idx) => (
              <Pressable
                key={`${ch}-${idx}`}
                onPress={() => pick(ch, idx)}
                style={[
                  styles.letter,
                  { borderColor: t.colors.border, backgroundColor: t.colors.surface },
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

