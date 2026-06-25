import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { LexText } from '../components/LexText';
import { Card } from '../components/Card';
import { Skeleton } from '../components/Skeleton';
import { IconSymbol } from '../components/IconSymbol';
import { AppHeader } from '../components/AppHeader';
import { useTheme } from '../theme/ThemeProvider';
import { repos } from '../data/repositories';
import { useAsyncResource } from '../hooks/useAsyncResource';
import type { Category, Word } from '../domain/schema';
import { hasSupabase } from '../services/env';
import { useAppStore } from '../store/useAppStore';
import { TAB_BAR_BOTTOM } from '../theme';
import { hapticSelection } from '../utils/haptics';

export function DictionaryScreen() {
  const t = useTheme();
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const selectedCategories = useAppStore((s) => s.selectedCategories);
  const proficiency = useAppStore((s) => s.user.proficiencyLevel);
  const addToStudyList = useAppStore((s) => s.addToStudyList);

  useEffect(() => {
    const id = setTimeout(() => setDq(q), 240);
    return () => clearTimeout(id);
  }, [q]);

  const { data: categories, loading: categoriesLoading, error: categoriesError } = useAsyncResource(
    () => repos.categories.list(),
    []
  );
  const { data: filtered, loading: wordsLoading, error: wordsError } = useAsyncResource(
    () => repos.words.search(dq, { category: cat, difficulty }),
    [dq, cat, difficulty]
  );
  const words = (filtered ?? []) as Word[];
  const categoryMap = useMemo(() => new Map((categories ?? []).map((c) => [c.slug, c])), [categories]);
  const activeCategory = cat ? categoryMap.get(cat) : null;
  const recommendedCategory = useMemo(() => {
    return selectedCategories.find((slug) => categoryMap.has(slug)) ?? (categories ?? [])[0]?.slug ?? null;
  }, [categories, categoryMap, selectedCategories]);
  const averageDifficulty = useMemo(() => {
    if (!words.length) return null;
    const total = words.reduce((sum, word) => sum + word.difficulty_level, 0);
    return Math.round((total / words.length) * 10) / 10;
  }, [words]);

  const setCategoryFilter = (slug: string | null) => {
    hapticSelection();
    setCat(slug);
  };

  const setDifficultyFilter = (level: number | null) => {
    hapticSelection();
    setDifficulty(level);
  };

  const clearFilters = () => {
    hapticSelection();
    setQ('');
    setCat(null);
    setDifficulty(null);
  };

  const saveWord = (id: string) => {
    addToStudyList(id);
    hapticSelection();
  };

  return (
    <Screen>
      <View style={styles.wrap}>
        <AppHeader
          eyebrow="Explore"
          title="Dictionary"
          subtitle="Search, filter, and turn discoveries into practice."
          icon="text.book.closed.fill"
          fallback="D"
          accent={t.colors.accentBlue}
          metric={proficiency ?? 'All'}
        />

        {!hasSupabase() ? (
          <Card style={{ marginTop: 14, backgroundColor: 'rgba(91,168,255,0.08)' }}>
            <LexText variant="title">Offline word bank</LexText>
            <LexText variant="muted" style={{ marginTop: 8 }}>
              Lexora is using bundled words right now. Add Supabase keys to sync live categories and admin edits.
            </LexText>
          </Card>
        ) : null}

        <Animated.View entering={FadeInDown.duration(420)} style={styles.discoveryCard}>
          <LinearGradient
            colors={['rgba(123,111,255,0.24)', 'rgba(0,229,184,0.10)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.discoveryHeader}>
            <View style={{ flex: 1 }}>
              <LexText variant="label" style={{ color: t.colors.accentTeal }}>
                Discovery focus
              </LexText>
              <LexText variant="h3" style={{ marginTop: 6 }}>
                {activeCategory?.name ?? (dq ? `Searching "${dq}"` : 'Explore smarter words')}
              </LexText>
              <LexText variant="muted" style={{ marginTop: 6, fontSize: 13 }}>
                {activeCategory
                  ? `${activeCategory.word_count.toLocaleString()} words in this lane.`
                  : proficiency
                  ? `Tuned for your ${proficiency} learning level.`
                  : 'Use filters to narrow by topic and difficulty.'}
              </LexText>
            </View>
            <View style={[styles.discoveryMetric, { borderColor: t.colors.border }]}>
              <LexText variant="h3" style={{ color: t.colors.accentPurple, textAlign: 'center' }}>
                {words.length}
              </LexText>
              <LexText variant="label" style={{ fontSize: 9, textAlign: 'center' }}>
                results
              </LexText>
            </View>
          </View>
          <View style={styles.discoveryStats}>
            <MiniStat value={averageDifficulty ? String(averageDifficulty) : '—'} label="avg difficulty" color={t.colors.accentAmber} />
            <MiniStat value={activeCategory?.emoji ?? '✨'} label={activeCategory ? 'topic' : 'all topics'} color={t.colors.accentTeal} />
            <MiniStat value={difficulty ? String(difficulty) : 'Any'} label="level" color={t.colors.accentPink} />
          </View>
        </Animated.View>

        <View style={[styles.searchShell, { backgroundColor: t.colors.surface, borderColor: q ? t.colors.accentTeal : t.colors.border }]}>
          <IconSymbol name="magnifyingglass" fallback="S" color={q ? t.colors.accentTeal : t.colors.muted} size={16} />
          <TextInput
            accessibilityLabel="Search dictionary"
            placeholder="Search words, roots, or definitions..."
            placeholderTextColor={t.colors.muted}
            value={q}
            onChangeText={setQ}
            style={[styles.input, { color: t.colors.text, fontFamily: t.font.body.regular }]}
          />
          {q ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQ('')} style={styles.clearSearch}>
              <IconSymbol name="xmark" fallback="X" color={t.colors.muted} size={13} />
            </Pressable>
          ) : null}
        </View>

        {/* Filters */}
        <View style={{ marginTop: 12 }}>
          <View style={styles.filterTitleRow}>
            <LexText variant="title">Filters</LexText>
            <Pressable accessibilityRole="button" onPress={clearFilters} style={styles.clearButton}>
              <LexText variant="label" style={{ fontSize: 10, color: t.colors.accentTeal }}>
                Reset
              </LexText>
            </Pressable>
          </View>
          <View style={{ height: 10 }} />
          <FlashList
            horizontal
            data={[
              { key: 'all', label: 'All', onPress: () => setCategoryFilter(null), active: !cat },
              ...(recommendedCategory
                ? [
                    {
                      key: 'recommended',
                      label: `For you ${categoryMap.get(recommendedCategory)?.emoji ?? ''}`,
                      onPress: () => setCategoryFilter(recommendedCategory),
                      active: cat === recommendedCategory,
                    },
                  ]
                : []),
              ...(categories ?? []).map((c: Category) => ({
                key: c.slug,
                label: `${c.emoji} ${c.name}`,
                onPress: () => setCategoryFilter(c.slug),
                active: cat === c.slug,
              })),
            ]}
            keyExtractor={(x: any) => x.key}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }: any) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: item.active }}
                onPress={item.onPress}
                onLongPress={item.key === 'all' ? undefined : item.onPress}
                style={[
                  styles.chip,
                  {
                    borderColor: item.active ? t.colors.accentTeal : t.colors.border,
                    backgroundColor: item.active ? 'rgba(0,212,170,0.10)' : 'rgba(255,255,255,0.04)',
                  },
                ]}
              >
                <LexText variant="label" style={{ fontSize: 11, color: item.active ? t.colors.accentTeal : t.colors.muted }}>
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
                accessibilityRole="button"
                accessibilityState={{ selected: difficulty === d }}
                accessibilityLabel={`Difficulty ${d}`}
                onPress={() => setDifficultyFilter(difficulty === d ? null : d)}
                style={[
                  styles.chip,
                  {
                    borderColor: difficulty === d ? t.colors.accentPurple : t.colors.border,
                    backgroundColor: difficulty === d ? 'rgba(108,99,255,0.10)' : 'rgba(255,255,255,0.04)',
                  },
                ]}
              >
                <LexText variant="label" style={{ fontSize: 11, color: difficulty === d ? t.colors.accentPurple : t.colors.muted }}>
                  Level {d}
                </LexText>
              </Pressable>
            ))}
          </View>
          {categoriesLoading ? (
            <LexText variant="muted" style={{ marginTop: 10 }}>
              Loading categories…
            </LexText>
          ) : null}
          {categoriesError ? (
            <LexText variant="muted" style={{ marginTop: 10, color: t.colors.accentPink }}>
              Couldn’t load categories.
            </LexText>
          ) : null}
        </View>

        <View style={styles.resultHeader}>
          <LexText variant="title">
            {wordsLoading ? 'Searching' : `${words.length} ${words.length === 1 ? 'word' : 'words'}`}
          </LexText>
          <LexText variant="muted" style={{ fontSize: 13 }}>
            {cat || difficulty || dq ? 'Filtered results' : 'Full library'}
          </LexText>
        </View>

        <View style={{ flex: 1, marginTop: 12 }}>
          {wordsLoading ? (
            <View style={{ gap: 10 }}>
              {[0, 1, 2].map((x) => (
                <View key={x} style={[styles.row, { backgroundColor: t.colors.surface, borderColor: t.colors.border }]}>
                  <View style={{ flex: 1, gap: 8 }}>
                    <Skeleton height={18} style={{ width: '42%' }} />
                    <Skeleton height={14} style={{ width: '88%' }} />
                  </View>
                  <Skeleton height={36} radius={18} style={{ width: 52 }} />
                </View>
              ))}
            </View>
          ) : (
            <FlashList
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={{ paddingBottom: TAB_BAR_BOTTOM }}
              data={words as any}
              keyExtractor={(x: any) => x.id}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              ListEmptyComponent={
                <View style={[styles.emptyState, { borderColor: t.colors.border, backgroundColor: t.colors.surface }]}>
                  <LexText variant="h3" style={{ textAlign: 'center' }}>
                    No matching words
                  </LexText>
                  <LexText variant="muted" style={{ textAlign: 'center', marginTop: 8 }}>
                    Try a broader topic, remove difficulty, or search for a shorter root.
                  </LexText>
                  <View style={{ marginTop: 14 }}>
                    <Pressable accessibilityRole="button" onPress={clearFilters} style={[styles.emptyButton, { borderColor: t.colors.accentTeal }]}>
                      <LexText variant="title" style={{ color: t.colors.accentTeal, fontSize: 14 }}>
                        Clear filters
                      </LexText>
                    </Pressable>
                  </View>
                </View>
              }
              renderItem={({ item, index }: any) => (
                <Animated.View
                  entering={FadeInDown.duration(240).delay(Math.min(index, 8) * 28)}
                  layout={LinearTransition.duration(180)}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${item.word}, ${item.part_of_speech}. ${item.short_definition}`}
                    onPress={() => {
                      hapticSelection();
                      router.push(`/dictionary/${item.id}`);
                    }}
                    style={({ pressed }) => [
                      styles.row,
                      {
                        backgroundColor: t.colors.surface,
                        borderColor: t.colors.border,
                        opacity: pressed ? 0.88 : 1,
                        transform: [{ scale: pressed ? 0.985 : 1 }],
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={styles.wordTitleRow}>
                        <LexText variant="title">{item.word}</LexText>
                        <View style={[styles.partPill, { borderColor: t.colors.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}>
                          <LexText variant="label" style={{ color: t.colors.muted, fontSize: 9 }}>
                            {item.part_of_speech}
                          </LexText>
                        </View>
                      </View>
                      <LexText variant="muted" style={{ marginTop: 4 }}>
                        {item.short_definition}
                      </LexText>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Save ${item.word} to study list`}
                        onPress={(event) => {
                          event.stopPropagation();
                          saveWord(item.id);
                        }}
                        style={({ pressed }) => [
                          styles.saveWordButton,
                          {
                            borderColor: t.colors.accentTeal,
                            backgroundColor: 'rgba(0,229,184,0.10)',
                            opacity: pressed ? 0.78 : 1,
                          },
                        ]}
                      >
                        <IconSymbol name="plus" fallback="+" color={t.colors.accentTeal} size={13} />
                      </Pressable>
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
                      <View style={[styles.chevron, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                        <IconSymbol name="chevron.right" fallback=">" color={t.colors.muted} size={13} />
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              )}
            />
          )}
          {wordsError ? (
            <LexText variant="muted" style={{ marginTop: 10, color: t.colors.accentPink }}>
              Couldn’t load results.
            </LexText>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

function MiniStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.miniStat}>
      <LexText variant="title" style={{ color, textAlign: 'center', fontSize: 15 }}>
        {value}
      </LexText>
      <LexText variant="label" style={{ textAlign: 'center', fontSize: 9, marginTop: 2 }}>
        {label}
      </LexText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18 },
  discoveryCard: {
    minHeight: 188,
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  discoveryHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  discoveryMetric: {
    width: 72,
    minHeight: 72,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  discoveryStats: { flexDirection: 'row', gap: 8, marginTop: 16 },
  miniStat: {
    flex: 1,
    minHeight: 58,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  searchShell: {
    marginTop: 16,
    height: 48,
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  input: { flex: 1, height: 46, padding: 0 },
  clearSearch: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  filterTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clearButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  resultHeader: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  row: {
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  wordTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  partPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  chevron: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  saveWordButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 20,
    borderCurve: 'continuous',
    padding: 20,
    alignItems: 'center',
  },
  emptyButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
});
