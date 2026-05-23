import type { Category, PlacementQuestion, Word } from '../../domain/schema';

export type WordsRepository = {
  getWordOfTheDay: () => Promise<Word>;
  getDailySessionWords: (count: number) => Promise<Word[]>;
  search: (query: string, opts?: { category?: string | null; difficulty?: number | null }) => Promise<Word[]>;
  getById: (id: string) => Promise<Word | null>;
};

export type CategoriesRepository = {
  list: () => Promise<Category[]>;
};

export type PlacementRepository = {
  list: () => Promise<PlacementQuestion[]>;
};

