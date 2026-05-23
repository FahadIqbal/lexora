import type { CategoriesRepository, PlacementRepository, WordsRepository } from './types';
import { getCategories, getWordById, searchWords } from '../../services/supabaseHelpers';
import { assertSupabaseConfigured } from '../../services/supabase';
import { seed } from '../seed';
import { CategorySchema, WordSchema, type Category, type Word } from '../../domain/schema';

// Note: placement test questions are not part of Prompt 2 tables.
// We keep them local for now.
export const supabasePlacementRepo: PlacementRepository = {
  async list() {
    return seed.placement;
  },
};

export const supabaseCategoriesRepo: CategoriesRepository = {
  async list() {
    assertSupabaseConfigured();
    const rows = await getCategories();
    return rows.map((r) => CategorySchema.parse(r)) as Category[];
  },
};

export const supabaseWordsRepo: WordsRepository = {
  async getWordOfTheDay() {
    // Until you implement a server-selected WOTD, pick a deterministic word from Supabase by searching and rotating locally.
    const rows = await searchWords('');
    const parsed = rows.map((r) => WordSchema.parse(r)) as Word[];
    const day = Math.floor(Date.now() / 86_400_000);
    return parsed[day % parsed.length];
  },

  async getDailySessionWords(count: number) {
    // Placeholder strategy: take top by frequency.
    const rows = await searchWords('');
    const parsed = rows.map((r) => WordSchema.parse(r)) as Word[];
    return parsed.slice(0, count);
  },

  async search(query: string, opts) {
    // Supabase-side filtering can be improved later (category array contains, difficulty, etc.)
    const rows = await searchWords(query);
    let parsed = rows.map((r) => WordSchema.parse(r)) as Word[];
    if (opts?.difficulty) parsed = parsed.filter((w) => w.difficulty_level === opts.difficulty);
    if (opts?.category) parsed = parsed.filter((w) => w.categories.includes(opts.category as string));
    return parsed;
  },

  async getById(id: string) {
    const row = await getWordById(id);
    if (!row) return null;
    return WordSchema.parse(row) as Word;
  },
};
