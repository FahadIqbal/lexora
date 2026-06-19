import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeProvider';
import { repos } from '../data/repositories';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { useAppStore } from '../store/useAppStore';
import { TAB_BAR_BOTTOM } from '../theme';

export function WordDetailScreen({ id }: { id: string }) {
  const t = useTheme();
  const addToStudyList = useAppStore((s) => s.addToStudyList);
  const { data: word, loading } = useAsyncResource(() => repos.words.getById(id), [id]);

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
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Button title="← Back" variant="ghost" onPress={() => router.back()} />

        <View style={{ marginTop: 14 }}>
          <LexText variant="h1" style={{ fontSize: 42 }}>
            {word.word}
          </LexText>
          <LexText variant="muted" style={{ marginTop: 8, color: t.colors.accentPink, fontStyle: 'italic' }}>
            {word.phonetic}
          </LexText>
          <LexText variant="muted" style={{ marginTop: 6 }}>
            {word.part_of_speech}
          </LexText>
        </View>

        <View style={{ marginTop: 14 }}>
          <Button title="🔊 Pronounce" onPress={() => Speech.speak(word.word, { rate: 0.95 })} />
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
          <Button title="Add to Study List" onPress={() => addToStudyList(word.id)} />
          <Button
            title="Practice This Word"
            variant="ghost"
            onPress={() => {
              addToStudyList(word.id);
              router.push('/(tabs)/review');
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, paddingBottom: TAB_BAR_BOTTOM },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
