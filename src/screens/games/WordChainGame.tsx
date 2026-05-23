import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { GameShell } from './GameShell';
import { GameResultCard } from './GameResultCard';
import { Card } from '../../components/Card';
import { LexText } from '../../components/LexText';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { getGameWordSet } from './gamesData';
import { useAppStore } from '../../store/useAppStore';

export function WordChainGame() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);

  const start = useMemo(() => getGameWordSet(1)[0].word, []);
  const [chain, setChain] = useState<string[]>([start]);
  const [text, setText] = useState('');
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const targetLen = 10;

  const validate = async (candidate: string) => {
    // Mock “AI validation”: accept if non-empty and not already in chain.
    const c = candidate.trim().toLowerCase();
    if (!c) return false;
    if (chain.map((x) => x.toLowerCase()).includes(c)) return false;
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
      setDone(true);
    }
  };

  return (
    <GameShell title="Word Chain" subtitle="Build a chain of 10 connected words.">
      {done ? (
        <GameResultCard
          score={score}
          xp={score}
          missed={missed.filter(Boolean).slice(0, 8)}
          onPlayAgain={() => {
            setChain([start]);
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
              Chain {chain.length}/{targetLen}
            </LexText>
            <LexText variant="muted" style={{ marginTop: 8 }}>
              Enter a synonym or related word (AI validation will be added later).
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

