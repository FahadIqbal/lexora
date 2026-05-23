# Lexora — Architecture Notes

## Principles
- **Mock-first**: every screen/flow works offline using `src/data/*` + `src/store/*`.
- **Swapable services**: all external systems live behind `src/services/*`.
- **Animation budget first**: Reanimated-driven interactions are treated as core product features.

## Folder structure
- `app/` Expo Router routes (thin wrappers)
- `src/screens/` feature UI
- `src/components/` reusable UI primitives
- `src/store/` Zustand state + derived selectors
- `src/services/` Supabase/AI/notifications/paywall
- `src/utils/` algorithms (SRS, helpers)
- `src/data/` mock words, categories, placement test items

## Data model (mock now, Supabase later)
We follow Prompt 2 tables:
- `words`
- `categories`
- `user_profiles`
- `user_word_progress`
- `user_daily_stats`
- `user_achievements`

Mock data sources live in `src/data/mockDb.ts` and are shaped to match these tables.

## AI tutor architecture
- UI: `src/screens/ChatScreen.tsx`
- Client stub: `src/services/aiTutor.ts`
- Production: move Anthropic calls to a backend (Supabase Edge Function or minimal API) for streaming + secret safety.

