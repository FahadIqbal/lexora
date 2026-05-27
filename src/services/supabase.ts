import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env, hasSupabase } from './env';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          emoji: string | null;
          description: string | null;
          word_count: number | null;
          color: string | null;
          is_premium: boolean | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          emoji?: string | null;
          description?: string | null;
          word_count?: number | null;
          color?: string | null;
          is_premium?: boolean | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          emoji?: string | null;
          description?: string | null;
          word_count?: number | null;
          color?: string | null;
          is_premium?: boolean | null;
        };
        Relationships: [];
      };
      words: {
        Row: {
          id: string;
          word: string;
          phonetic: string | null;
          part_of_speech: string | null;
          definition: string | null;
          short_definition: string | null;
          etymology: string | null;
          difficulty_level: number | null;
          frequency_rank: number | null;
          categories: string[] | null;
          example_sentences: Json | null;
          synonyms: string[] | null;
          antonyms: string[] | null;
          image_url: string | null;
          audio_url: string | null;
          mnemonic: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          word: string;
          phonetic?: string | null;
          part_of_speech?: string | null;
          definition?: string | null;
          short_definition?: string | null;
          etymology?: string | null;
          difficulty_level?: number | null;
          frequency_rank?: number | null;
          categories?: string[] | null;
          example_sentences?: Json | null;
          synonyms?: string[] | null;
          antonyms?: string[] | null;
          image_url?: string | null;
          audio_url?: string | null;
          mnemonic?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          word?: string;
          phonetic?: string | null;
          part_of_speech?: string | null;
          definition?: string | null;
          short_definition?: string | null;
          etymology?: string | null;
          difficulty_level?: number | null;
          frequency_rank?: number | null;
          categories?: string[] | null;
          example_sentences?: Json | null;
          synonyms?: string[] | null;
          antonyms?: string[] | null;
          image_url?: string | null;
          audio_url?: string | null;
          mnemonic?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          level: number | null;
          xp_total: number | null;
          streak_current: number | null;
          streak_longest: number | null;
          streak_last_date: string | null;
          daily_goal_words: number | null;
          proficiency_level: string | null;
          selected_categories: string[] | null;
          is_premium: boolean | null;
          is_admin: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          level?: number | null;
          xp_total?: number | null;
          streak_current?: number | null;
          streak_longest?: number | null;
          streak_last_date?: string | null;
          daily_goal_words?: number | null;
          proficiency_level?: string | null;
          selected_categories?: string[] | null;
          is_premium?: boolean | null;
          is_admin?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          level?: number | null;
          xp_total?: number | null;
          streak_current?: number | null;
          streak_longest?: number | null;
          streak_last_date?: string | null;
          daily_goal_words?: number | null;
          proficiency_level?: string | null;
          selected_categories?: string[] | null;
          is_premium?: boolean | null;
          is_admin?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      user_word_progress: {
        Row: {
          id: string;
          user_id: string;
          word_id: string;
          status: string;
          ease_factor: number | null;
          interval: number | null;
          repetitions: number | null;
          next_review_date: string | null;
          last_reviewed_at: string | null;
          correct_count: number | null;
          incorrect_count: number | null;
          first_seen_at: string | null;
          mastered_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          word_id: string;
          status?: string;
          ease_factor?: number | null;
          interval?: number | null;
          repetitions?: number | null;
          next_review_date?: string | null;
          last_reviewed_at?: string | null;
          correct_count?: number | null;
          incorrect_count?: number | null;
          first_seen_at?: string | null;
          mastered_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          word_id?: string;
          status?: string;
          ease_factor?: number | null;
          interval?: number | null;
          repetitions?: number | null;
          next_review_date?: string | null;
          last_reviewed_at?: string | null;
          correct_count?: number | null;
          incorrect_count?: number | null;
          first_seen_at?: string | null;
          mastered_at?: string | null;
        };
        Relationships: [];
      };
      user_daily_stats: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          words_learned: number | null;
          words_reviewed: number | null;
          xp_earned: number | null;
          time_spent_seconds: number | null;
          sessions_count: number | null;
          accuracy_percent: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          words_learned?: number | null;
          words_reviewed?: number | null;
          xp_earned?: number | null;
          time_spent_seconds?: number | null;
          sessions_count?: number | null;
          accuracy_percent?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          words_learned?: number | null;
          words_reviewed?: number | null;
          xp_earned?: number | null;
          time_spent_seconds?: number | null;
          sessions_count?: number | null;
          accuracy_percent?: number | null;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_slug: string;
          unlocked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_slug: string;
          unlocked_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_slug?: string;
          unlocked_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let supabaseClient: SupabaseClient<Database> | null = null;

export function assertSupabaseConfigured() {
  if (!hasSupabase()) {
    throw new Error(
      'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in an .env file.'
    );
  }
}

export function getSupabase(): SupabaseClient<Database> {
  assertSupabaseConfigured();
  if (supabaseClient) return supabaseClient;
  supabaseClient = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: AsyncStorage,
    },
  });
  return supabaseClient;
}
