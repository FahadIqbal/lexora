import type { KidPracticeMode } from '../data/kidContent';
import { getKidContentCreationEngine } from './kidContentCreationEngine';
import { getDailyKidDictionarySet, getFeaturedKidWords, type KidDictionaryEntry } from './kidDictionaryService';
import { getKidDailyQuest, type KidDailyQuest } from './kidDailyQuestService';
import { getKidLessons, type KidRuntimeState } from './kidLearningService';
import { getKidRoleplayScenarios } from './kidRoleplayService';

export type KidPlayStudioItemKind = 'game' | 'song' | 'read-aloud' | 'roleplay' | 'challenge';

export type KidPlayStudioItem = {
  id: string;
  kind: KidPlayStudioItemKind;
  title: string;
  subtitle: string;
  coachLine: string;
  icon: string;
  color: string;
  accent: string;
  route: string;
  progress: number;
  rewardXp: number;
  minutes: number;
  tag: string;
  mode?: KidPracticeMode;
  focusWords: KidDictionaryEntry[];
};

export type KidPlayStudioShelf = {
  id: string;
  title: string;
  subtitle: string;
  items: KidPlayStudioItem[];
};

export type KidPlayStudio = {
  hero: KidPlayStudioItem;
  quest: KidDailyQuest;
  shelves: KidPlayStudioShelf[];
};

export function getKidPlayStudio(kid: KidRuntimeState): KidPlayStudio {
  const quest = getKidDailyQuest(kid);
  const contentEngine = getKidContentCreationEngine(kid);
  const lessons = getKidLessons(kid);
  const unlocked = lessons.filter((lesson) => !lesson.locked);
  const dailyWords = getDailyKidDictionarySet(kid, 6);
  const featuredWords = getFeaturedKidWords(kid, 6);
  const words = uniqueEntries([...quest.focusWords, ...dailyWords, ...featuredWords]);
  const roleplay = getKidRoleplayScenarios(kid)[0];
  const listening = unlocked.find((lesson) => lesson.type === 'listening') ?? unlocked[0] ?? lessons[0];
  const speaking = unlocked.find((lesson) => lesson.type === 'speaking') ?? unlocked[0] ?? lessons[0];
  const grammar = unlocked.find((lesson) => lesson.type === 'grammar') ?? unlocked[0] ?? lessons[0];
  const story = unlocked.find((lesson) => lesson.type === 'story' || lesson.type === 'reading') ?? unlocked[0] ?? lessons[0];
  const vocabulary = unlocked.find((lesson) => lesson.type === 'vocabulary') ?? unlocked[0] ?? lessons[0];

  const gameItems: KidPlayStudioItem[] = [
    fromLesson({
      id: 'listening-pop',
      kind: 'game',
      title: 'Listening Pop',
      subtitle: 'Hear a word and tap the picture.',
      coachLine: `Listen for ${words[0]?.word ?? 'the word'}, then choose fast.`,
      icon: '🎧',
      lesson: listening,
      color: '#55B7FF',
      accent: '#FFD93D',
      rewardXp: 30,
      minutes: 3,
      tag: 'Audio',
    }),
    fromLesson({
      id: 'speaking-star',
      kind: 'game',
      title: 'Speaking Star',
      subtitle: 'Say the answer out loud with Buddy.',
      coachLine: `Use your voice for ${words[1]?.word ?? 'today’s word'}.`,
      icon: '🎤',
      lesson: speaking,
      color: '#FF7A7A',
      accent: '#51D9A8',
      rewardXp: 35,
      minutes: 3,
      tag: 'Voice',
    }),
    fromLesson({
      id: 'grammar-garden',
      kind: 'game',
      title: 'Grammar Garden',
      subtitle: 'Fix tiny sentences and grow flowers.',
      coachLine: 'Buddy explains why the best sentence works.',
      icon: '🌱',
      lesson: grammar,
      color: '#51D9A8',
      accent: '#8174F2',
      rewardXp: 35,
      minutes: 4,
      tag: 'Explain',
    }),
  ];

  const varietyItems: KidPlayStudioItem[] = [
    {
      id: 'word-song',
      kind: 'song',
      title: 'Word Song Mix',
      subtitle: words.slice(0, 3).map((entry) => entry.word).join(', ') || 'Sing today’s words',
      coachLine: 'Tap into a speaking round that repeats words with rhythm.',
      icon: '🎵',
      color: '#FFD93D',
      accent: '#8174F2',
      route: `/practice/speaking?lesson=${speaking.id}`,
      progress: speaking.progress,
      rewardXp: 25,
      minutes: 2,
      tag: 'Song',
      mode: 'speaking',
      focusWords: words.slice(0, 4),
    },
    fromLesson({
      id: 'story-theater',
      kind: 'read-aloud',
      title: 'Story Theater',
      subtitle: story.title,
      coachLine: 'Read like a tiny episode, then unlock the next scene.',
      icon: '🎬',
      lesson: story,
      color: '#8174F2',
      accent: '#FFD93D',
      rewardXp: 40,
      minutes: 5,
      tag: 'Read',
    }),
    {
      id: 'buddy-scene',
      kind: 'roleplay',
      title: roleplay.title,
      subtitle: roleplay.subtitle,
      coachLine: roleplay.objective,
      icon: roleplay.icon,
      color: roleplay.color,
      accent: roleplay.accent,
      route: `/kids-roleplay?scenario=${roleplay.id}`,
      progress: quest.steps.find((step) => step.kind === 'roleplay')?.progress ?? 0,
      rewardXp: roleplay.rewardXp,
      minutes: 3,
      tag: 'Talk',
      mode: 'speaking',
      focusWords: roleplay.focusWords,
    },
  ];

  const challengeItems: KidPlayStudioItem[] = [
    {
      id: 'quest-challenge',
      kind: 'challenge',
      title: quest.nextStep.title,
      subtitle: quest.nextStep.subtitle,
      coachLine: quest.nextStep.reason,
      icon: quest.nextStep.icon,
      color: quest.nextStep.color,
      accent: quest.nextStep.accent,
      route: quest.nextStep.route,
      progress: quest.nextStep.progress,
      rewardXp: quest.nextStep.rewardXp,
      minutes: quest.nextStep.minutes,
      tag: quest.nextStep.label,
      mode: quest.nextStep.mode,
      focusWords: quest.focusWords,
    },
    fromLesson({
      id: 'vocab-arcade',
      kind: 'challenge',
      title: 'Picture Arcade',
      subtitle: vocabulary.title,
      coachLine: `Match pictures for ${words[2]?.word ?? 'new words'} and save them to Memory Boost.`,
      icon: '🧩',
      lesson: vocabulary,
      color: '#51D9A8',
      accent: '#FFD93D',
      rewardXp: 30,
      minutes: 3,
      tag: 'Words',
    }),
  ];

  const creatorItems = contentEngine.shelves[0]?.items.map((item) => ({
    id: item.id,
    kind: item.kind === 'song' || item.kind === 'roleplay' ? item.kind : item.kind === 'story' ? 'read-aloud' as const : 'challenge' as const,
    title: item.title,
    subtitle: item.subtitle,
    coachLine: item.learningGoal,
    icon: item.icon,
    color: item.color,
    accent: item.accent,
    route: item.route,
    progress: item.kind === 'roleplay' ? quest.steps.find((step) => step.kind === 'roleplay')?.progress ?? 0 : 0,
    rewardXp: item.rewardXp,
    minutes: item.minutes,
    tag: item.level,
    mode: item.mode,
    focusWords: item.focusWords,
  })) ?? [];

  return {
    hero: creatorItems[0] ?? varietyItems[0] ?? gameItems[0] ?? challengeItems[0],
    quest,
    shelves: [
      {
        id: 'creator-picks',
        title: 'Creator picks',
        subtitle: 'Fresh packs generated from today’s dictionary, quest, and memory state.',
        items: creatorItems,
      },
      {
        id: 'play-games',
        title: 'Game worlds',
        subtitle: 'Fast practice loops for listening, speaking, and grammar.',
        items: gameItems,
      },
      {
        id: 'shows-songs',
        title: 'Shows, songs, and roleplay',
        subtitle: 'Entertainment-style learning with real practice routes.',
        items: varietyItems,
      },
      {
        id: 'daily-challenges',
        title: 'Daily challenges',
        subtitle: 'Quest-aware activities that move today’s progress.',
        items: challengeItems,
      },
    ],
  };
}

function fromLesson(input: {
  id: string;
  kind: KidPlayStudioItemKind;
  title: string;
  subtitle: string;
  coachLine: string;
  icon: string;
  lesson: ReturnType<typeof getKidLessons>[number];
  color: string;
  accent: string;
  rewardXp: number;
  minutes: number;
  tag: string;
}): KidPlayStudioItem {
  return {
    id: input.id,
    kind: input.kind,
    title: input.title,
    subtitle: input.subtitle,
    coachLine: input.coachLine,
    icon: input.icon,
    color: input.color,
    accent: input.accent,
    route: `/practice/${input.lesson.type}?lesson=${input.lesson.id}`,
    progress: input.lesson.progress,
    rewardXp: input.rewardXp,
    minutes: input.minutes,
    tag: input.tag,
    mode: input.lesson.type,
    focusWords: [],
  };
}

function uniqueEntries(entries: KidDictionaryEntry[]) {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}
