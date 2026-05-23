import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import { env, hasSupabase } from './env';

/**
 * TODO: Generate full Database types from your Supabase project and replace this placeholder.
 * (e.g. using supabase CLI `supabase gen types typescript ...`)
 */
export type Database = any;

export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export function assertSupabaseConfigured() {
  if (!hasSupabase()) {
    throw new Error(
      'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in an .env file.'
    );
  }
}

