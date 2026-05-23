import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../components/Card';
import { LexText } from '../../components/LexText';
import { Button } from '../../components/Button';

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
  return (
    <Card>
      <LexText variant="h2" style={{ fontSize: 24 }}>
        {title}
      </LexText>
      <View style={{ height: 10 }} />
      <LexText variant="muted">Score: {score}</LexText>
      <LexText variant="muted">XP earned: {xp}</LexText>
      <View style={{ height: 10 }} />
      {missed.length ? (
        <>
          <LexText variant="title">Words missed</LexText>
          <View style={styles.chips}>
            {missed.slice(0, 8).map((w) => (
              <View key={w} style={styles.chip}>
                <LexText variant="body" style={{ fontSize: 12 }}>
                  {w}
                </LexText>
              </View>
            ))}
          </View>
        </>
      ) : (
        <LexText variant="muted">Perfect round. Clean.</LexText>
      )}

      <View style={{ height: 14 }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
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

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});

