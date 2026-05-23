import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GameShell } from './GameShell';
import { GameResultCard } from './GameResultCard';
import { Card } from '../../components/Card';
import { LexText } from '../../components/LexText';
import { useTheme } from '../../theme/ThemeProvider';
import { getGameWordSet } from './gamesData';
import { useAppStore } from '../../store/useAppStore';

export function TrueFalseGame() {
  const t = useTheme();
  const addXp = useAppStore((s) => s.addXp);
  const set = useMemo(() => getGameWordSet(10), []);

  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const word = set[i];
  const isTrue = useMemo(() => Math.random() > 0.5, [i]);
  const shownDef = isTrue ? word.short_definition : 'A noisy argument; a quarrel.'; // wrong half the time

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
    const ok = userSaysTrue === isTrue;
    setScore((s) => s + (ok ? 10 : 0));
    if (!ok) setMissed((m) => [...m, word.word]);
    addXp(ok ? 12 : 6);

    const ni = i + 1;
    if (ni >= set.length) setDone(true);
    else setI(ni);
  };

  return (
    <GameShell title="True or False" subtitle="Swipe right = True, left = False.">
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
          <LexText variant="muted" style={{ marginTop: 14 }}>
            {i + 1}/{set.length}
          </LexText>

          <GestureDetector gesture={pan}>
            <Animated.View style={[{ marginTop: 12 }, cardStyle]}>
              <Card style={{ borderRadius: 22 }}>
                <LexText variant="h2" style={{ fontSize: 34 }}>
                  {word.word}
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
              <View
                style={[styles.btn, { backgroundColor: 'rgba(255,107,157,0.14)', borderColor: 'rgba(255,107,157,0.35)' }]}
                onTouchEnd={() => answer(false)}
              >
                <LexText variant="title" style={{ textAlign: 'center', color: t.colors.accentPink }}>
                  False
                </LexText>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={[styles.btn, { backgroundColor: 'rgba(0,212,170,0.14)', borderColor: 'rgba(0,212,170,0.35)' }]}
                onTouchEnd={() => answer(true)}
              >
                <LexText variant="title" style={{ textAlign: 'center', color: t.colors.accentTeal }}>
                  True
                </LexText>
              </View>
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

