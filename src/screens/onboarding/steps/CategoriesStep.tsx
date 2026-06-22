import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { LexText } from '../../../components/LexText';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../theme/ThemeProvider';
import { useAppStore } from '../../../store/useAppStore';
import { repos } from '../../../data/repositories';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { hasSupabase } from '../../../services/env';
import { upsertUserProfile } from '../../../services/supabaseHelpers';
import { hapticSelection } from '../../../utils/haptics';

export function CategoriesStep({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const t = useTheme();
  const userId = useAppStore((s) => s.user.id);
  const dailyGoalWords = useAppStore((s) => s.user.dailyGoalWords);
  const proficiencyLevel = useAppStore((s) => s.user.proficiencyLevel);
  const selected = useAppStore((s) => s.selectedCategories);
  const setSelected = useAppStore((s) => s.setSelectedCategories);
  const [touched, setTouched] = useState(false);

  const { data: list, loading } = useAsyncResource(() => repos.categories.list(), []);
  const selectedNames = useMemo(() => {
    const names = (list ?? []).filter((c) => selected.includes(c.slug)).map((c) => c.name);
    if (!names.length) return 'Choose topics to shape your first session';
    if (names.length === 1) return names[0];
    return `${names.slice(0, 2).join(', ')}${names.length > 2 ? ` +${names.length - 2}` : ''}`;
  }, [list, selected]);

  const toggle = (slug: string) => {
    setTouched(true);
    hapticSelection();
    setSelected(selected.includes(slug) ? selected.filter((x) => x !== slug) : [...selected, slug]);
  };

  const proceed = () => {
    if (!selected.length) {
      setTouched(true);
      return;
    }
    if (hasSupabase() && userId) {
      upsertUserProfile({
        id: userId,
        daily_goal_words: dailyGoalWords,
        proficiency_level: proficiencyLevel ?? null,
        selected_categories: selected,
      }).catch(() => null);
    }
    onFinish();
  };

  return (
    <View style={[styles.root, { backgroundColor: t.colors.bg }]}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(520).springify().damping(16)}>
          <LexText variant="h2">Pick your topics</LexText>
          <LexText variant="muted" style={{ marginTop: 6 }}>
            Choose the vocabulary lanes Lexora should use for your first daily plan.
          </LexText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(520)} style={{ marginTop: 16 }}>
          <Card>
            <View style={styles.grid}>
              {(list ?? []).map((c) => {
                const active = selected.includes(c.slug);
                return (
                  <Pressable
                    key={c.slug}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    accessibilityLabel={`${c.name}, ${c.is_premium ? 'premium' : 'free'}, ${c.word_count.toLocaleString()} words`}
                    onPress={() => toggle(c.slug)}
                    style={({ pressed }) => [
                      styles.item,
                      {
                        borderColor: active ? c.color : t.colors.border,
                        backgroundColor: active ? `${c.color}22` : 'rgba(255,255,255,0.04)',
                        opacity: pressed ? 0.86 : 1,
                      },
                    ]}
                  >
                    <LexText variant="h3" style={{ fontSize: 22 }}>
                      {c.emoji}
                    </LexText>
                    <LexText variant="title" style={{ marginTop: 6 }}>
                      {c.name}
                    </LexText>
                    <LexText variant="muted" style={{ marginTop: 4, fontSize: 11 }}>
                      {c.is_premium ? 'Premium' : 'Free'} · {c.word_count.toLocaleString()} words
                    </LexText>
                  </Pressable>
                );
              })}
            </View>
            {loading ? (
              <LexText variant="muted" style={{ marginTop: 12 }}>
                Loading categories…
              </LexText>
            ) : null}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(520)} style={{ marginTop: 14 }}>
          <View style={styles.planPreview}>
            <LinearGradient
              colors={['rgba(123,111,255,0.24)', 'rgba(0,229,184,0.10)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <LexText variant="label" style={{ color: t.colors.accentTeal }}>
              Your starter plan
            </LexText>
            <LexText variant="title" style={{ marginTop: 8 }}>
              {selectedNames}
            </LexText>
            <View style={styles.planStats}>
              <PlanStat value={String(dailyGoalWords)} label="words/day" />
              <PlanStat value={proficiencyLevel ?? 'B1'} label="level" />
              <PlanStat value="4 min" label="first win" />
            </View>
          </View>
          {!selected.length && touched ? (
            <LexText variant="muted" style={{ textAlign: 'center', color: t.colors.accentPink, marginTop: 10 }}>
              Pick at least one topic to start.
            </LexText>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).duration(520)} style={{ marginTop: 16, gap: 10 }}>
          <Button title="Start Learning →" onPress={proceed} />
          <Button title="Back" variant="ghost" onPress={onBack} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function PlanStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.planStat}>
      <LexText variant="title" style={{ fontSize: 15 }}>
        {value}
      </LexText>
      <LexText variant="label" style={{ fontSize: 9, marginTop: 2 }}>
        {label}
      </LexText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: { width: '48%', borderWidth: 1, borderRadius: 16, padding: 14 },
  planPreview: {
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    padding: 16,
  },
  planStats: { flexDirection: 'row', gap: 8, marginTop: 14 },
  planStat: {
    flex: 1,
    minHeight: 58,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});
