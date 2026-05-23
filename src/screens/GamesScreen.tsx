import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeProvider';
import { gameList } from './games/gamesData';

export function GamesScreen() {
  const t = useTheme();
  return (
    <Screen>
      <View style={styles.wrap}>
        <LexText variant="h2">Word Games</LexText>
        <LexText variant="muted" style={{ marginTop: 6 }}>
          Short, addictive drills to lock words into memory.
        </LexText>

        <View style={{ marginTop: 14, gap: 10 }}>
          {gameList.map((g) => (
            <Pressable
              key={g.slug}
              onPress={() => router.push(`/games/${g.slug}`)}
              style={({ pressed }) => [
                styles.gameCard,
                { backgroundColor: t.colors.surface, borderColor: t.colors.border, opacity: pressed ? 0.92 : 1 },
              ]}
            >
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={[styles.icon, { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: t.colors.border }]}>
                  <LexText variant="h3" style={{ fontSize: 18 }}>
                    {g.icon}
                  </LexText>
                </View>
                <View style={{ flex: 1 }}>
                  <LexText variant="title">{g.title}</LexText>
                  <LexText variant="muted" style={{ marginTop: 4 }}>
                    {g.subtitle}
                  </LexText>
                </View>
                <LexText variant="title" style={{ color: t.colors.muted }}>
                  →
                </LexText>
              </View>
            </Pressable>
          ))}
        </View>

        <Card style={{ marginTop: 16 }}>
          <LexText variant="title">Tip</LexText>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            Play games after Learn Mode — that’s where retention spikes.
          </LexText>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18 },
  gameCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
