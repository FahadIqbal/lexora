import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components/Card';
import { LexText } from '../../components/LexText';
import { Button } from '../../components/Button';
import { IconSymbol } from '../../components/IconSymbol';
import { useTheme } from '../../theme/ThemeProvider';

export function GameResultCard({
  title = 'Round complete',
  score,
  xp,
  missed,
  onPlayAgain,
  onDone,
}: {
  title?: string;
  score: number;
  xp: number;
  missed: string[];
  onPlayAgain: () => void;
  onDone: () => void;
}) {
  const t = useTheme();
  const cleanRound = missed.length === 0;
  const scoreLabel = score >= 90 || cleanRound ? 'Excellent recall' : score >= 60 ? 'Solid run' : 'Practice target found';
  const nextTip = cleanRound
    ? 'Your recall is sharp. Raise the pace or try a harder game next.'
    : 'Review the missed words once, then replay while they are still fresh.';

  return (
    <Card style={styles.card}>
      <LinearGradient
        colors={cleanRound ? ['rgba(0,229,184,0.20)', 'rgba(123,111,255,0.10)'] : ['rgba(255,179,71,0.18)', 'rgba(255,107,157,0.10)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.heroRow}>
        <View style={[styles.resultIcon, { backgroundColor: cleanRound ? 'rgba(0,229,184,0.16)' : 'rgba(255,179,71,0.16)' }]}>
          <IconSymbol
            name={cleanRound ? 'trophy.fill' : 'scope'}
            fallback={cleanRound ? 'T' : 'R'}
            color={cleanRound ? t.colors.accentTeal : t.colors.accentAmber}
            size={28}
          />
        </View>
        <View style={{ flex: 1 }}>
          <LexText variant="label" style={{ color: cleanRound ? t.colors.accentTeal : t.colors.accentAmber }}>
            {scoreLabel}
          </LexText>
          <LexText variant="h2" style={{ fontSize: 25, marginTop: 4 }}>
            {title}
          </LexText>
        </View>
      </View>

      <View style={styles.statRow}>
        <ResultStat value={String(score)} label="score" color={t.colors.accentPurple} />
        <ResultStat value={`+${xp}`} label="XP" color={t.colors.accentTeal} />
        <ResultStat value={String(missed.length)} label="missed" color={cleanRound ? t.colors.muted : t.colors.accentPink} />
      </View>

      <View style={[styles.nextPanel, { borderColor: t.colors.border }]}>
        <LexText variant="label" style={{ color: t.colors.muted }}>
          Next best move
        </LexText>
        <LexText variant="muted" style={{ marginTop: 6, fontSize: 13, lineHeight: 18 }}>
          {nextTip}
        </LexText>
      </View>

      {missed.length ? (
        <View style={{ marginTop: 14 }}>
          <LexText variant="title">Missed words</LexText>
          <View style={styles.chips}>
            {missed.slice(0, 8).map((w) => (
              <View key={w} style={styles.chip}>
                <LexText variant="body" style={{ fontSize: 12 }}>
                  {w}
                </LexText>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={[styles.perfectPanel, { borderColor: 'rgba(0,229,184,0.30)', backgroundColor: 'rgba(0,229,184,0.08)' }]}>
          <LexText variant="title" style={{ color: t.colors.accentTeal }}>
            Perfect round
          </LexText>
          <LexText variant="muted" style={{ marginTop: 4, fontSize: 13 }}>
            Clean recall. Keep the streak going while momentum is high.
          </LexText>
        </View>
      )}

      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <Button title="Play again" onPress={onPlayAgain} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Done" variant="ghost" onPress={onDone} />
        </View>
      </View>
    </Card>
  );
}

function ResultStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.resultStat}>
      <LexText variant="h3" style={{ color, textAlign: 'center', fontSize: 21 }}>
        {value}
      </LexText>
      <LexText variant="label" style={{ textAlign: 'center', marginTop: 2, fontSize: 9 }}>
        {label}
      </LexText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderCurve: 'continuous',
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  resultIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  resultStat: {
    flex: 1,
    minHeight: 62,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  nextPanel: {
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginTop: 14,
  },
  perfectPanel: {
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 12,
    marginTop: 14,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
});
