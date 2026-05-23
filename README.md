# Lexora (Expo + React Native)

This repo is scaffolded from your uploaded **Lexora** prompt pack and design showcase:

- Expo + TypeScript + Expo Router (file-based routing)
- Dark-only theme tokens (Syne + DM Sans)
- Placeholder screens for: onboarding, home, learn, review, games, social, dictionary, AI tutor chat, settings
- SM-2 style SRS utility (`src/utils/srs.ts`)
- Supabase + AI service stubs (`src/services/*`) using `.env` variables

## Run

```bash
cd lexora
npm install
npm run start
```

## Configure environment variables

1. Copy `.env.example` → `.env`
2. Fill keys:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_ANTHROPIC_API_KEY` *(optional for now — the app will show a friendly “not configured” message)*

> Note: In production, do **not** call Anthropic directly from the client. We’ll add a tiny backend (or Supabase Edge Function) to proxy requests and enable streaming safely.

## Where to build next (recommended order)

1. **Onboarding flow (5 screens)** + placement test animations
2. **Home dashboard** (streak card, word-of-the-day, goal progress, quick actions)
3. **Learn mode** (card stack + flip + quiz checkpoints)
4. **Review mode** (SRS + rating buttons + history)
5. **Dictionary** (debounced search + filters)
6. **Games** (6 screens)
7. **AI Tutor** (streaming + word cards)
8. **Social + leagues**

