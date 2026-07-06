export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  anthropicApiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
  aiTutorProxyUrl: process.env.EXPO_PUBLIC_AI_TUTOR_PROXY_URL ?? '',
  revenueCatApiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '',
} as const;

export function isDevelopmentRuntime() {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

export function hasSupabase() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasAnthropic() {
  return isDevelopmentRuntime() && Boolean(env.anthropicApiKey);
}

export function hasAiTutorProxy() {
  return Boolean(env.aiTutorProxyUrl);
}

export function hasLiveAiTutor() {
  return hasAiTutorProxy() || hasAnthropic();
}
