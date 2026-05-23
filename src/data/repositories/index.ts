import { hasSupabase } from '../../services/env';
import { localCategoriesRepo, localPlacementRepo, localWordsRepo } from './localRepo';
import { supabaseCategoriesRepo, supabasePlacementRepo, supabaseWordsRepo } from './supabaseRepo';

export const repos = {
  words: hasSupabase() ? supabaseWordsRepo : localWordsRepo,
  categories: hasSupabase() ? supabaseCategoriesRepo : localCategoriesRepo,
  placement: hasSupabase() ? supabasePlacementRepo : localPlacementRepo,
} as const;

