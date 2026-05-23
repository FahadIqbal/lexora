# Lexora — Execution Roadmap (Prompts 1–14)

This project is implementing your uploaded prompt pack **in order**, with **mock/local data first** (so the full UI/logic works immediately), then a clean swap to Supabase/Claude/RevenueCat when keys are ready.

## Prompt 1 — Project setup & architecture
Status: **Done**
- Expo + TypeScript
- Expo Router + Reanimated + Gesture Handler + SVG + Lottie support
- `/src` structure + theme + fonts

## Prompt 2 — Supabase schema & setup
Status: **Scaffolded**
- Client wrapper (`src/services/supabase.ts`) + env flags
- Next: SQL schema + RLS policies + generated types + CRUD helpers

## Prompt 3 — Onboarding flow (Screens 1–5)
Status: **Next**
- 5 screens, shared-element style transitions, progress indicator
- Welcome particles, sign-in labels + shake, placement test, goals, category picker

## Prompt 4 — Home
- Dashboard UI, streak card, word-of-the-day expand, daily goal progress, quick actions, weekly chart (SVG)

## Prompt 5 — Learn mode
- Swipeable 3-card stack, 3D flip, quiz checkpoints, session complete

## Prompt 6 — Review mode
- SM-2 rating buttons, per-card animations, session summary charts

## Prompt 7 — Word games (6)
- Each game as a screen + shared engine (timer/xp/results/word-set)

## Prompt 8 — AI tutor chat
- Markdown bubbles, chips, streaming stub, word-card rendering

## Prompt 9 — Progress & statistics
- Custom SVG charts + animations, achievements, heatmap

## Prompt 10 — Leaderboard & social
- Weekly leagues, friends, challenges, activity feeds

## Prompt 11 — Dictionary / browse
- Search + filters + word detail + lists

## Prompt 12 — Notifications/settings/paywall
- Expo notifications scaffolding + RevenueCat placeholder

## Prompt 13 — Polish & performance
- Global micro-interactions, skeleton shimmer, screen transitions, perf passes

## Prompt 14 — Word seeding script
- Script skeleton now; runnable after Supabase keys/tables are ready

