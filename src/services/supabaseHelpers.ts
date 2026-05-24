import { supabase, assertSupabaseConfigured, type Database } from './supabase';

type CategoriesRow = Database['public']['Tables']['categories']['Row'];
type WordRow = Database['public']['Tables']['words']['Row'];
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
type UserWordProgressInsert = Database['public']['Tables']['user_word_progress']['Insert'];
type UserWordProgressRow = Database['public']['Tables']['user_word_progress']['Row'];

export async function getCategories(): Promise<CategoriesRow[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function searchWords(query: string): Promise<WordRow[]> {
  assertSupabaseConfigured();
  const q = query.trim();
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .ilike('word', `%${q}%`)
    .order('frequency_rank', { ascending: true })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function getWordById(id: string): Promise<WordRow | null> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from('words').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function upsertUserProfile(profile: UserProfileInsert): Promise<UserProfileRow | null> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from('user_profiles').upsert(profile).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertUserWordProgress(progress: UserWordProgressInsert): Promise<UserWordProgressRow | null> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from('user_word_progress').upsert(progress).select('*').maybeSingle();
  if (error) throw error;
  return data;
}
