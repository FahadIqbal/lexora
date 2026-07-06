import { z } from 'zod';
import rawKidDictionary from '../data/kids-dictionary.json';
import type { KidRuntimeState } from './kidLearningService';
import { getActiveKidProfile, getKidLessons } from './kidLearningService';

const KidDictionaryEntrySchema = z.object({
  id: z.string(),
  word: z.string(),
  phonetic: z.string(),
  syllables: z.array(z.string()),
  partOfSpeech: z.string(),
  category: z.string(),
  level: z.number().int().min(1).max(5),
  ageBand: z.string(),
  emoji: z.string(),
  color: z.string(),
  kidDefinition: z.string(),
  parentDefinition: z.string(),
  examples: z.array(z.string()),
  audioText: z.string(),
  wordFamily: z.array(z.string()).default([]),
  synonyms: z.array(z.string()).default([]),
  opposites: z.array(z.string()).default([]),
  rhymes: z.array(z.string()).default([]),
  funFact: z.string(),
  activity: z.string(),
  lessonIds: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
});

export type KidDictionaryEntry = z.infer<typeof KidDictionaryEntrySchema>;

const KidDictionarySchema = z.array(KidDictionaryEntrySchema);
const kidDictionary = KidDictionarySchema.parse(rawKidDictionary) as KidDictionaryEntry[];

export function getKidDictionaryEntries() {
  return kidDictionary;
}

export function getKidDictionaryCategories() {
  const grouped = new Map<string, { id: string; label: string; icon: string; color: string; count: number }>();
  for (const entry of kidDictionary) {
    const existing = grouped.get(entry.category);
    if (existing) {
      existing.count += 1;
      continue;
    }
    grouped.set(entry.category, {
      id: entry.category,
      label: formatKidDictionaryCategory(entry.category),
      icon: entry.emoji,
      color: entry.color,
      count: 1,
    });
  }
  return Array.from(grouped.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export function getKidDictionaryById(id?: string | null) {
  if (!id) return null;
  return kidDictionary.find((entry) => entry.id === id) ?? null;
}

export function searchKidDictionary(query: string, opts?: { category?: string | null; skill?: string | null; maxLevel?: number | null }) {
  const q = query.trim().toLowerCase();
  const category = opts?.category ?? null;
  const skill = opts?.skill ?? null;
  const maxLevel = opts?.maxLevel ?? null;

  return kidDictionary.filter((entry) => {
    const matchesQuery =
      !q ||
      entry.word.toLowerCase().includes(q) ||
      entry.kidDefinition.toLowerCase().includes(q) ||
      entry.examples.some((example) => example.toLowerCase().includes(q)) ||
      entry.skills.some((item) => item.toLowerCase().includes(q));
    const matchesCategory = !category || entry.category === category;
    const matchesSkill = !skill || entry.skills.includes(skill);
    const matchesLevel = !maxLevel || entry.level <= maxLevel;
    return matchesQuery && matchesCategory && matchesSkill && matchesLevel;
  });
}

export function getFeaturedKidWords(kid: KidRuntimeState, limit = 6) {
  const child = getActiveKidProfile(kid);
  const lessons = getKidLessons(kid);
  const unlockedLessonIds = new Set<string>(lessons.filter((lesson) => !lesson.locked).map((lesson) => lesson.id));
  const inPath = kidDictionary.filter((entry) => entry.lessonIds.some((lessonId) => unlockedLessonIds.has(lessonId)));
  const maxLevel = child.age <= 6 ? 1 : child.age <= 8 ? 2 : 3;
  const ageReady = kidDictionary.filter((entry) => entry.level <= maxLevel);
  const pool = [...inPath, ...ageReady, ...kidDictionary];
  const seen = new Set<string>();
  const unique = pool.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
  return unique.slice(0, limit);
}

export function getDailyKidDictionarySet(kid: KidRuntimeState, limit = 4) {
  const featured = getFeaturedKidWords(kid, kidDictionary.length);
  const day = Math.floor(Date.now() / 86_400_000);
  const start = featured.length ? day % featured.length : 0;
  const out: KidDictionaryEntry[] = [];
  for (let i = 0; i < Math.min(limit, featured.length); i++) {
    out.push(featured[(start + i) % featured.length]);
  }
  return out;
}

export function getDictionaryEntriesForLesson(lessonId: string) {
  return kidDictionary.filter((entry) => entry.lessonIds.includes(lessonId));
}

export function formatKidDictionaryCategory(category: string) {
  if (category === 'daily-conversation') return 'Daily Talk';
  return category
    .split('-')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function buildKidDictionaryActivity(entry: KidDictionaryEntry, mode: 'vocabulary' | 'listening' | 'speaking' | 'reading' | 'grammar' | 'story') {
  const distractors = kidDictionary
    .filter((item) => item.id !== entry.id && (item.category === entry.category || item.level === entry.level))
    .slice(0, 3)
    .map((item) => capitalize(item.word));
  const options = [capitalize(entry.word), ...distractors].slice(0, 4);

  if (mode === 'listening') {
    return {
      id: `dict-listen-${entry.id}`,
      mode,
      kind: 'choice' as const,
      prompt: 'Listen and choose the word.',
      visual: '🎧',
      audioText: entry.audioText,
      options,
      answer: capitalize(entry.word),
      hint: entry.kidDefinition,
      explanation: `${capitalize(entry.word)} means: ${entry.kidDefinition}`,
    };
  }

  if (mode === 'speaking') {
    return {
      id: `dict-speak-${entry.id}`,
      mode,
      kind: 'speak' as const,
      prompt: `Say the word: ${entry.word}`,
      visual: entry.emoji,
      audioText: entry.audioText,
      options: [`I said ${entry.word}`, 'I need to try again'],
      answer: `I said ${entry.word}`,
      hint: `Try the sounds: ${entry.syllables.join('-')}.`,
      explanation: `Great speaking practice. ${capitalize(entry.word)} is pronounced ${entry.phonetic}.`,
    };
  }

  if (mode === 'reading' || mode === 'story') {
    const sentence = entry.examples[0] ?? `I know the word ${entry.word}.`;
    return {
      id: `dict-read-${entry.id}`,
      mode,
      kind: 'read' as const,
      prompt: 'Read the sentence. Which word is shown?',
      visual: entry.emoji,
      audioText: sentence,
      options,
      answer: capitalize(entry.word),
      hint: `Look for ${entry.word} in the sentence.`,
      explanation: `The sentence uses ${entry.word}: ${sentence}`,
      passage: sentence,
    };
  }

  if (mode === 'grammar') {
    const sentence = entry.examples[0] ?? `I like ${entry.word}.`;
    return {
      id: `dict-grammar-${entry.id}`,
      mode,
      kind: 'build' as const,
      prompt: 'Choose the sentence that sounds right.',
      visual: entry.emoji,
      audioText: sentence,
      options: [sentence, sentence.replace(/\bis\b/i, 'are'), sentence.replace(/\bI\b/i, 'Me'), `${capitalize(entry.word)} the I.`].slice(0, 4),
      answer: sentence,
      hint: 'Read the whole sentence slowly.',
      explanation: `This sentence is natural English: ${sentence}`,
    };
  }

  return {
    id: `dict-vocab-${entry.id}`,
    mode,
    kind: 'choice' as const,
    prompt: 'Which word matches this picture?',
    visual: entry.emoji,
    audioText: entry.audioText,
    options,
    answer: capitalize(entry.word),
    hint: entry.kidDefinition,
    explanation: `${capitalize(entry.word)} means: ${entry.kidDefinition}`,
  };
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
