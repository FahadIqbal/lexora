import type { KidPracticeMode } from '../data/kidContent';
import { getKidAdaptiveReviewQueue } from './kidAdaptiveLearningService';
import {
  getDailyKidDictionarySet,
  getFeaturedKidWords,
  getKidDictionaryEntries,
  type KidDictionaryEntry,
} from './kidDictionaryService';
import { getKidDailyQuest } from './kidDailyQuestService';
import {
  getActiveKidProfile,
  getKidCourses,
  getKidLessons,
  type KidRuntimeState,
} from './kidLearningService';
import { getKidRoleplayScenarios } from './kidRoleplayService';

export type KidGeneratedContentKind = 'mini-lesson' | 'story' | 'song' | 'roleplay' | 'review-game' | 'teacher-draft';

export type KidGeneratedContentItem = {
  id: string;
  kind: KidGeneratedContentKind;
  title: string;
  subtitle: string;
  learningGoal: string;
  previewLine: string;
  icon: string;
  color: string;
  accent: string;
  route: string;
  minutes: number;
  rewardXp: number;
  level: string;
  mode: KidPracticeMode;
  focusWords: KidDictionaryEntry[];
  steps: string[];
  accessibilityLabel: string;
};

export type KidGeneratedContentShelf = {
  id: string;
  title: string;
  subtitle: string;
  items: KidGeneratedContentItem[];
};

export type KidContentCreationEngine = {
  id: string;
  dayKey: string;
  seed: number;
  title: string;
  subtitle: string;
  creatorLine: string;
  hero: KidGeneratedContentItem;
  shelves: KidGeneratedContentShelf[];
  adminDrafts: KidGeneratedContentItem[];
  parentHighlights: string[];
  coverage: Array<{ label: string; value: string; color: string }>;
};

const storyFrames = [
  'A tiny door opens in the classroom.',
  'Buddy hears a sound near the rainbow shelf.',
  'A friendly helper needs the right English word.',
  'The story ends when the learner says the key sentence.',
] as const;

const songFrames = [
  'Clap, say, tap, and repeat the focus words.',
  'Hear each word slowly, then say it with rhythm.',
  'Finish with a silly sentence using all words.',
] as const;

export function getKidContentCreationEngine(kid: KidRuntimeState, now = Date.now()): KidContentCreationEngine {
  const child = getActiveKidProfile(kid);
  const dayKey = new Date(now).toISOString().slice(0, 10);
  const seed = hashSeed(`${child.id}:${dayKey}:${Object.keys(kid.lessonProgress).length}`);
  const quest = getKidDailyQuest(kid, now);
  const courses = getKidCourses(kid);
  const lessons = getKidLessons(kid);
  const unlocked = lessons.filter((lesson) => !lesson.locked);
  const dictionary = getKidDictionaryEntries();
  const reviewWords = getKidAdaptiveReviewQueue(kid, 8, now).map((item) => item.entry);
  const dailyWords = getDailyKidDictionarySet(kid, 8);
  const featuredWords = getFeaturedKidWords(kid, 8);
  const words = uniqueEntries([...quest.focusWords, ...reviewWords, ...dailyWords, ...featuredWords, ...dictionary]);
  const roleplay = getKidRoleplayScenarios(kid)[seed % getKidRoleplayScenarios(kid).length];
  const lessonByMode = createLessonPicker(unlocked.length ? unlocked : lessons);
  const wordA = words[seed % words.length];
  const wordB = words[(seed + 2) % words.length];
  const wordC = words[(seed + 5) % words.length];
  const miniLesson = generatedFromLesson({
    id: `mini-${dayKey}-${wordA.id}`,
    kind: 'mini-lesson',
    title: `${capitalize(wordA.word)} Power Lesson`,
    subtitle: `A fresh mini lesson with ${wordA.word}, ${wordB.word}, and ${wordC.word}.`,
    learningGoal: `Understand, hear, and use ${wordA.word} in a short sentence.`,
    previewLine: `${wordA.emoji} ${wordA.word}: ${wordA.kidDefinition}`,
    icon: wordA.emoji,
    color: wordA.color,
    accent: '#FFD93D',
    lesson: lessonByMode('vocabulary'),
    minutes: 4,
    rewardXp: 35,
    level: `Age ${child.age}`,
    focusWords: [wordA, wordB, wordC],
    steps: [
      `Look at ${wordA.word} and say what it means.`,
      `Hear ${wordB.word}, then tap the matching picture.`,
      `Use ${wordC.word} in one friendly sentence.`,
    ],
  });

  const story = generatedFromLesson({
    id: `story-${dayKey}-${wordB.id}`,
    kind: 'story',
    title: `${capitalize(wordB.word)} Story Spark`,
    subtitle: `A read-aloud episode generated from today’s words.`,
    learningGoal: `Read a tiny story and answer a meaning question.`,
    previewLine: `${storyFrames[seed % storyFrames.length]} Buddy whispers “${wordB.word}.”`,
    icon: '🎬',
    color: '#8174F2',
    accent: '#51D9A8',
    lesson: lessonByMode('reading'),
    minutes: 5,
    rewardXp: 45,
    level: courses[0]?.level ?? 'Beginner',
    focusWords: [wordB, wordC, wordA],
    steps: [
      storyFrames[(seed + 1) % storyFrames.length],
      `Find ${wordB.word} in the story picture.`,
      `Choose the ending that uses ${wordC.word}.`,
    ],
  });

  const song = {
    id: `song-${dayKey}-${wordC.id}`,
    kind: 'song' as const,
    title: 'Word Song Builder',
    subtitle: `${wordA.word}, ${wordB.word}, ${wordC.word}`,
    learningGoal: 'Practice pronunciation through rhythm and repetition.',
    previewLine: songFrames[seed % songFrames.length],
    icon: '🎵',
    color: '#FFD93D',
    accent: '#8174F2',
    route: `/practice/speaking?lesson=${lessonByMode('speaking').id}`,
    minutes: 3,
    rewardXp: 30,
    level: 'Play',
    mode: 'speaking' as KidPracticeMode,
    focusWords: [wordA, wordB, wordC],
    steps: [
      `Clap and say ${wordA.word}.`,
      `Echo ${wordB.word} slowly and clearly.`,
      `Make a happy sentence with ${wordC.word}.`,
    ],
    accessibilityLabel: `Word Song Builder. Practice ${wordA.word}, ${wordB.word}, and ${wordC.word}.`,
  };

  const conversation = {
    id: `roleplay-${dayKey}-${roleplay.id}`,
    kind: 'roleplay' as const,
    title: `${roleplay.title} Remix`,
    subtitle: roleplay.subtitle,
    learningGoal: roleplay.objective,
    previewLine: roleplay.turns[0]?.buddyLine ?? 'Buddy starts a friendly conversation.',
    icon: roleplay.icon,
    color: roleplay.color,
    accent: roleplay.accent,
    route: `/kids-roleplay?scenario=${roleplay.id}`,
    minutes: 3,
    rewardXp: roleplay.rewardXp,
    level: 'Speaking',
    mode: 'speaking' as KidPracticeMode,
    focusWords: roleplay.focusWords,
    steps: roleplay.turns.map((turn) => turn.prompt).slice(0, 3),
    accessibilityLabel: `${roleplay.title}. ${roleplay.subtitle}`,
  };

  const reviewGame = generatedFromLesson({
    id: `review-${dayKey}-${quest.nextStep.id}`,
    kind: 'review-game',
    title: 'Memory Arcade',
    subtitle: quest.nextStep.title,
    learningGoal: quest.nextStep.reason,
    previewLine: `Today’s recall path starts with ${quest.focusWords[0]?.word ?? wordA.word}.`,
    icon: '🧩',
    color: quest.nextStep.color,
    accent: quest.nextStep.accent,
    lesson: lessonByMode(quest.nextStep.mode ?? 'vocabulary'),
    minutes: quest.nextStep.minutes,
    rewardXp: quest.nextStep.rewardXp,
    level: quest.nextStep.label,
    focusWords: quest.focusWords.length ? quest.focusWords : [wordA, wordB, wordC],
    steps: [
      'Warm up with picture recall.',
      'Switch to sound or speaking.',
      'Save the result into Memory Boost.',
    ],
  });

  const teacherDrafts = [miniLesson, story, song].map((item, index) => ({
    ...item,
    id: `draft-${item.id}`,
    kind: 'teacher-draft' as const,
    title: `${item.title} Draft`,
    subtitle: `Teacher-ready pack ${index + 1}: ${item.subtitle}`,
    route: '/admin/words',
    rewardXp: 0,
    level: 'Draft',
    accessibilityLabel: `Teacher draft for ${item.title}.`,
  }));

  const generatedToday = [miniLesson, song, story, conversation];
  const adaptivePractice = [reviewGame, miniLesson, conversation];
  const studioDrafts = [story, song, ...teacherDrafts.slice(0, 1)];
  const hero = generatedToday[seed % generatedToday.length];

  return {
    id: `content-engine-${child.id}-${dayKey}`,
    dayKey,
    seed,
    title: 'Content Creation Engine',
    subtitle: 'Fresh lessons, stories, songs, roleplay, and review packs from learner state.',
    creatorLine: `Built ${generatedToday.length + adaptivePractice.length + teacherDrafts.length} usable packs from ${words.length} kid-safe words.`,
    hero,
    shelves: [
      {
        id: 'generated-today',
        title: 'Generated today',
        subtitle: 'Fresh content assembled from today’s focus words and progress.',
        items: generatedToday,
      },
      {
        id: 'adaptive-practice',
        title: 'Adaptive practice packs',
        subtitle: 'Recall, speaking, and lesson packs that use the same review engine.',
        items: adaptivePractice,
      },
      {
        id: 'studio-drafts',
        title: 'Teacher-ready drafts',
        subtitle: 'Draft packs adults can review, adapt, and publish.',
        items: studioDrafts,
      },
    ],
    adminDrafts: teacherDrafts,
    parentHighlights: [
      `${quest.focusWords.length || 3} focus words are connected to review.`,
      `${roleplay.title} is ready for speaking practice.`,
      `${courses.length} course worlds can receive generated packs.`,
    ],
    coverage: [
      { label: 'Words', value: `${words.length}`, color: '#8174F2' },
      { label: 'Packs', value: `${generatedToday.length + adaptivePractice.length}`, color: '#51D9A8' },
      { label: 'Drafts', value: `${teacherDrafts.length}`, color: '#FFD93D' },
    ],
  };
}

function generatedFromLesson(input: {
  id: string;
  kind: Exclude<KidGeneratedContentKind, 'song' | 'roleplay' | 'teacher-draft'>;
  title: string;
  subtitle: string;
  learningGoal: string;
  previewLine: string;
  icon: string;
  color: string;
  accent: string;
  lesson: ReturnType<typeof getKidLessons>[number];
  minutes: number;
  rewardXp: number;
  level: string;
  focusWords: KidDictionaryEntry[];
  steps: string[];
}): KidGeneratedContentItem {
  return {
    ...input,
    route: `/practice/${input.lesson.type}?lesson=${input.lesson.id}`,
    mode: input.lesson.type,
    accessibilityLabel: `${input.title}. ${input.subtitle}`,
  };
}

function createLessonPicker(lessons: ReturnType<typeof getKidLessons>) {
  return (mode: KidPracticeMode) => {
    return lessons.find((lesson) => lesson.type === mode) ?? lessons.find((lesson) => lesson.type === 'vocabulary') ?? lessons[0];
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

function hashSeed(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
