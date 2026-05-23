import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GameShell } from './GameShell';
import { GameResultCard } from './GameResultCard';
import { LexText } from '../../components/LexText';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme/ThemeProvider';
import { getGameWordSet } from './gamesData';
import { useAppStore } from '../../store/useAppStore';

export function SpeedMatchGame() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);

  const [tick, setTick] = useState(60);
  const [done, setDone] = useState(false);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const [missed, setMissed] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const set = useMemo(() => getGameWordSet(5), []);

  const left = useMemo(() => set.map((w) => w.word), [set]);
  const right = useMemo(() => set.map((w) => ({ word: w.word, def: w.short_definition })), [set]);
  const rightShuffled = useMemo(() => [...right].sort(() => Math.random() - 0.5), [right]);

  useEffect(() => {
    if (done) return;
    if (tick <= 0) {
      setDone(true);
      return;
    }
    const id = setInterval(() => setTick((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [tick, done]);

  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;

    const correct = right.find((x) => x.word === selectedLeft)?.def === selectedRight;
    if (correct) {
      setMatched((m) => ({ ...m, [selectedLeft]: true }));
      setScore((s) => s + 10);
    } else {
      setMissed((m) => [...m, selectedLeft]);
      setScore((s) => Math.max(0, s - 2));
    }
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [selectedLeft, selectedRight]);

  const xp = Math.max(0, score) + tick; // time bonus

  return (
    <GameShell title="Speed Match" subtitle="Match the words. 60 seconds.">
      {done ? (
        <GameResultCard
          score={score + tick}
          xp={xp}
          missed={[...new Set(missed)]}
          onPlayAgain={() => {
            setTick(60);
            setDone(false);
            setSelectedLeft(null);
            setSelectedRight(null);
            setMatched({});
            setMissed([]);
            setScore(0);
          }}
          onDone={() => {
            addXp(xp);
          }}
        />
      ) : (
        <>
          <Card style={{ marginTop: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <LexText variant="title">Time</LexText>
              <LexText variant="title" style={{ color: tick <= 10 ? t.colors.accentPink : t.colors.accentTeal }}>
                {tick}s
              </LexText>
            </View>
            <LexText variant="muted" style={{ marginTop: 8 }}>
              Tap a word on the left, then its definition on the right.
            </LexText>
          </Card>

          <View style={styles.columns}>
            <View style={styles.col}>
              <LexText variant="label" style={{ marginBottom: 8 }}>
                Words
              </LexText>
              {left.map((w) => {
                const done = matched[w];
                return (
                  <Pressable
                    key={w}
                    disabled={done}
                    onPress={() => setSelectedLeft(w)}
                    style={[
                      styles.item,
                      {
                        borderColor: selectedLeft === w ? t.colors.accentTeal : t.colors.border,
                        backgroundColor: done ? 'rgba(0,212,170,0.10)' : 'rgba(255,255,255,0.04)',
                        opacity: done ? 0.55 : 1,
                      },
                    ]}
                  >
                    <LexText variant="title">{w}</LexText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.col}>
              <LexText variant="label" style={{ marginBottom: 8 }}>
                Definitions
              </LexText>
              {rightShuffled.map((x) => {
                const used = Object.keys(matched).some((w) => right.find((r) => r.word === w)?.def === x.def);
                return (
                  <Pressable
                    key={x.def}
                    disabled={used}
                    onPress={() => setSelectedRight(x.def)}
                    style={[
                      styles.item,
                      {
                        borderColor: selectedRight === x.def ? t.colors.accentPurple : t.colors.border,
                        backgroundColor: used ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.04)',
                        opacity: used ? 0.55 : 1,
                      },
                    ]}
                  >
                    <LexText variant="muted">{x.def}</LexText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </>
      )}
    </GameShell>
  );
}

const styles = StyleSheet.create({
  columns: { flex: 1, flexDirection: 'row', gap: 12, marginTop: 12 },
  col: { flex: 1, gap: 10 },
  item: { borderWidth: 1, borderRadius: 14, padding: 12 },
});

