import type { CategoriesRepository, PlacementRepository, WordsRepository } from './types';
import { getCategories, getWordById, getWordsSlice, searchWordsAdvanced } from '../../services/supabaseHelpers';
import { assertSupabaseConfigured } from '../../services/supabase';
import { PlacementQuestionSchema, CategorySchema, WordSchema, type Category, type PlacementQuestion, type Word } from '../../domain/schema';

export const supabasePlacementRepo: PlacementRepository = {
  async list() {
    assertSupabaseConfigured();

    const seedNum = Math.floor(Date.now() / 86_400_000);
    const words = await getWordsSlice({ limit: 40, offset: (seedNum * 17) % 1000 });
    const parsed = words.map((r) => WordSchema.parse(r)) as Word[];

    const usable = parsed.filter((w) => Boolean(w.word) && Boolean(w.short_definition || w.definition));
    if (usable.length < 12) return [];

    const pick = (excludeWord?: string) => {
      for (let k = 0; k < 20; k++) {
        const w = usable[Math.floor(Math.random() * usable.length)];
        if (!excludeWord || w.word !== excludeWord) return w;
      }
      return usable[0];
    };

    const questions: PlacementQuestion[] = [];
    const questionCount = 5;
    for (let i = 0; i < questionCount; i++) {
      const target = pick();
      const correctDef = target.short_definition || target.definition;
      const wrongDefs = new Set<string>();
      while (wrongDefs.size < 3) {
        const w = pick(target.word);
        const d = w.short_definition || w.definition;
        if (d && d !== correctDef) wrongDefs.add(d);
      }
      const choices = [correctDef, ...Array.from(wrongDefs)].sort(() => Math.random() - 0.5);
      const correctIndex = choices.indexOf(correctDef);
      const q = PlacementQuestionSchema.parse({
        word: target.word,
        levelHint: target.difficulty_level >= 4 ? 'Advanced' : target.difficulty_level >= 3 ? 'Intermediate' : 'Beginner',
        choices,
        correctIndex,
      }) as PlacementQuestion;
      questions.push(q);
    }

    return questions;
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
    assertSupabaseConfigured();
    const day = Math.floor(Date.now() / 86_400_000);
    const rows = await getWordsSlice({ limit: 1, offset: (day * 13) % 2000 });
    const parsed = rows.map((r) => WordSchema.parse(r)) as Word[];
    if (parsed[0]) return parsed[0];
    const fallback = await getWordsSlice({ limit: 1, offset: 0 });
    if (!fallback[0]) throw new Error('No words found in dictionary');
    return WordSchema.parse(fallback[0]) as Word;
  },

  async getDailySessionWords(count: number, opts) {
    assertSupabaseConfigured();
    const day = Math.floor(Date.now() / 86_400_000);
    const seedNum = opts?.seed ?? day;
    const offset = (seedNum * Math.max(3, count)) % 3000;

    const rows = await getWordsSlice({
      limit: count,
      offset,
      categories: opts?.categories ?? null,
      difficultyMax: typeof opts?.difficultyMax === 'number' ? opts.difficultyMax : null,
    });
    const parsed = rows.map((r) => WordSchema.parse(r)) as Word[];
    if (parsed.length >= count) return parsed;

    const fallback = await getWordsSlice({
      limit: count,
      offset: 0,
      categories: opts?.categories ?? null,
      difficultyMax: typeof opts?.difficultyMax === 'number' ? opts.difficultyMax : null,
    });
    return fallback.map((r) => WordSchema.parse(r)) as Word[];
  },

  async search(query: string, opts) {
    assertSupabaseConfigured();
    const rows = await searchWordsAdvanced({
      query,
      category: opts?.category ?? null,
      difficulty: opts?.difficulty ?? null,
      limit: 30,
    });
    return rows.map((r) => WordSchema.parse(r)) as Word[];
  },

  async getById(id: string) {
    assertSupabaseConfigured();
    const row = await getWordById(id);
    if (!row) return null;
    return WordSchema.parse(row) as Word;
  },
};
