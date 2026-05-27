import { supabaseCategoriesRepo, supabasePlacementRepo, supabaseWordsRepo } from './supabaseRepo';

export const repos = {
  words: supabaseWordsRepo,
  categories: supabaseCategoriesRepo,
  placement: supabasePlacementRepo,
} as const;
