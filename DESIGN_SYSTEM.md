# Lexora Kids Design System

## Product Direction

Lexora Kids is a bright, playful English learning app for children and young learners. The UI should feel closer to Duolingo, Lingokids, Khan Academy Kids, and premium educational animation than a productivity dashboard.

## Colors

Primary tokens live in `src/theme/kidTheme.ts`.

- Purple `#8174F2`: main brand, active tabs, course highlights.
- Blue `#55B7FF`: listening, phonics, calm interactive states.
- Yellow `#FFD93D`: XP, rewards, primary CTAs, stars.
- Coral `#FF7A7A`: speaking, challenges, gentle correction.
- Mint `#51D9A8`: success, review, completion, safety.
- White and soft blue backgrounds keep screens child-friendly, readable, and less dashboard-like.

Avoid dark corporate surfaces for kid-facing screens.

## Typography

The app uses DM Sans with large, friendly hierarchy:

- H1/H2: onboarding, lesson questions, hero cards.
- H3/Title: card titles, lesson names, section headers.
- Muted: short helper copy only.
- Labels: XP chips, streaks, category tags, status pills.

Children should never have to read long paragraphs to know what to do.

## Spacing and Shape

- Minimum tap target: 44px.
- Standard card radius: 30px.
- Small chips/buttons: fully rounded pills.
- Use generous spacing between lesson choices.
- Prefer single-purpose cards over dense dashboards.

## Components

Reusable kid UI lives in `src/components/kids/KidKit.tsx`.

- `KidScreen`: light shell with safe-area handling and soft decorative shapes.
- `KidHeader`: consistent child-friendly screen header.
- `KidCard`: soft rounded card with light border and shadow.
- `KidButton`: bouncy pill CTA.
- `KidPill`: category/status filter.
- `KidAvatar`: child/friend avatar bubble.
- `KidProgressBar`: animated progress.
- `CharacterBubble`: idle animated character/reward bubble.
- `LessonCard`: reusable course/lesson row.
- `QuizOption`: multiple-choice option with correct/wrong states.
- `BadgeTile`: rewards and locked badge states.

Centralized kid visual assets live in `src/assets/kidAssets.ts`. Screens should pull character, route, category, and native icon references from that file instead of scattering visual constants through feature code.

## Product Loops

Kid-facing screens should show a clear loop instead of isolated information:

- Goal: a quest, world, mission, or next unlock.
- Action: one obvious practice, review, story, or game CTA.
- Feedback: buddy explanation, progress fill, XP, stars, or recall timing.
- Reward: badge cabinet, character reward, streak, or social challenge.

Competitor-inspired loops are modeled as reusable content, not one-off screen copy:

- `kidOnboardingSlides`: swipe-first onboarding that introduces quest play, roleplay, spaced recall, and family safety.
- `kidFeaturePowerUps`: roleplay, answer explanation, spaced review, and story studio surfaces used across Home and Games.
- `kidLearningTracks`: skill worlds for vocabulary, phonics/listening, stories, and sentence practice.
- `kidReviewSchedule`: visual spaced-repetition states for fresh words, recall checks, and long-term mastery.

Course and progress screens also use `kidParentInsights` and `kidTeacherPipelines` from `src/data/kidContent.ts` so content remains structured and reusable.

## 3D And Depth

Kid-facing hero areas should feel like a toy-like learning world:

- Use layered plates, soft highlights, floating tokens, and deep shadows for 3D-style depth.
- Keep 3D effects lightweight with React Native/Reanimated transforms; avoid heavy rendering unless a real 3D scene is required.
- Floating elements must support the user goal: XP, audio, review, roleplay, or story cues.
- Do not let decorative art hide the CTA, progress, or next action.

## Animation Rules

- Use entrance animations on cards and major sections.
- Buttons should compress on press.
- Progress bars animate from previous state.
- Correct answers show success color and completion celebration.
- Wrong answers shake gently and explain the hint.
- Continuous motion should use subtle Reanimated transform loops on small elements only.
- Separate entrance animations from continuous transform animations with wrapper views to avoid Reanimated transform conflicts.
- Motion should feel delightful but never slow down the task.

## Screen Coverage

The current kid-focused routes include:

- Splash: native Expo splash + first onboarding screen.
- Onboarding: `/onboarding`.
- Login/signup: `/auth`.
- Child profile selection: `/child-profiles`.
- Home dashboard: `/(tabs)/home`.
- Course/category selection and lesson list: `/(tabs)/learn`.
- Lesson detail: `/lessons/[id]`.
- Interactive vocabulary/listening/speaking/reading/grammar/story practice: `/practice/[mode]`.
- Review: `/(tabs)/review`.
- Games/daily challenge: `/(tabs)/games`.
- Rewards/badges: `/rewards`.
- Leaderboard/friends: `/(tabs)/social`.
- Profile/progress: `/progress`.
- Parent dashboard: `/parent`.
- Admin/teacher content management: `/admin`.

## Content and Runtime State

Curriculum seed content for profiles, courses, lessons, badges, friends, leaderboard, missions, and quiz questions lives in `src/data/kidContent.ts`. User-specific progress, parent session state, lesson completion, badge unlocks, missions, and friend challenges are persisted through `src/store/useAppStore.ts` and derived by `src/services/kidLearningService.ts`.
