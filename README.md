# Lexora (Expo + React Native)

Lexora is a mobile-first vocabulary learning app built with **Expo (SDK 56)**, **React Native**, and **Expo Router**. It includes guided onboarding, daily learning missions, spaced review, games, dictionary discovery, progress coaching, leagues, premium preview, and an AI tutor experience.

## What’s included

- Expo + TypeScript + Expo Router (file-based routing)
- Dark-only theme + typography (Syne + DM Sans)
- App routes for: onboarding, home, learn, review, games, social, dictionary, AI tutor chat, premium, progress, settings, and admin tools
- SRS utility (SM-2 style) in `src/utils/srs.ts`
- Local data fallback plus Supabase repositories in `src/data/repositories/*`
- Supabase and AI tutor services in `src/services/*` using `.env` variables

## Requirements

- Node.js 18+ (recommended for Expo SDK 56)
- npm
- iOS: Xcode (for Simulator) or a physical device
- Android: Android Studio (for Emulator) or a physical device

## Run

```bash
cd lexora
npm install
npm run start
```

Then choose a target:

```bash
npm run ios
npm run android
npm run web
```

## Configure environment variables

1. Copy `.env.example` → `.env`
2. Fill keys:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_ANTHROPIC_API_KEY` (development-only live tutor; offline tutor coaching works without it)
- `EXPO_PUBLIC_REVENUECAT_API_KEY` (optional future billing integration; the current premium preview stores access locally)

Notes:

- Expo only exposes env vars prefixed with `EXPO_PUBLIC_` to the JavaScript runtime.
- Don’t call Anthropic directly from the client in production. Proxy through a backend (or Supabase Edge Function) to keep keys private and enable streaming safely.

## Supabase setup (optional)

Lexora can run without Supabase using local/mock data, but Supabase is the intended sync/backend.

- Schema: [schema.sql](supabase/schema.sql)
- Repository adapter: [supabaseRepo.ts](src/data/repositories/supabaseRepo.ts)

Minimal setup:

1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor.
3. Put the project URL + anon key into `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).

## AI Tutor (optional)

- Client integration: [aiTutor.ts](src/services/aiTutor.ts)
- Current behavior: uses offline coaching when no Anthropic key is configured, calls Anthropic in development when `EXPO_PUBLIC_ANTHROPIC_API_KEY` is set, and remains disabled for production client-side API calls.

## Project structure

- `app/` — routes (Expo Router)
- `src/screens/` — screen implementations used by routes
- `src/components/` — reusable UI
- `src/theme/` — tokens, fonts, theme provider
- `src/data/` — seed data, mock DB, repositories
- `src/services/` — Supabase + AI integration points
- `supabase/` — database schema

## Architecture / roadmap

- Architecture notes: [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Roadmap: [ROADMAP.md](docs/ROADMAP.md)


## Current product loops

1. **Onboarding**: account entry, placement, goals, topic selection, and starter-plan preview.
2. **Home**: smart daily mission, streak, word of the day, daily challenge, and quick actions.
3. **Learn + Review**: card-based learning, quiz checkpoints, SM-2 review, completion coaching, and next-step routing.
4. **Games**: personalized arcade run, recommended game, and reward-focused completion states.
5. **Dictionary**: guided discovery, personalized filters, skeleton loading, empty states, and word detail practice actions.
6. **AI Tutor**: coach paths, offline coaching, live development mode, streaming-style responses, and word follow-ups.
7. **Progress + Social**: momentum insight, achievement progress, leagues, and friend challenges.
