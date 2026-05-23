import { supabase, assertSupabaseConfigured } from './supabase';

/**
 * Minimal helper layer (Prompt 2).
 * Replace `any` with generated DB types once you have a Supabase project.
 */

export async function getCategories(): Promise<any[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function searchWords(query: string): Promise<any[]> {
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

export async function getWordById(id: string): Promise<any | null> {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from('words').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function upsertUserProfile(profile: any) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from('user_profiles').upsert(profile).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertUserWordProgress(progress: any) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.from('user_word_progress').upsert(progress).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

