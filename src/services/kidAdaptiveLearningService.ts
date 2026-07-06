import type { KidPracticeActivity, KidPracticeMode } from '../data/kidContent';
import {
  buildKidDictionaryActivity,
  getFeaturedKidWords,
  getKidDictionaryEntries,
  type KidDictionaryEntry,
} from './kidDictionaryService';
import type { KidRuntimeState } from './kidLearningService';

export type KidWordMasteryStatus = 'new' | 'learning' | 'review' | 'strong' | 'mastered';

export type KidWordMastery = {
  entryId: string;
  attempts: number;
  correct: number;
  mistakes: number;
  streak: number;
  mastery: number;
  intervalDays: number;
  dueAt: number;
  lastSeenAt?: number;
  status: KidWordMasteryStatus;
  modeScores: Partial<Record<KidPracticeMode, number>>;
};

export type KidReviewResult = {
  entryId: string;
  correct: boolean;
  mode: KidPracticeMode;
};

export type KidAdaptiveReviewItem = {
  entry: KidDictionaryEntry;
  mastery: KidWordMastery;
  priority: number;
  reason: string;
  dueLabel: string;
  recommendedMode: KidPracticeMode;
};

export type KidAdaptiveReviewSummary = {
  dueCount: number;
  newCount: number;
  strongCount: number;
  masteredCount: number;
  totalTracked: number;
  nextReviewLabel: string;
  focusTitle: string;
  focusBody: string;
  recommendedMode: KidPracticeMode;
  progress: {
    fresh: number;
    recall: number;
    strong: number;
  };
};

const DAY_MS = 86_400_000;

export function createKidWordMastery(entryId: string, now = Date.now()): KidWordMastery {
  return {
    entryId,
    attempts: 0,
    correct: 0,
    mistakes: 0,
    streak: 0,
    mastery: 0,
    intervalDays: 0,
    dueAt: now,
    status: 'new',
    modeScores: {},
  };
}

export function applyKidReviewResults(
  kid: KidRuntimeState,
  results: KidReviewResult[] | undefined,
  lessonId: string,
  now = Date.now()
): KidRuntimeState {
  const lessonEntries = getKidDictionaryEntries().filter((entry) => entry.lessonIds.includes(lessonId));
  const resultByEntry = new Map((results ?? []).map((result) => [result.entryId, result]));
  const entryIds = new Set([...lessonEntries.map((entry) => entry.id), ...(results ?? []).map((result) => result.entryId)]);
  if (!entryIds.size) return kid;

  const wordMastery = { ...(kid.wordMastery ?? {}) };
  for (const entryId of entryIds) {
    const previous = wordMastery[entryId] ?? createKidWordMastery(entryId, now);
    const result = resultByEntry.get(entryId);
    wordMastery[entryId] = result ? updateKidWordMastery(previous, result, now) : introduceKidWord(previous, now);
  }

  return { ...kid, wordMastery };
}

export function getKidAdaptiveReviewQueue(kid: KidRuntimeState, limit = 8, now = Date.now()): KidAdaptiveReviewItem[] {
  const tracked = kid.wordMastery ?? {};
  const dictionary = getKidDictionaryEntries();
  const featured = getFeaturedKidWords(kid, dictionary.length);
  const candidates = uniqueEntries([...dictionary.filter((entry) => tracked[entry.id]), ...featured, ...dictionary]);

  return candidates
    .map((entry) => {
      const mastery = tracked[entry.id] ?? createKidWordMastery(entry.id, now);
      return buildReviewItem(entry, mastery, now);
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

export function getKidAdaptiveReviewSummary(kid: KidRuntimeState, now = Date.now()): KidAdaptiveReviewSummary {
  const tracked = Object.values(kid.wordMastery ?? {});
  const queue = getKidAdaptiveReviewQueue(kid, 6, now);
  const dueCount = queue.filter((item) => item.mastery.dueAt <= now || item.mastery.status === 'new').length;
  const newCount = queue.filter((item) => item.mastery.status === 'new').length;
  const strongCount = tracked.filter((item) => item.status === 'strong').length;
  const masteredCount = tracked.filter((item) => item.status === 'mastered').length;
  const first = queue[0];
  const recommendedMode = first?.recommendedMode ?? 'vocabulary';
  const nextReviewLabel = first ? first.dueLabel : 'Start with new words';
  const focusTitle = first ? `${capitalize(first.entry.word)} is ready` : 'Memory Boost';
  const focusBody = first
    ? first.reason
    : 'Start a short picture, audio, and speaking review so new words can enter memory.';
  const totalTracked = Math.max(1, tracked.length);
  const fresh = tracked.filter((item) => item.status === 'new' || item.status === 'learning').length / totalTracked;
  const recall = tracked.filter((item) => item.status === 'review').length / totalTracked;
  const strong = tracked.filter((item) => item.status === 'strong' || item.status === 'mastered').length / totalTracked;

  return {
    dueCount,
    newCount,
    strongCount,
    masteredCount,
    totalTracked: tracked.length,
    nextReviewLabel,
    focusTitle,
    focusBody,
    recommendedMode,
    progress: { fresh, recall, strong },
  };
}

export function buildKidAdaptivePracticeActivities(kid: KidRuntimeState, preferredMode: KidPracticeMode, limit = 7): KidPracticeActivity[] {
  return getKidAdaptiveReviewQueue(kid, limit).map((item, index) => {
    const mode = index % 2 === 0 ? item.recommendedMode : preferredMode;
    return buildKidDictionaryActivity(item.entry, mode);
  });
}

function updateKidWordMastery(previous: KidWordMastery, result: KidReviewResult, now: number): KidWordMastery {
  const attempts = previous.attempts + 1;
  const correct = previous.correct + (result.correct ? 1 : 0);
  const mistakes = previous.mistakes + (result.correct ? 0 : 1);
  const streak = result.correct ? previous.streak + 1 : 0;
  const currentModeScore = previous.modeScores[result.mode] ?? 0;
  const modeScores = {
    ...previous.modeScores,
    [result.mode]: Math.max(0, Math.min(1, currentModeScore + (result.correct ? 0.22 : -0.12))),
  };
  const accuracy = correct / attempts;
  const mastery = Math.max(0, Math.min(1, previous.mastery + (result.correct ? 0.18 : -0.16) + (accuracy - 0.65) * 0.08));
  const intervalDays = nextIntervalDays(previous.intervalDays, mastery, streak, result.correct);
  const status = getStatus(mastery, attempts, mistakes);

  return {
    ...previous,
    attempts,
    correct,
    mistakes,
    streak,
    mastery,
    intervalDays,
    dueAt: now + intervalDays * DAY_MS,
    lastSeenAt: now,
    status,
    modeScores,
  };
}

function introduceKidWord(previous: KidWordMastery, now: number): KidWordMastery {
  if (previous.attempts > 0) return previous;
  return {
    ...previous,
    status: 'learning',
    dueAt: now + Math.round(DAY_MS * 0.35),
    lastSeenAt: now,
    intervalDays: 0.35,
  };
}

function buildReviewItem(entry: KidDictionaryEntry, mastery: KidWordMastery, now: number): KidAdaptiveReviewItem {
  const due = mastery.dueAt <= now || mastery.status === 'new';
  const overdueDays = Math.max(0, Math.floor((now - mastery.dueAt) / DAY_MS));
  const weakness = 1 - mastery.mastery;
  const mistakeBoost = Math.min(0.35, mastery.mistakes * 0.08);
  const newBoost = mastery.status === 'new' ? 0.65 : 0;
  const dueBoost = due ? 0.45 + Math.min(0.35, overdueDays * 0.07) : 0;
  const priority = weakness + mistakeBoost + newBoost + dueBoost;

  return {
    entry,
    mastery,
    priority,
    reason: getReviewReason(entry, mastery, due),
    dueLabel: getDueLabel(mastery, now),
    recommendedMode: getRecommendedMode(entry, mastery),
  };
}

function getReviewReason(entry: KidDictionaryEntry, mastery: KidWordMastery, due: boolean) {
  if (mastery.status === 'new') return `${capitalize(entry.word)} is new. Start with picture and sound.`;
  if (mastery.mistakes > 0 && mastery.streak === 0) return `A recent miss makes ${entry.word} perfect for a gentle retry.`;
  if (due) return `${capitalize(entry.word)} is due before it fades from memory.`;
  if (mastery.mastery >= 0.78) return `${capitalize(entry.word)} is getting strong. Keep it alive with a quick recall.`;
  return `${capitalize(entry.word)} needs one more small practice to grow.`;
}

function getRecommendedMode(entry: KidDictionaryEntry, mastery: KidWordMastery): KidPracticeMode {
  const modeOrder: KidPracticeMode[] = ['vocabulary', 'listening', 'speaking', 'reading', 'grammar'];
  if (entry.skills.includes('speaking') && (mastery.modeScores.speaking ?? 0) < 0.45) return 'speaking';
  if (entry.skills.includes('listening') && (mastery.modeScores.listening ?? 0) < 0.45) return 'listening';
  if (entry.skills.includes('reading') && (mastery.modeScores.reading ?? 0) < 0.45) return 'reading';
  if (entry.skills.includes('grammar') && (mastery.modeScores.grammar ?? 0) < 0.45) return 'grammar';
  return modeOrder.find((mode) => (mastery.modeScores[mode] ?? 0) < 0.5) ?? 'vocabulary';
}

function getDueLabel(mastery: KidWordMastery, now: number) {
  if (mastery.status === 'new') return 'New';
  const delta = mastery.dueAt - now;
  if (delta <= 0) return 'Due now';
  if (delta < DAY_MS) return 'Later today';
  const days = Math.ceil(delta / DAY_MS);
  return days === 1 ? 'Tomorrow' : `${days} days`;
}

function nextIntervalDays(previous: number, mastery: number, streak: number, correct: boolean) {
  if (!correct) return 0.25;
  if (streak <= 1) return 1;
  if (streak === 2) return 2;
  return Math.min(21, Math.max(previous + 1, Math.round((1 + mastery * 4) * streak)));
}

function getStatus(mastery: number, attempts: number, mistakes: number): KidWordMasteryStatus {
  if (mastery >= 0.92 && attempts >= 6) return 'mastered';
  if (mastery >= 0.72 && attempts >= 4) return 'strong';
  if (attempts >= 2 || mistakes > 0) return 'review';
  return 'learning';
}

function uniqueEntries(entries: KidDictionaryEntry[]) {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
