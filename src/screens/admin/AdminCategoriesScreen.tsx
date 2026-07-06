import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { LexText } from '../../components/LexText';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { hasSupabase } from '../../services/env';
import { getSupabase, type Database } from '../../services/supabase';
import { useAppStore } from '../../store/useAppStore';
import { useAsyncResource } from '../../hooks/useAsyncResource';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

const emptyDraft: CategoryInsert = {
  slug: '',
  name: '',
  emoji: null,
  description: null,
  word_count: 0,
  color: '#7B6FFF',
  is_premium: false,
};

function normalizeCategoryDraft(draft: CategoryInsert) {
  const wordCount =
    typeof draft.word_count === 'number' && Number.isFinite(draft.word_count)
      ? Math.max(0, Math.round(draft.word_count))
      : 0;

  return {
    ...draft,
    slug: (draft.slug ?? '').trim().toLowerCase().replace(/\s+/g, '-'),
    name: (draft.name ?? '').trim(),
    emoji: (draft.emoji ?? '').trim() || null,
    description: (draft.description ?? '').trim() || null,
    word_count: wordCount,
    color: (draft.color ?? '').trim() || '#7B6FFF',
    is_premium: Boolean(draft.is_premium),
  } satisfies CategoryInsert;
}

export function AdminCategoriesScreen() {
  const t = useTheme();
  const userId = useAppStore((s) => s.user.id);
  const isAdmin = useAppStore((s) => s.user.isAdmin);

  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState<CategoryRow | null>(null);
  const [draft, setDraft] = useState<CategoryInsert>(emptyDraft);

  const status = useMemo(() => {
    if (!hasSupabase()) return { title: 'Backend not configured', body: 'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.' };
    if (!userId) return { title: 'Sign in required', body: 'Sign in to access the admin panel.' };
    if (!isAdmin) return { title: 'Access denied', body: 'Your account is not marked as admin in the database.' };
    return null;
  }, [userId, isAdmin]);

  const { data: rows, loading, error } = useAsyncResource(async () => {
    if (!hasSupabase()) return [] as CategoryRow[];
    const supabase = getSupabase();
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    return (data ?? []) as CategoryRow[];
  }, [refresh]);

  const reset = () => {
    setSelected(null);
    setDraft(emptyDraft);
  };

  const applySelect = (category: CategoryRow) => {
    setSelected(category);
    setDraft({
      id: category.id,
      slug: category.slug,
      name: category.name,
      emoji: category.emoji,
      description: category.description,
      word_count: category.word_count ?? 0,
      color: category.color ?? '#7B6FFF',
      is_premium: category.is_premium ?? false,
    });
  };

  const save = async () => {
    if (status) return;
    const payload = normalizeCategoryDraft(draft);
    if (!payload.slug || !payload.name) {
      Alert.alert('Missing details', 'Please enter a category name and slug.');
      return;
    }

    const supabase = getSupabase();
    if (payload.id) {
      const { error } = await supabase.from('categories').update(payload).eq('id', payload.id);
      if (error) {
        Alert.alert('Save failed', error.message);
        return;
      }
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) {
        Alert.alert('Create failed', error.message);
        return;
      }
    }

    setRefresh((x) => x + 1);
    reset();
  };

  const remove = async () => {
    if (status || !selected?.id) return;
    Alert.alert('Delete category?', 'This only deletes the category row. Words using this slug are not changed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const supabase = getSupabase();
          const { error } = await supabase.from('categories').delete().eq('id', selected.id);
          if (error) {
            Alert.alert('Delete failed', error.message);
            return;
          }
          setRefresh((x) => x + 1);
          reset();
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.wrap}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <LexText variant="title" style={{ color: t.colors.muted }}>
              ← Admin
            </LexText>
          </Pressable>
          <Pressable onPress={reset} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <LexText variant="title" style={{ color: t.colors.muted }}>
              New
            </LexText>
          </Pressable>
        </View>

        <LexText variant="h2" style={{ marginTop: 10 }}>
          Categories
        </LexText>
        <LexText variant="muted" style={{ marginTop: 6 }}>
          Manage category labels, premium flags, and colors.
        </LexText>

        {status ? (
          <Card style={{ marginTop: 16 }}>
            <LexText variant="title">{status.title}</LexText>
            <LexText variant="muted" style={{ marginTop: 8 }}>
              {status.body}
            </LexText>
          </Card>
        ) : null}

        <View style={{ flex: 1, flexDirection: 'row', gap: 12, marginTop: 14 }}>
          <Card style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
            <View style={{ padding: 12, borderBottomWidth: 1, borderColor: t.colors.border }}>
              <LexText variant="title">Categories</LexText>
              <LexText variant="muted" style={{ marginTop: 4 }}>
                {(rows ?? []).length} items
              </LexText>
            </View>
            <View style={{ flex: 1 }}>
              <FlashList
                data={rows ?? []}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />}
                renderItem={({ item }) => {
                  const active = selected?.id === item.id;
                  return (
                    <Pressable
                      onPress={() => applySelect(item)}
                      style={({ pressed }) => [
                        styles.listRow,
                        {
                          backgroundColor: active ? 'rgba(108,99,255,0.14)' : pressed ? 'rgba(255,255,255,0.06)' : 'transparent',
                        },
                      ]}
                    >
                      <View style={[styles.swatch, { backgroundColor: item.color ?? t.colors.accentPurple }]} />
                      <View style={{ flex: 1 }}>
                        <LexText variant="title">
                          {item.emoji ? `${item.emoji} ` : ''}
                          {item.name}
                        </LexText>
                        <LexText variant="muted" numberOfLines={1} style={{ marginTop: 4 }}>
                          {item.slug}
                          {item.is_premium ? ' · premium' : ''}
                        </LexText>
                      </View>
                      <LexText variant="muted" style={{ marginLeft: 10 }}>
                        {item.word_count ?? 0}
                      </LexText>
                    </Pressable>
                  );
                }}
              />
              {loading ? (
                <View style={{ padding: 12 }}>
                  <LexText variant="muted">Loading…</LexText>
                </View>
              ) : null}
              {error ? (
                <View style={{ padding: 12 }}>
                  <LexText variant="muted" style={{ color: t.colors.accentPink }}>
                    Failed to load categories.
                  </LexText>
                </View>
              ) : null}
            </View>
          </Card>

          <Card style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6 }}>
              <LexText variant="title">{selected ? 'Edit category' : 'New category'}</LexText>

              <View style={{ marginTop: 12, gap: 10 }}>
                <Field label="Name" value={draft.name ?? ''} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} />
                <Field label="Slug" value={draft.slug ?? ''} onChange={(v) => setDraft((d) => ({ ...d, slug: v }))} />
                <Field label="Emoji" value={draft.emoji ?? ''} onChange={(v) => setDraft((d) => ({ ...d, emoji: v }))} />
                <Field label="Description" value={draft.description ?? ''} onChange={(v) => setDraft((d) => ({ ...d, description: v }))} multiline />
                <Field label="Word count" value={String(draft.word_count ?? 0)} onChange={(v) => setDraft((d) => ({ ...d, word_count: v ? Number(v) : 0 }))} keyboard="number-pad" />
                <Field label="Color" value={draft.color ?? ''} onChange={(v) => setDraft((d) => ({ ...d, color: v }))} />

                <View style={[styles.switchRow, { borderColor: t.colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <LexText variant="title">Premium category</LexText>
                    <LexText variant="muted" style={{ marginTop: 3, fontSize: 13 }}>
                      Gate this category behind premium access.
                    </LexText>
                  </View>
                  <Switch
                    value={Boolean(draft.is_premium)}
                    onValueChange={(v) => setDraft((d) => ({ ...d, is_premium: v }))}
                    trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(0,229,184,0.45)' }}
                    thumbColor={draft.is_premium ? t.colors.accentTeal : '#F2F0FF'}
                  />
                </View>
              </View>

              <View style={{ marginTop: 14, gap: 10 }}>
                <Button title={selected ? 'Save changes' : 'Create category'} onPress={save} disabled={Boolean(status)} />
                {selected ? <Button title="Delete category" variant="ghost" onPress={remove} /> : null}
              </View>
            </ScrollView>
          </Card>
        </View>
      </View>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboard,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboard?: 'default' | 'number-pad';
  multiline?: boolean;
}) {
  const t = useTheme();
  return (
    <View>
      <LexText variant="label" style={{ marginBottom: 6 }}>
        {label}
      </LexText>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        multiline={multiline}
        placeholderTextColor={t.colors.muted}
        style={[
          styles.field,
          {
            minHeight: multiline ? 88 : 48,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderColor: t.colors.border,
            color: t.colors.text,
            fontFamily: t.font.body.regular,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18 },
  listRow: { paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: { width: 16, height: 16, borderRadius: 8 },
  field: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  switchRow: { borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
});
