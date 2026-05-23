import type { CategoriesRepository, PlacementRepository, WordsRepository } from './types';
import { seed } from '../seed';
import type { Word } from '../../domain/schema';

export const localCategoriesRepo: CategoriesRepository = {
  async list() {
    return seed.categories;
  },
};

export const localPlacementRepo: PlacementRepository = {
  async list() {
    return seed.placement;
  },
};

export const localWordsRepo: WordsRepository = {
  async getWordOfTheDay() {
    // deterministic rotation (today index) without hardcoding a specific word
    const day = Math.floor(Date.now() / 86_400_000);
    return seed.words[day % seed.words.length];
  },

  async getDailySessionWords(count: number) {
    const out: Word[] = [];
    const day = Math.floor(Date.now() / 86_400_000);
    for (let i = 0; i < count; i++) out.push(seed.words[(day + i) % seed.words.length]);
    return out;
  },

  async search(query: string, opts) {
    const q = query.trim().toLowerCase();
    const cat = opts?.category ?? null;
    const diff = opts?.difficulty ?? null;

    return seed.words.filter((w) => {
      const matchQ =
        !q ||
        w.word.toLowerCase().includes(q) ||
        w.short_definition.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q);
      const matchCat = !cat || w.categories.includes(cat);
      const matchDiff = !diff || w.difficulty_level === diff;
      return matchQ && matchCat && matchDiff;
    });
  },

  async getById(id: string) {
    return seed.words.find((w) => w.id === id) ?? null;
  },
};

