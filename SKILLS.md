# Lexora Skills

This project uses the word “skills” to mean the app’s core capabilities that are wired end-to-end (or explicitly gated) in the codebase.

## 1) AI Tutor (Claude)

**Status:** Implemented (development-only direct API). Production must proxy through a backend/Edge Function.

- UI: [ChatScreen.tsx](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/src/screens/ChatScreen.tsx)
- Service: [aiTutor.ts](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/src/services/aiTutor.ts)
- Env: [env.ts](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/src/services/env.ts)

**How it works**

- When `EXPO_PUBLIC_ANTHROPIC_API_KEY` is missing: the tutor returns a friendly “not configured” message.
- When `EXPO_PUBLIC_ANTHROPIC_API_KEY` exists and the build is dev (`__DEV__`): the tutor calls the Anthropic Messages API and returns Markdown.
- When the build is production: the tutor is intentionally disabled to avoid shipping client-side keys.

## 2) Supabase Auth (Email + Password)

**Status:** Implemented (enabled only when Supabase env vars exist).

- Onboarding auth step: [AuthStep.tsx](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/src/screens/onboarding/steps/AuthStep.tsx)
- Supabase client (RN session persistence + typed schema): [supabase.ts](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/src/services/supabase.ts)

**How it works**

- If `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are missing, onboarding runs in local mode.
- If configured, signup/signin uses Supabase Auth and then upserts `user_profiles`.

## 3) Supabase Data Layer (Categories / Words)

**Status:** Implemented (read flows; filtering strategy can be refined later).

- Repositories: [supabaseRepo.ts](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/src/data/repositories/supabaseRepo.ts)
- Query helpers (typed): [supabaseHelpers.ts](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/src/services/supabaseHelpers.ts)
- Schema reference: [schema.sql](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/supabase/schema.sql)

## 4) Offline-First Learning (SRS + Progress)

**Status:** Implemented (works without Supabase).

- Store (streaks, XP, progress, stats): [useAppStore.ts](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/src/store/useAppStore.ts)
- SM-2 scheduler: [srs.ts](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/src/utils/srs.ts)
- Seed data: [seed](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/src/data/seed/index.ts)

## 5) Word Seeding CLI (Supabase + Claude)

**Status:** Implemented (Node script; requires env vars).

- Script: [seed-words.ts](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/scripts/seed-words.ts)
- Command: `npm run seed:words` ([package.json](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/package.json))

**Requirements**

- `.env` with `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_ANTHROPIC_API_KEY`
- Supabase schema applied ([schema.sql](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/supabase/schema.sql))

## 6) Screens / Navigation Shell

**Status:** Implemented (routes + UI; some feature screens are scaffold-level).

- Routes: [app](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/app)
- Screens: [src/screens](file:///Users/fahadiqbal/Downloads/Latest%20Projects/Lexora/lexora/src/screens)
