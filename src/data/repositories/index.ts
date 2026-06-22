import { supabaseCategoriesRepo, supabasePlacementRepo, supabaseWordsRepo } from './supabaseRepo';
import { localCategoriesRepo, localPlacementRepo, localWordsRepo } from './localRepo';
import { hasSupabase } from '../../services/env';

const useSupabase = hasSupabase();

export const repos = {
  words: useSupabase ? supabaseWordsRepo : localWordsRepo,
  categories: useSupabase ? supabaseCategoriesRepo : localCategoriesRepo,
  placement: useSupabase ? supabasePlacementRepo : localPlacementRepo,
} as const;
