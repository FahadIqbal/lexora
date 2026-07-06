import * as Speech from 'expo-speech';
import type { Word } from '../domain/schema';
import { hapticSelection } from '../utils/haptics';

export type DictionaryLearningMaterial = {
  pronunciationText: string;
  pronunciationSource: 'recorded-audio' | 'device-tts';
  syllableHint: string;
  learnerLevel: string;
  focusSkill: string;
  quickQuiz: {
    prompt: string;
    answer: string;
    distractors: string[];
  };
  practiceSteps: string[];
};

export function pronounceDictionaryWord(word: Pick<Word, 'word' | 'audio_url'>, text?: string) {
  hapticSelection();
  Speech.stop();
  Speech.speak(text ?? word.word, {
    rate: 0.9,
    pitch: 1,
    language: 'en-US',
  });
}

export function buildDictionaryLearningMaterial(word: Word): DictionaryLearningMaterial {
  const syllableHint = makeSyllableHint(word.word);
  const learnerLevel =
    word.difficulty_level <= 2 ? 'Foundation' : word.difficulty_level <= 4 ? 'Growing vocabulary' : 'Advanced mastery';
  const focusSkill =
    word.part_of_speech === 'verb'
      ? 'Use it in action sentences'
      : word.part_of_speech === 'adjective'
      ? 'Use it to describe people, places, and feelings'
      : word.part_of_speech === 'noun'
      ? 'Connect it to a picture, object, or idea'
      : 'Listen, repeat, and use it in a short sentence';

  const distractors = [
    word.antonyms[0],
    word.synonyms.find((item) => item.toLowerCase() !== word.word.toLowerCase()),
    word.categories[0]?.replace(/-/g, ' '),
  ]
    .filter((item): item is string => Boolean(item))
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .slice(0, 3);

  return {
    pronunciationText: word.phonetic || `Say ${word.word} slowly, then naturally.`,
    pronunciationSource: word.audio_url ? 'recorded-audio' : 'device-tts',
    syllableHint,
    learnerLevel,
    focusSkill,
    quickQuiz: {
      prompt: `Which meaning best matches “${word.word}”?`,
      answer: word.short_definition || word.definition,
      distractors,
    },
    practiceSteps: [
      `Listen to “${word.word}” two times.`,
      `Say “${word.word}” slowly: ${syllableHint}.`,
      `Use it in one sentence about your day.`,
      `Review it again tomorrow so it moves into long-term memory.`,
    ],
  };
}

function makeSyllableHint(word: string) {
  const cleaned = word.trim();
  if (!cleaned) return '';
  const vowelGroups = cleaned.match(/[aeiouy]+/gi)?.length ?? 1;
  if (vowelGroups <= 1) return cleaned;
  const parts: string[] = [];
  const targetLength = Math.ceil(cleaned.length / vowelGroups);
  for (let i = 0; i < cleaned.length; i += targetLength) {
    parts.push(cleaned.slice(i, i + targetLength));
  }
  return parts.join(' · ');
}
