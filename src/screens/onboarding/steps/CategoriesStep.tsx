import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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

  const toggle = (slug: string) => {
    setTouched(true);
    hapticSelection();
    setSelected(selected.includes(slug) ? selected.filter((x) => x !== slug) : [...selected, slug]);
  };

  const proceed = () => {
    if (!selected.length) {
      Alert.alert('Choose at least 1 topic', 'Pick a category to personalize your daily words.');
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(520).springify().damping(16)}>
          <LexText variant="h2">Pick your topics</LexText>
          <LexText variant="muted" style={{ marginTop: 6 }}>
            Select at least 1 category. Premium categories are marked.
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
          <LexText variant="muted" style={{ textAlign: 'center' }}>
            {selected.length} topics selected
          </LexText>
          {!selected.length && touched ? (
            <LexText variant="muted" style={{ textAlign: 'center', color: t.colors.accentPink, marginTop: 6 }}>
              Minimum 1 required
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: { width: '48%', borderWidth: 1, borderRadius: 16, padding: 14 },
});
