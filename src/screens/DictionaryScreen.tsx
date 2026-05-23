import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeProvider';
import { repos } from '../data/repositories';
import { useAsyncResource } from '../hooks/useAsyncResource';
import type { Category, Word } from '../domain/schema';

export function DictionaryScreen() {
  const t = useTheme();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);

  const { data: categories, loading: categoriesLoading } = useAsyncResource(() => repos.categories.list(), []);
  const { data: filtered, loading: wordsLoading } = useAsyncResource(
    () => repos.words.search(q, { category: cat, difficulty }),
    [q, cat, difficulty]
  );

  return (
    <Screen>
      <View style={styles.wrap}>
        <LexText variant="h2">Dictionary</LexText>
        <LexText variant="muted" style={{ marginTop: 6 }}>
          Browse and search the full word database.
        </LexText>

        <TextInput
          placeholder="Search…"
          placeholderTextColor={t.colors.muted}
          value={q}
          onChangeText={setQ}
          style={[
            styles.input,
            { backgroundColor: t.colors.surface, borderColor: t.colors.border, color: t.colors.text, fontFamily: t.font.body.regular },
          ]}
        />

        {/* Filters */}
        <View style={{ marginTop: 12 }}>
          <LexText variant="title">Filters</LexText>
          <View style={{ height: 10 }} />
          <FlashList
            horizontal
            data={[
              { key: 'all', label: 'All', onPress: () => setCat(null), active: !cat },
              ...(categories ?? []).map((c: Category) => ({
                key: c.slug,
                label: `${c.emoji} ${c.name}`,
                onPress: () => setCat(c.slug),
                active: cat === c.slug,
              })),
            ]}
            keyExtractor={(x: any) => x.key}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }: any) => (
              <Pressable
                onPress={item.onPress}
                style={[
                  styles.chip,
                  {
                    borderColor: item.active ? t.colors.accentTeal : t.colors.border,
                    backgroundColor: item.active ? 'rgba(0,212,170,0.10)' : 'rgba(255,255,255,0.04)',
                  },
                ]}
              >
                <LexText variant="body" style={{ fontSize: 12 }}>
                  {item.label}
                </LexText>
              </Pressable>
            )}
          />

          <View style={{ height: 10 }} />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map((d) => (
              <Pressable
                key={d}
                onPress={() => setDifficulty((x) => (x === d ? null : d))}
                style={[
                  styles.chip,
                  {
                    borderColor: difficulty === d ? t.colors.accentPurple : t.colors.border,
                    backgroundColor: difficulty === d ? 'rgba(108,99,255,0.10)' : 'rgba(255,255,255,0.04)',
                  },
                ]}
              >
                <LexText variant="body" style={{ fontSize: 12 }}>
                  Difficulty {d}
                </LexText>
              </Pressable>
            ))}
          </View>
          {categoriesLoading ? (
            <LexText variant="muted" style={{ marginTop: 10 }}>
              Loading categories…
            </LexText>
          ) : null}
        </View>

        <Card style={{ marginTop: 12 }}>
          <LexText variant="muted">
            Results: {(filtered ?? []).length} {(filtered ?? []).length === 1 ? 'word' : 'words'}
          </LexText>
        </Card>

        <View style={{ flex: 1, marginTop: 12 }}>
          <FlashList
            data={(filtered ?? []) as any}
            keyExtractor={(x: any) => x.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }: any) => (
              <Pressable
                onPress={() => router.push(`/dictionary/${item.id}`)}
                style={[
                  styles.row,
                  { backgroundColor: t.colors.surface, borderColor: t.colors.border },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <LexText variant="title">{item.word}</LexText>
                  <LexText variant="muted" style={{ marginTop: 4 }}>
                    {item.short_definition}
                  </LexText>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <LexText variant="muted" style={{ fontStyle: 'italic' }}>
                    {item.part_of_speech}
                  </LexText>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <View
                        key={i}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          backgroundColor: i < item.difficulty_level ? t.colors.accentAmber : 'rgba(255,255,255,0.10)',
                        }}
                      />
                    ))}
                  </View>
                </View>
              </Pressable>
            )}
          />
          {wordsLoading ? (
            <LexText variant="muted" style={{ marginTop: 10 }}>
              Searching…
            </LexText>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18 },
  input: {
    marginTop: 16,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  row: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
});
