export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  anthropicApiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
  revenueCatApiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '',
} as const;

export function hasSupabase() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasAnthropic() {
  return Boolean(env.anthropicApiKey);
}

