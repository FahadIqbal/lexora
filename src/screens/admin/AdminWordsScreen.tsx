import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
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

type WordRow = Database['public']['Tables']['words']['Row'];
type WordInsert = Database['public']['Tables']['words']['Insert'];

function csvToArray(s: string) {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function arrayToCsv(arr: string[] | null | undefined) {
  return (arr ?? []).join(', ');
}

function normalizeWordDraft(d: WordInsert) {
  const difficulty =
    typeof d.difficulty_level === 'number' && Number.isFinite(d.difficulty_level)
      ? Math.min(5, Math.max(1, Math.round(d.difficulty_level)))
      : null;
  const freq =
    typeof d.frequency_rank === 'number' && Number.isFinite(d.frequency_rank) ? Math.max(0, Math.round(d.frequency_rank)) : null;

  return {
    ...d,
    word: (d.word ?? '').trim(),
    short_definition: (d.short_definition ?? '').trim() || null,
    definition: (d.definition ?? '').trim() || null,
    part_of_speech: (d.part_of_speech ?? '').trim() || null,
    phonetic: (d.phonetic ?? '').trim() || null,
    etymology: (d.etymology ?? '').trim() || null,
    mnemonic: (d.mnemonic ?? '').trim() || null,
    image_url: (d.image_url ?? '').trim() || null,
    audio_url: (d.audio_url ?? '').trim() || null,
    difficulty_level: difficulty,
    frequency_rank: freq,
    categories: Array.isArray(d.categories) ? d.categories : [],
    synonyms: Array.isArray(d.synonyms) ? d.synonyms : [],
    antonyms: Array.isArray(d.antonyms) ? d.antonyms : [],
    example_sentences: d.example_sentences ?? [],
  } satisfies WordInsert;
}

export function AdminWordsScreen() {
  const t = useTheme();
  const userId = useAppStore((s) => s.user.id);
  const isAdmin = useAppStore((s) => s.user.isAdmin);

  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState<WordRow | null>(null);
  const [draft, setDraft] = useState<WordInsert>({
    word: '',
    definition: null,
    short_definition: null,
    part_of_speech: null,
    phonetic: null,
    etymology: null,
    mnemonic: null,
    categories: [],
    difficulty_level: null,
    frequency_rank: null,
    synonyms: [],
    antonyms: [],
    example_sentences: [],
    image_url: null,
    audio_url: null,
  });

  useEffect(() => {
    const id = setTimeout(() => setDq(q), 220);
    return () => clearTimeout(id);
  }, [q]);

  const status = useMemo(() => {
    if (!hasSupabase()) return { title: 'Backend not configured', body: 'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.' };
    if (!userId) return { title: 'Sign in required', body: 'Sign in to access the admin panel.' };
    if (!isAdmin) return { title: 'Access denied', body: 'Your account is not marked as admin in the database.' };
    return null;
  }, [userId, isAdmin]);

  const { data: rows, loading, error } = useAsyncResource(async () => {
    if (!hasSupabase()) return [] as WordRow[];
    const supabase = getSupabase();
    const like = `%${dq.trim()}%`;
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .or(`word.ilike.${like},short_definition.ilike.${like},definition.ilike.${like}`)
      .order('frequency_rank', { ascending: true })
      .limit(60);
    if (error) throw error;
    return (data ?? []) as WordRow[];
  }, [dq, refresh]);

  const applySelect = (w: WordRow) => {
    setSelected(w);
    setDraft({
      id: w.id,
      word: w.word,
      definition: w.definition,
      short_definition: w.short_definition,
      part_of_speech: w.part_of_speech,
      phonetic: w.phonetic,
      etymology: w.etymology,
      mnemonic: w.mnemonic,
      categories: w.categories ?? [],
      difficulty_level: w.difficulty_level,
      frequency_rank: w.frequency_rank,
      synonyms: w.synonyms ?? [],
      antonyms: w.antonyms ?? [],
      example_sentences: w.example_sentences ?? [],
      image_url: w.image_url,
      audio_url: w.audio_url,
    });
  };

  const reset = () => {
    setSelected(null);
    setDraft({
      word: '',
      definition: null,
      short_definition: null,
      part_of_speech: null,
      phonetic: null,
      etymology: null,
      mnemonic: null,
      categories: [],
      difficulty_level: null,
      frequency_rank: null,
      synonyms: [],
      antonyms: [],
      example_sentences: [],
      image_url: null,
      audio_url: null,
    });
  };

  const save = async () => {
    if (status) return;
    const supabase = getSupabase();
    const payload = normalizeWordDraft(draft);
    if (!payload.word) {
      Alert.alert('Missing word', 'Please enter a word.');
      return;
    }
    if (!payload.definition && !payload.short_definition) {
      Alert.alert('Missing definition', 'Please add a definition or short definition.');
      return;
    }

    if (payload.id) {
      const { error } = await supabase.from('words').update(payload).eq('id', payload.id);
      if (error) {
        Alert.alert('Save failed', error.message);
        return;
      }
    } else {
      const { error } = await supabase.from('words').insert(payload);
      if (error) {
        Alert.alert('Create failed', error.message);
        return;
      }
    }

    setRefresh((x) => x + 1);
    reset();
  };

  const remove = async () => {
    if (status) return;
    if (!selected?.id) return;
    Alert.alert('Delete word?', 'This will permanently delete the word.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const supabase = getSupabase();
          const { error } = await supabase.from('words').delete().eq('id', selected.id);
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
          Words
        </LexText>
        <LexText variant="muted" style={{ marginTop: 6 }}>
          Edit your dictionary content.
        </LexText>

        {status ? (
          <Card style={{ marginTop: 16 }}>
            <LexText variant="title">{status.title}</LexText>
            <LexText variant="muted" style={{ marginTop: 8 }}>
              {status.body}
            </LexText>
          </Card>
        ) : null}

        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search words, definitions…"
          placeholderTextColor={t.colors.muted}
          style={[
            styles.input,
            { backgroundColor: t.colors.surface, borderColor: t.colors.border, color: t.colors.text, fontFamily: t.font.body.regular },
          ]}
        />

        <View style={{ flex: 1, flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Card style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
            <View style={{ padding: 12, borderBottomWidth: 1, borderColor: t.colors.border }}>
              <LexText variant="title">Results</LexText>
              <LexText variant="muted" style={{ marginTop: 4 }}>
                {(rows ?? []).length} items
              </LexText>
            </View>
            <View style={{ flex: 1 }}>
              <FlashList
                data={(rows ?? []) as any}
                keyExtractor={(x: any) => x.id}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />}
                renderItem={({ item }: any) => {
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
                      <View style={{ flex: 1 }}>
                        <LexText variant="title">{item.word}</LexText>
                        <LexText variant="muted" numberOfLines={1} style={{ marginTop: 4 }}>
                          {item.short_definition || item.definition}
                        </LexText>
                      </View>
                      <LexText variant="muted" style={{ marginLeft: 10 }}>
                        {item.difficulty_level ?? ''}
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
                    Failed to load words.
                  </LexText>
                </View>
              ) : null}
            </View>
          </Card>

          <Card style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6 }}>
              <LexText variant="title">{selected ? 'Edit word' : 'New word'}</LexText>

              <View style={{ marginTop: 12, gap: 10 }}>
                <Field label="Word" value={draft.word ?? ''} onChange={(v) => setDraft((d) => ({ ...d, word: v }))} />
                <Field
                  label="Short definition"
                  value={draft.short_definition ?? ''}
                  onChange={(v) => setDraft((d) => ({ ...d, short_definition: v }))}
                  multiline
                />
                <Field
                  label="Definition"
                  value={draft.definition ?? ''}
                  onChange={(v) => setDraft((d) => ({ ...d, definition: v }))}
                  multiline
                />
                <Field
                  label="Part of speech"
                  value={draft.part_of_speech ?? ''}
                  onChange={(v) => setDraft((d) => ({ ...d, part_of_speech: v }))}
                />
                <Field
                  label="Difficulty (1–5)"
                  value={draft.difficulty_level ? String(draft.difficulty_level) : ''}
                  onChange={(v) => setDraft((d) => ({ ...d, difficulty_level: v ? Number(v) : null }))}
                  keyboard="number-pad"
                />
                <Field
                  label="Frequency rank"
                  value={draft.frequency_rank ? String(draft.frequency_rank) : ''}
                  onChange={(v) => setDraft((d) => ({ ...d, frequency_rank: v ? Number(v) : null }))}
                  keyboard="number-pad"
                />
                <Field
                  label="Categories (comma separated slugs)"
                  value={arrayToCsv(draft.categories as any)}
                  onChange={(v) => setDraft((d) => ({ ...d, categories: csvToArray(v) }))}
                />
                <Field
                  label="Synonyms (comma separated)"
                  value={arrayToCsv(draft.synonyms as any)}
                  onChange={(v) => setDraft((d) => ({ ...d, synonyms: csvToArray(v) }))}
                />
                <Field
                  label="Antonyms (comma separated)"
                  value={arrayToCsv(draft.antonyms as any)}
                  onChange={(v) => setDraft((d) => ({ ...d, antonyms: csvToArray(v) }))}
                />
                <Field
                  label="Mnemonic"
                  value={draft.mnemonic ?? ''}
                  onChange={(v) => setDraft((d) => ({ ...d, mnemonic: v }))}
                  multiline
                />
              </View>

              <View style={{ marginTop: 14, gap: 10 }}>
                <Button title={selected ? 'Save changes' : 'Create word'} onPress={save} disabled={Boolean(status)} />
                {selected ? <Button title="Delete word" variant="ghost" onPress={remove} /> : null}
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
  input: { marginTop: 14, height: 48, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1 },
  listRow: { paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  field: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
});
