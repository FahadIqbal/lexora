# Lexora (Expo + React Native)

Lexora is a vocabulary-learning app scaffold built with **Expo (SDK 56)**, **React Native**, and **Expo Router**. It includes a dark-only UI, placeholder feature screens, and scaffolding for SRS review, Supabase sync, and an AI tutor.

## What’s included

- Expo + TypeScript + Expo Router (file-based routing)
- Dark-only theme + typography (Syne + DM Sans)
- App shell and routes for: onboarding, home, learn, review, games, social, dictionary, AI tutor chat, settings
- SRS utility (SM-2 style) in `src/utils/srs.ts`
- Data layer scaffolding (local + Supabase repositories) in `src/data/repositories/*`
- Service stubs for Supabase and AI tutor in `src/services/*` using `.env` variables

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
- `EXPO_PUBLIC_ANTHROPIC_API_KEY` (optional for now — the app shows a friendly “not configured” message)
- `EXPO_PUBLIC_REVENUECAT_API_KEY` (optional; paywall is scaffold-only)

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

- Client stub: [aiTutor.ts](src/services/aiTutor.ts)
- Current behavior: returns a helpful message if not configured; otherwise returns a placeholder response.

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


## Where to build next (recommended order)

1. **Onboarding flow (5 screens)** + placement test animations
2. **Home dashboard** (streak card, word-of-the-day, goal progress, quick actions)
3. **Learn mode** (card stack + flip + quiz checkpoints)
4. **Review mode** (SRS + rating buttons + history)
5. **Dictionary** (debounced search + filters)
6. **Games** (6 screens)
7. **AI Tutor** (streaming + word cards)
8. **Social + leagues**
