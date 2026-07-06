import rawAlphabet from '../data/kids-alphabet.json';
import { getKidDictionaryEntries, type KidDictionaryEntry } from './kidDictionaryService';
import { getActiveKidProfile, type KidRuntimeState } from './kidLearningService';

type AlphabetSeed = {
  letter: string;
  word: string;
  emoji: string;
  sound: string;
  phonics: string;
  color: string;
  accent: string;
  definition: string;
  paintingPrompt: string;
  strokes: string[];
};

export type KidAlphabetWord = {
  id: string;
  word: string;
  emoji: string;
  definition: string;
  audioText: string;
  color: string;
  dictionaryEntry?: KidDictionaryEntry;
};

export type KidAlphabetLetter = {
  id: string;
  letter: string;
  lower: string;
  sound: string;
  phonics: string;
  color: string;
  accent: string;
  heroWord: KidAlphabetWord;
  words: KidAlphabetWord[];
  paintingPrompt: string;
  traceSteps: string[];
  guide: string;
  rewardXp: number;
  mastery: number;
  mission: Array<{ id: string; title: string; icon: string; body: string }>;
};

export type KidAlphabetStudio = {
  title: string;
  subtitle: string;
  dailyLetter: KidAlphabetLetter;
  letters: KidAlphabetLetter[];
  palette: Array<{ id: string; label: string; color: string }>;
  tools: Array<{ id: 'brush' | 'marker' | 'glow'; label: string; width: number }>;
};

const alphabetSeeds = rawAlphabet as AlphabetSeed[];

const palette = [
  { id: 'purple', label: 'Grape', color: '#8174F2' },
  { id: 'sky', label: 'Sky', color: '#55B7FF' },
  { id: 'sun', label: 'Sun', color: '#FFD93D' },
  { id: 'coral', label: 'Coral', color: '#FF7A7A' },
  { id: 'mint', label: 'Mint', color: '#51D9A8' },
  { id: 'ink', label: 'Ink', color: '#22234A' },
] as const;

const tools = [
  { id: 'brush', label: 'Brush', width: 8 },
  { id: 'marker', label: 'Marker', width: 13 },
  { id: 'glow', label: 'Glow', width: 20 },
] as const;

export function getKidAlphabetStudio(kid: KidRuntimeState, now = Date.now()): KidAlphabetStudio {
  const child = getActiveKidProfile(kid);
  const dictionary = getKidDictionaryEntries();
  const letters = alphabetSeeds.map((seed, index) => createAlphabetLetter(seed, dictionary, index, child.age, kid));
  const dayIndex = Math.floor(now / 86_400_000);
  const dailyLetter = letters[dayIndex % letters.length] ?? letters[0];

  return {
    title: 'Alphabet Art Studio',
    subtitle: 'Trace, paint, hear, and play through A to Z with real word examples.',
    dailyLetter,
    letters,
    palette: [...palette],
    tools: [...tools],
  };
}

function createAlphabetLetter(seed: AlphabetSeed, dictionary: KidDictionaryEntry[], index: number, childAge: number, kid: KidRuntimeState): KidAlphabetLetter {
  const letter = seed.letter.toUpperCase();
  const letterId = letter.toLowerCase();
  const saved = kid.alphabetProgress?.[letterId];
  const dictionaryMatches = dictionary
    .filter((entry) => entry.word.slice(0, 1).toUpperCase() === letter)
    .sort((a, b) => a.level - b.level || a.word.localeCompare(b.word));
  const fallbackWord = createFallbackWord(seed);
  const words = uniqueWords([
    ...dictionaryMatches.slice(0, childAge <= 6 ? 2 : 3).map(dictionaryToAlphabetWord),
    fallbackWord,
  ]).slice(0, 3);
  const heroWord = words[0] ?? fallbackWord;
  const baseMastery = Math.min(0.92, 0.12 + ((index % 5) + (childAge % 4)) * 0.11);
  const mastery = saved?.completedAt ? 1 : Math.max(saved?.progress ?? 0, baseMastery);

  return {
    id: letterId,
    letter,
    lower: letter.toLowerCase(),
    sound: seed.sound,
    phonics: seed.phonics,
    color: seed.color,
    accent: seed.accent,
    heroWord,
    words,
    paintingPrompt: seed.paintingPrompt,
    traceSteps: seed.strokes,
    guide: buildGuide(seed, words),
    rewardXp: 20 + (index % 3) * 5,
    mastery,
    mission: [
      { id: 'trace', title: 'Trace', icon: '✏️', body: seed.strokes[0] ?? `Trace ${letter}.` },
      { id: 'paint', title: 'Paint', icon: '🎨', body: seed.paintingPrompt },
      { id: 'say', title: 'Say', icon: '🔊', body: `Say ${letter}, ${seed.sound}, ${heroWord.word}.` },
    ],
  };
}

function dictionaryToAlphabetWord(entry: KidDictionaryEntry): KidAlphabetWord {
  return {
    id: entry.id,
    word: entry.word,
    emoji: entry.emoji,
    definition: entry.kidDefinition,
    audioText: entry.audioText,
    color: entry.color,
    dictionaryEntry: entry,
  };
}

function createFallbackWord(seed: AlphabetSeed): KidAlphabetWord {
  return {
    id: `alphabet-${seed.letter.toLowerCase()}-${seed.word.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    word: seed.word,
    emoji: seed.emoji,
    definition: seed.definition,
    audioText: `${seed.word}. ${seed.definition}`,
    color: seed.color,
  };
}

function uniqueWords(words: KidAlphabetWord[]) {
  const seen = new Set<string>();
  return words.filter((word) => {
    const key = word.word.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildGuide(seed: AlphabetSeed, words: KidAlphabetWord[]) {
  const examples = words.map((item) => item.word).join(', ');
  return `${seed.letter} says ${seed.sound}. Try ${examples}.`;
}
