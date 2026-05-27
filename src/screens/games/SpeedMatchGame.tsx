import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { GameShell } from './GameShell';
import { GameResultCard } from './GameResultCard';
import { LexText } from '../../components/LexText';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppStore } from '../../store/useAppStore';
import { repos } from '../../data/repositories';
import { useAsyncResource } from '../../hooks/useAsyncResource';

export function SpeedMatchGame() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);
  const selectedCategories = useAppStore((s) => s.selectedCategories);
  const proficiency = useAppStore((s) => s.user.proficiencyLevel);

  const [tick, setTick] = useState(60);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);
  const [flash, setFlash] = useState<'none' | 'good' | 'bad'>('none');
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRightWord, setSelectedRightWord] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const [missed, setMissed] = useState<string[]>([]);
  const [score, setScore] = useState(0);

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
    () => repos.words.getDailySessionWords(6, { categories: selectedCategories, difficultyMax, seed: day + 606 + round * 11 }),
    [categoriesKey, difficultyMax, round]
  );

  const left = useMemo(() => (set ?? []).map((w) => w.word), [set]);
  const right = useMemo(
    () =>
      (set ?? []).map((w) => ({
        word: w.word,
        def: w.short_definition || w.definition || '',
      })),
    [set]
  );
  const rightShuffled = useMemo(() => [...right].sort(() => Math.random() - 0.5), [right, round]);

  useEffect(() => {
    if (done || loading || !(set ?? []).length) return;
    if (tick <= 0) {
      setDone(true);
      return;
    }
    const id = setInterval(() => setTick((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [tick, done, loading, set]);

  useEffect(() => {
    if (!selectedLeft || !selectedRightWord) return;

    const correct = selectedRightWord === selectedLeft;
    if (correct) {
      setMatched((m) => ({ ...m, [selectedLeft]: true }));
      setScore((s) => s + 10);
      setFlash('good');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      setMissed((m) => [...m, selectedLeft]);
      setScore((s) => Math.max(0, s - 2));
      setFlash('bad');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
    setSelectedLeft(null);
    setSelectedRightWord(null);
  }, [selectedLeft, selectedRightWord]);

  useEffect(() => {
    if (flash === 'none') return;
    const id = setTimeout(() => setFlash('none'), 180);
    return () => clearTimeout(id);
  }, [flash]);

  const xp = Math.max(0, score) + tick; // time bonus
  const progress = Math.max(0, Math.min(1, tick / 60));

  return (
    <GameShell title="Speed Match" subtitle="Match the words. 60 seconds.">
      {loading ? (
        <Card style={{ marginTop: 14 }}>
          <LexText variant="title">Loading match set…</LexText>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            Pulling fresh words from your dictionary.
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
          score={score + tick}
          xp={xp}
          missed={[...new Set(missed)]}
          onPlayAgain={() => {
            setTick(60);
            setDone(false);
            setRound((r) => r + 1);
            setSelectedLeft(null);
            setSelectedRightWord(null);
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
          <View style={{ marginTop: 14 }}>
            <LinearGradient
              colors={[
                flash === 'bad' ? 'rgba(255,107,157,0.25)' : 'rgba(108,99,255,0.28)',
                flash === 'good' ? 'rgba(0,212,170,0.25)' : 'rgba(0,212,170,0.12)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.hud, { borderColor: t.colors.border }]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <LexText variant="title">Speed Match</LexText>
                  <LexText variant="muted" style={{ marginTop: 4 }}>
                    Tap a word, then its definition.
                  </LexText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <LexText variant="label" style={{ color: t.colors.muted }}>
                    TIME
                  </LexText>
                  <LexText variant="h2" style={{ fontSize: 28, color: tick <= 10 ? t.colors.accentPink : t.colors.text }}>
                    {tick}s
                  </LexText>
                </View>
              </View>

              <View style={{ height: 10 }} />
              <View style={[styles.barTrack, { backgroundColor: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.12)' }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: tick <= 10 ? t.colors.accentPink : t.colors.accentTeal,
                    },
                  ]}
                />
              </View>

              <View style={{ height: 12 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <LexText variant="muted">
                  Score: <LexText variant="title">{score}</LexText>
                </LexText>
                <LexText variant="muted">
                  Matched: <LexText variant="title">{Object.keys(matched).length}</LexText>/{left.length}
                </LexText>
              </View>
            </LinearGradient>
          </View>

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
                const used = Boolean(matched[x.word]);
                return (
                  <Pressable
                    key={x.word}
                    disabled={used}
                    onPress={() => setSelectedRightWord(x.word)}
                    style={[
                      styles.item,
                      {
                        borderColor: selectedRightWord === x.word ? t.colors.accentPurple : t.colors.border,
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
  hud: { borderWidth: 1, borderRadius: 22, padding: 16, overflow: 'hidden' },
  barTrack: { height: 8, borderRadius: 999, borderWidth: 1, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 999 },
  columns: { flex: 1, flexDirection: 'row', gap: 12, marginTop: 12 },
  col: { flex: 1, gap: 10 },
  item: { borderWidth: 1, borderRadius: 14, padding: 12 },
});
