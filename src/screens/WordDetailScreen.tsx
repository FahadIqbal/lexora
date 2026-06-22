import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeProvider';
import { repos } from '../data/repositories';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { useAppStore } from '../store/useAppStore';
import { TAB_BAR_BOTTOM } from '../theme';
import { Haptics, hapticNotify, hapticSelection } from '../utils/haptics';

export function WordDetailScreen({ id }: { id: string }) {
  const t = useTheme();
  const addToStudyList = useAppStore((s) => s.addToStudyList);
  const { data: word, loading } = useAsyncResource(() => repos.words.getById(id), [id]);
  const difficultyLabel = useMemo(() => {
    if (!word) return '';
    if (word.difficulty_level <= 2) return 'Approachable';
    if (word.difficulty_level <= 4) return 'Growth word';
    return 'Advanced';
  }, [word]);

  if (!word) {
    return (
      <Screen>
        <View style={{ padding: 18 }}>
          <LexText variant="h2">{loading ? 'Loading…' : 'Not found'}</LexText>
          <View style={{ marginTop: 12 }}>
            <Button title="Back" variant="ghost" onPress={() => router.back()} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Button title="← Back" variant="ghost" onPress={() => router.back()} />

        <View style={styles.hero}>
          <LinearGradient
            colors={['rgba(123,111,255,0.24)', 'rgba(0,229,184,0.10)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <LexText variant="label" style={{ color: t.colors.accentTeal }}>
                {difficultyLabel}
              </LexText>
              <LexText variant="h1" style={{ fontSize: 42, marginTop: 6 }}>
                {word.word}
              </LexText>
              <LexText variant="muted" style={{ marginTop: 8, color: t.colors.accentPink, fontStyle: 'italic' }}>
                {word.phonetic}
              </LexText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Pronounce ${word.word}`}
              onPress={() => {
                Speech.speak(word.word, { rate: 0.95 });
                hapticSelection();
              }}
              style={[styles.pronounceOrb, { borderColor: t.colors.border }]}
            >
              <LexText style={{ fontSize: 24 }}>🔊</LexText>
            </Pressable>
          </View>
          <View style={styles.metaRow}>
            <MetaPill label={word.part_of_speech} />
            <MetaPill label={`Level ${word.difficulty_level}`} />
            <MetaPill label={`${word.synonyms.length} synonyms`} />
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <Button
            title="Add to Study List"
            onPress={() => {
              addToStudyList(word.id);
              hapticNotify(Haptics.NotificationFeedbackType.Success);
            }}
          />
        </View>

        <Card style={{ marginTop: 14 }}>
          <LexText variant="title">Definition</LexText>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            {word.definition}
          </LexText>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <LexText variant="title">Etymology</LexText>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            {word.etymology}
          </LexText>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <LexText variant="title">Examples</LexText>
          <View style={{ marginTop: 10, gap: 10 }}>
            {word.example_sentences.map((x, i) => (
              <View key={i} style={{ gap: 4 }}>
                <LexText variant="body">“{x.sentence}”</LexText>
                <LexText variant="muted" style={{ fontSize: 12 }}>
                  {x.source}
                </LexText>
              </View>
            ))}
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <LexText variant="title">Synonyms</LexText>
          <View style={styles.chips}>
            {word.synonyms.slice(0, 5).map((s) => (
              <View key={s} style={[styles.chip, { borderColor: t.colors.border }]}>
                <LexText variant="body" style={{ fontSize: 12 }}>
                  {s}
                </LexText>
              </View>
            ))}
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <LexText variant="title">Mnemonic</LexText>
          <LexText variant="muted" style={{ marginTop: 8 }}>
            💡 {word.mnemonic}
          </LexText>
        </Card>

        <View style={{ marginTop: 14, gap: 10 }}>
          <Button
            title="Practice This Word"
            variant="ghost"
            onPress={() => {
              addToStudyList(word.id);
              hapticSelection();
              router.push('/(tabs)/review');
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function MetaPill({ label }: { label: string }) {
  return (
    <View style={styles.metaPill}>
      <LexText variant="label" style={{ fontSize: 10 }}>
        {label}
      </LexText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, paddingBottom: TAB_BAR_BOTTOM },
  hero: {
    marginTop: 14,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    padding: 18,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  pronounceOrb: {
    width: 58,
    height: 58,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  metaPill: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
