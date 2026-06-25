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
- White and warm cream backgrounds keep screens child-friendly and readable.

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

## Animation Rules

- Use entrance animations on cards and major sections.
- Buttons should compress on press.
- Progress bars animate from previous state.
- Correct answers show success color and completion celebration.
- Wrong answers shake gently and explain the hint.
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

## Content Data

Mock content for profiles, courses, lessons, badges, friends, leaderboard, missions, and quiz questions lives in `src/data/kidsMock.ts`. Replace this gradually with backend data without changing the presentation components.
