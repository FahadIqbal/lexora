# Expo HAS CHANGED (SDK 56)

Always read the versioned Expo docs before changing native-facing behavior:

https://docs.expo.dev/versions/v56.0.0/

## Project constraints (Lexora)

- Expo SDK: `~56.x` ([app.json](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/app.json), [package.json](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/package.json))
- Routing: Expo Router (`app/` is the source of truth for navigation)
- Env vars: only `EXPO_PUBLIC_*` are available in the app runtime
- Supabase: enabled when `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set
- AI Tutor (Anthropic): enabled in development when `EXPO_PUBLIC_ANTHROPIC_API_KEY` is set; do not ship client-side keys in production

## Security rules

- Never commit `.env` or any secrets.
- Treat all `EXPO_PUBLIC_*` values as public (they can be extracted from the client build).
- AI requests must be proxied through a backend/Edge Function for production.

## Where “skills” live

- Skills overview: [SKILLS.md](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/SKILLS.md)
- AI Tutor integration: [aiTutor.ts](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/src/services/aiTutor.ts)
- Supabase client + types: [supabase.ts](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/src/services/supabase.ts)
