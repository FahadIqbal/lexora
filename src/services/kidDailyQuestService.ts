import type { KidPracticeMode } from '../data/kidContent';
import { getKidAdaptiveReviewQueue, getKidAdaptiveReviewSummary } from './kidAdaptiveLearningService';
import { getDailyKidDictionarySet, type KidDictionaryEntry } from './kidDictionaryService';
import {
  getActiveKidProfile,
  getContinueLesson,
  getKidDailyPath,
  getKidFriends,
  getKidMissions,
  getLessonRuntime,
  getTotalStars,
  type KidRuntimeState,
} from './kidLearningService';
import { getKidRoleplayScenarios } from './kidRoleplayService';

export type KidDailyQuestStepState = 'complete' | 'active' | 'ready';
export type KidDailyQuestStepKind = 'review' | 'lesson' | 'roleplay' | 'story' | 'friend';

export type KidDailyQuestStep = {
  id: string;
  kind: KidDailyQuestStepKind;
  label: string;
  title: string;
  subtitle: string;
  reason: string;
  icon: string;
  color: string;
  accent: string;
  route: string;
  progress: number;
  rewardXp: number;
  minutes: number;
  state: KidDailyQuestStepState;
  mode?: KidPracticeMode;
};

export type KidDailyQuest = {
  id: string;
  title: string;
  subtitle: string;
  companionLine: string;
  themeIcon: string;
  color: string;
  accent: string;
  rewardXp: number;
  estimatedMinutes: number;
  completion: number;
  streakLabel: string;
  nextStep: KidDailyQuestStep;
  playStep: KidDailyQuestStep;
  focusWords: KidDictionaryEntry[];
  steps: KidDailyQuestStep[];
  parentSummary: string;
};

const questThemes = [
  {
    id: 'sky-library',
    title: 'Sky Library Quest',
    subtitle: 'Review, talk, and unlock a tiny story world.',
    icon: '🛸',
    color: '#8174F2',
    accent: '#FFD93D',
  },
  {
    id: 'rainbow-market',
    title: 'Rainbow Market Quest',
    subtitle: 'Use useful words in playful real-life moments.',
    icon: '🧃',
    color: '#FF7A7A',
    accent: '#51D9A8',
  },
  {
    id: 'sound-garden',
    title: 'Sound Garden Quest',
    subtitle: 'Listen, speak, and grow stronger sentences.',
    icon: '🌱',
    color: '#55B7FF',
    accent: '#8174F2',
  },
  {
    id: 'story-rocket',
    title: 'Story Rocket Quest',
    subtitle: 'Build memory first, then launch into reading.',
    icon: '🏝️',
    color: '#51D9A8',
    accent: '#FFD93D',
  },
] as const;

export function getKidDailyQuest(kid: KidRuntimeState, now = Date.now()): KidDailyQuest {
  const child = getActiveKidProfile(kid);
  const theme = questThemes[Math.floor(now / 86_400_000) % questThemes.length];
  const reviewSummary = getKidAdaptiveReviewSummary(kid, now);
  const reviewQueue = getKidAdaptiveReviewQueue(kid, 6, now);
  const dailyWords = getDailyKidDictionarySet(kid, 5);
  const focusWords = uniqueEntries([...reviewQueue.map((item) => item.entry), ...dailyWords]).slice(0, 5);
  const continueLesson = getContinueLesson(kid);
  const dailyPath = getKidDailyPath(kid);
  const roleplay = getKidRoleplayScenarios(kid)[0];
  const roleplayRuntime = getLessonRuntime(kid, `roleplay-${roleplay.id}`);
  const storyStep = dailyPath.find((step) => step.id === 'side-quest') ?? dailyPath[2] ?? dailyPath[0];
  const mission = getKidMissions(kid).find((item) => !item.completed) ?? getKidMissions(kid)[0];
  const friend = getKidFriends(kid).find((item) => !item.challenged) ?? getKidFriends(kid)[0];
  const reviewWord = focusWords[0];

  const rawSteps: Omit<KidDailyQuestStep, 'state'>[] = [
    {
      id: 'memory-boost',
      kind: 'review',
      label: 'Recall',
      title: reviewSummary.dueCount > 0 ? `${reviewSummary.dueCount} words due` : 'Memory Boost',
      subtitle: reviewWord ? `Remember ${reviewWord.word} with picture, sound, and voice.` : reviewSummary.focusTitle,
      reason: reviewSummary.focusBody,
      icon: reviewWord?.emoji ?? '🔁',
      color: reviewWord?.color ?? '#55B7FF',
      accent: '#FFD93D',
      route: `/practice/${reviewSummary.recommendedMode}?lesson=adaptive-review`,
      progress: Math.max(reviewSummary.progress.recall, reviewSummary.progress.fresh * 0.45, reviewSummary.dueCount > 0 ? 0.18 : 0.08),
      rewardXp: 25,
      minutes: 2,
      mode: reviewSummary.recommendedMode,
    },
    {
      id: 'next-lesson',
      kind: 'lesson',
      label: 'Learn',
      title: continueLesson.title,
      subtitle: continueLesson.subtitle,
      reason: 'This is the shortest path to the next visible skill win.',
      icon: continueLesson.icon,
      color: continueLesson.color,
      accent: '#51D9A8',
      route: `/lessons/${continueLesson.id}`,
      progress: continueLesson.progress,
      rewardXp: continueLesson.xp,
      minutes: 4,
      mode: continueLesson.type,
    },
    {
      id: 'buddy-roleplay',
      kind: 'roleplay',
      label: 'Talk',
      title: roleplay.title,
      subtitle: roleplay.subtitle,
      reason: roleplay.objective,
      icon: roleplay.icon,
      color: roleplay.color,
      accent: roleplay.accent,
      route: `/kids-roleplay?scenario=${roleplay.id}`,
      progress: roleplayRuntime.progress,
      rewardXp: roleplay.rewardXp,
      minutes: 3,
      mode: 'speaking',
    },
    {
      id: 'story-play',
      kind: 'story',
      label: storyStep.mode === 'speaking' ? 'Speak' : 'Story',
      title: storyStep.title,
      subtitle: storyStep.subtitle,
      reason: 'A playful transfer step helps kids use words outside the first lesson.',
      icon: storyStep.icon,
      color: storyStep.color,
      accent: '#FFD93D',
      route: `/practice/${storyStep.mode}?lesson=${storyStep.lessonId}`,
      progress: storyStep.progress,
      rewardXp: 30,
      minutes: 4,
      mode: storyStep.mode,
    },
  ];

  const steps = markQuestStepStates(rawSteps);
  const nextStep = steps.find((step) => step.state !== 'complete') ?? steps[steps.length - 1];
  const playStep = steps.find((step) => step.kind === 'roleplay') ?? steps.find((step) => step.kind === 'story') ?? nextStep;
  const completion = average(steps.map((step) => step.progress));
  const rewardXp = steps.reduce((sum, step) => sum + step.rewardXp, 0) + (mission?.completed ? 0 : 15);
  const totalStars = getTotalStars(kid);
  const streakLabel = `${child.streak} day streak`;
  const friendLine = friend ? `${friend.name} is waiting for a friendly challenge.` : 'A friend challenge is ready.';

  return {
    id: theme.id,
    title: theme.title,
    subtitle: theme.subtitle,
    companionLine:
      reviewSummary.dueCount > 0
        ? `Buddy found ${reviewSummary.dueCount} word${reviewSummary.dueCount === 1 ? '' : 's'} to save before they fade.`
        : `${child.name}, Buddy packed a quick quest with ${focusWords.length} focus words.`,
    themeIcon: theme.icon,
    color: theme.color,
    accent: theme.accent,
    rewardXp,
    estimatedMinutes: steps.reduce((sum, step) => sum + step.minutes, 0),
    completion,
    streakLabel,
    nextStep,
    playStep,
    focusWords,
    steps,
    parentSummary: `${Math.round(completion * 100)}% daily quest progress, ${totalStars} stars earned, ${friendLine}`,
  };
}

function markQuestStepStates(steps: Omit<KidDailyQuestStep, 'state'>[]): KidDailyQuestStep[] {
  let activeAssigned = false;
  return steps.map((step) => {
    const complete = step.progress >= 0.98;
    if (complete) return { ...step, progress: 1, state: 'complete' };
    if (!activeAssigned) {
      activeAssigned = true;
      return { ...step, progress: clamp(step.progress), state: 'active' };
    }
    return { ...step, progress: clamp(step.progress), state: 'ready' };
  });
}

function uniqueEntries(entries: KidDictionaryEntry[]) {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + clamp(value), 0) / values.length;
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}
