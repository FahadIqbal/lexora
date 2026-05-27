import { getSupabase, type Database } from './supabase';

type CategoriesRow = Database['public']['Tables']['categories']['Row'];
type WordRow = Database['public']['Tables']['words']['Row'];
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
type UserWordProgressInsert = Database['public']['Tables']['user_word_progress']['Insert'];
type UserWordProgressRow = Database['public']['Tables']['user_word_progress']['Row'];

export async function getCategories(): Promise<CategoriesRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getUserProfile(id: string): Promise<UserProfileRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('user_profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function searchWords(query: string): Promise<WordRow[]> {
  const supabase = getSupabase();
  const q = query.trim();
  const like = `%${q}%`;
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .or(`word.ilike.${like},short_definition.ilike.${like},definition.ilike.${like}`)
    .order('frequency_rank', { ascending: true })
    .limit(30);
  if (error) throw error;
  return data ?? [];
}

export async function searchWordsAdvanced(opts: {
  query: string;
  category?: string | null;
  difficulty?: number | null;
  limit?: number;
}): Promise<WordRow[]> {
  const supabase = getSupabase();
  const q = opts.query.trim();
  const like = `%${q}%`;
  let req = supabase
    .from('words')
    .select('*')
    .or(`word.ilike.${like},short_definition.ilike.${like},definition.ilike.${like}`)
    .order('frequency_rank', { ascending: true });

  if (opts.category) {
    req = req.overlaps('categories', [opts.category]);
  }
  if (opts.difficulty) {
    req = req.eq('difficulty_level', opts.difficulty);
  }

  const { data, error } = await req.limit(opts.limit ?? 30);
  if (error) throw error;
  return data ?? [];
}

export async function getWordsSlice(opts: {
  limit: number;
  offset?: number;
  categories?: string[] | null;
  difficultyMax?: number | null;
  difficultyMin?: number | null;
}): Promise<WordRow[]> {
  const supabase = getSupabase();
  let req = supabase.from('words').select('*').order('frequency_rank', { ascending: true });

  if (opts.categories && opts.categories.length > 0) {
    req = req.overlaps('categories', opts.categories);
  }
  if (typeof opts.difficultyMax === 'number') {
    req = req.lte('difficulty_level', opts.difficultyMax);
  }
  if (typeof opts.difficultyMin === 'number') {
    req = req.gte('difficulty_level', opts.difficultyMin);
  }

  const offset = Math.max(0, opts.offset ?? 0);
  const { data, error } = await req.range(offset, offset + Math.max(0, opts.limit - 1));
  if (error) throw error;
  return data ?? [];
}

export async function getWordById(id: string): Promise<WordRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('words').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function upsertUserProfile(profile: UserProfileInsert): Promise<UserProfileRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('user_profiles').upsert(profile).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertUserWordProgress(progress: UserWordProgressInsert): Promise<UserWordProgressRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('user_word_progress').upsert(progress).select('*').maybeSingle();
  if (error) throw error;
  return data;
}
