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

Premium kid visual patterns live in `src/components/kids/KidVisualSystem.tsx`.

- `KidMissionConstellation`: the primary home mission surface. It turns daily quest service data into a compact animated path with a curved route, 3D-style nodes, progress rings, reward chip, and one next-step CTA.
- `KidOnboardingDock`: the first-run control surface. It combines step progress, swipe/dot navigation, focus selection, parent access, back navigation, and the primary CTA so onboarding does not feel like disconnected website sections.
- `KidContentPulseCard`: a high-energy generated-content preview used when the Content Creation Engine needs to feel more like a playable feature than a dashboard module.

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

Practice sessions use `src/services/kidPracticeExperienceService.ts` for mode themes, mission steps, dictionary insight cards, coaching copy, and completion plans. New lesson types should extend that service first, then render through the shared practice stage, reward trail, feedback, and completion patterns.

Adaptive memory review lives in `src/services/kidAdaptiveLearningService.ts`. Lesson completion should pass word-level results into the store so words move through new, learning, review, strong, and mastered states with due timing. Home, Review, and Practice should read the adaptive queue instead of hardcoded review cards.

Buddy Roleplay lives in `src/services/kidRoleplayService.ts` and `/kids-roleplay`. It is the kid-safe implementation of the competitor pattern: real-world scenario practice, character-guided conversation, immediate response coaching, "Explain my answer" feedback, XP reward, and word-level review scheduling.

Daily Quest orchestration lives in `src/services/kidDailyQuestService.ts`. Home, Games, and Progress should render quest state from this service so the daily path, next action, XP reward, play step, focus words, and parent summary stay consistent instead of being manually assembled per screen.

Home should stay mission-first: show the child header, one rich mission constellation, compact stats, a small set of quick actions, then next lessons/explore. Avoid reintroducing separate daily quest grids that duplicate the same steps and make the screen feel long or messy.

Daily Quest reward claiming lives at `/kids-quest-reward`. The claim id is date-specific and stored in kid runtime state so the chest can award XP once, add focus words back into Memory Boost, then become a collected reward instead of an infinite XP tap target.

Play Studio content lives in `src/services/kidPlayStudioService.ts`. The Games tab should render games, songs, read-alouds, roleplay, and daily challenges from this service so entertainment-style learning is backed by real lesson routes, dictionary focus words, quest progress, and XP rewards instead of screen-local arrays.

Content Creation Engine lives in `src/services/kidContentCreationEngine.ts` and `/kids-content-studio`. It composes dictionary words, adaptive review, daily quests, lessons, courses, and roleplay scenarios into fresh mini-lessons, stories, songs, roleplays, review games, and teacher drafts. Home, Learn, Play Studio, and Teacher Studio should consume this engine for dynamic content instead of adding hardcoded feature-specific data.

Alphabet Art Studio lives in `src/services/kidAlphabetStudioService.ts`, `src/data/kids-alphabet.json`, and `/kids-alphabet-studio`. It is the model for "Interactive Learning for Curious Kids": trace a letter, paint with kid-safe tools, hear phonics/audio, connect the letter to dictionary-backed words, and earn XP from a tactile creative action. Screens should link to this route for alphabet, drawing, painting, phonics, and early-literacy entry points instead of sending every alphabet tap to generic Learn.

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
- Buddy Roleplay: `/kids-roleplay`.
- Daily Quest reward chest: `/kids-quest-reward`.
- Content Creation Studio: `/kids-content-studio`.
- Alphabet Art Studio: `/kids-alphabet-studio`.
- Review: `/(tabs)/review`.
- Games/daily challenge: `/(tabs)/games`.
- Rewards/badges: `/rewards`.
- Leaderboard/friends: `/(tabs)/social`.
- Profile/progress: `/progress`.
- Parent dashboard: `/parent`.
- Admin/teacher content management: `/admin`.

## Content and Runtime State

Curriculum seed content for profiles, courses, lessons, badges, friends, leaderboard, missions, and quiz questions lives in `src/data/kidContent.ts`. Rich kid dictionary content lives in `src/data/kids-dictionary.json` and is accessed through `src/services/kidDictionaryService.ts`.

Screens should not embed dictionary words, definitions, examples, pronunciation text, or lesson-linked word sets directly. They should ask the service for featured words, daily sets, category filters, lesson words, and generated practice activities. This keeps the UI ready for Supabase-backed content or licensed dictionary imports without rewriting screen code.

User-specific progress, parent session state, lesson completion, badge unlocks, missions, word mastery, and friend challenges are persisted through `src/store/useAppStore.ts` and derived by `src/services/kidLearningService.ts`.

Parent gates use `src/services/kidParentSafetyService.ts` for rotating challenge prompts and short-lived unlock checks. Do not put fixed gate answers directly in screens.
