import type { KidPracticeActivity, KidPracticeMode } from '../data/kidContent';
import { getKidDictionaryEntries, type KidDictionaryEntry } from './kidDictionaryService';

export type KidPracticeModeTheme = {
  mode: KidPracticeMode;
  title: string;
  shortTitle: string;
  icon: string;
  color: string;
  accent: string;
  soft: string;
  coachTitle: string;
  coachIdle: string;
  completionTitle: string;
  completionBody: string;
  skillChips: string[];
};

export type KidPracticeStageSupport = {
  title: string;
  body: string;
  actionLabel: string;
  focus: string;
};

export type KidPracticeRewardStep = {
  id: string;
  label: string;
  icon: string;
};

export type KidPracticeInsight = {
  entry: KidDictionaryEntry;
  title: string;
  body: string;
  chips: string[];
};

export type KidPracticeCompletionPlan = {
  accuracy: number;
  reviewWindow: string;
  masteryLabel: string;
  celebration: string;
  nextFocus: string;
  stats: { icon: string; value: string; label: string; color: string }[];
};

const modeThemes: Record<KidPracticeMode, KidPracticeModeTheme> = {
  vocabulary: {
    mode: 'vocabulary',
    title: 'Word Quest',
    shortTitle: 'Words',
    icon: '🧩',
    color: '#8174F2',
    accent: '#FFD93D',
    soft: '#F4F0FF',
    coachTitle: 'Picture power',
    coachIdle: 'Look at the picture first, then choose the English word.',
    completionTitle: 'Word world unlocked',
    completionBody: 'New picture words now join warm-up review.',
    skillChips: ['See', 'Choose', 'Remember'],
  },
  listening: {
    mode: 'listening',
    title: 'Sound Lab',
    shortTitle: 'Listen',
    icon: '🎧',
    color: '#55B7FF',
    accent: '#FFD93D',
    soft: '#EAF7FF',
    coachTitle: 'Careful ears',
    coachIdle: 'Play the audio, repeat it softly, then tap what you heard.',
    completionTitle: 'Sound badge charged',
    completionBody: 'These sounds will return before they fade.',
    skillChips: ['Hear', 'Repeat', 'Tap'],
  },
  speaking: {
    mode: 'speaking',
    title: 'Speak Studio',
    shortTitle: 'Speak',
    icon: '🎤',
    color: '#FF7A7A',
    accent: '#51D9A8',
    soft: '#FFF0F2',
    coachTitle: 'Brave voice',
    coachIdle: 'Listen once, say it slowly, and self-check with honesty.',
    completionTitle: 'Voice streak boosted',
    completionBody: 'Pronunciation practice is saved for your next speaking mission.',
    skillChips: ['Listen', 'Say', 'Self-check'],
  },
  reading: {
    mode: 'reading',
    title: 'Story Reader',
    shortTitle: 'Read',
    icon: '📚',
    color: '#8174F2',
    accent: '#51D9A8',
    soft: '#F4F0FF',
    coachTitle: 'Sentence detective',
    coachIdle: 'Read the sentence like a clue. The answer is hiding inside.',
    completionTitle: 'Reading trail opened',
    completionBody: 'The story words now move into comprehension review.',
    skillChips: ['Read', 'Find', 'Explain'],
  },
  grammar: {
    mode: 'grammar',
    title: 'Sentence Garden',
    shortTitle: 'Grammar',
    icon: '🌱',
    color: '#51D9A8',
    accent: '#8174F2',
    soft: '#EFFFF8',
    coachTitle: 'Sentence builder',
    coachIdle: 'Read the whole sentence. The best answer should sound natural.',
    completionTitle: 'Grammar sprout grown',
    completionBody: 'This sentence pattern is ready for spaced practice.',
    skillChips: ['Build', 'Check', 'Explain'],
  },
  story: {
    mode: 'story',
    title: 'Story Island',
    shortTitle: 'Story',
    icon: '🏝️',
    color: '#FF7A7A',
    accent: '#55B7FF',
    soft: '#FFF0F2',
    coachTitle: 'Story clue',
    coachIdle: 'Imagine the scene, then choose the answer from the story.',
    completionTitle: 'Episode complete',
    completionBody: 'Story clues and new words are saved for the next episode.',
    skillChips: ['Imagine', 'Read', 'Answer'],
  },
};

export function getKidPracticeModeTheme(mode: KidPracticeMode) {
  return modeThemes[mode] ?? modeThemes.vocabulary;
}

export function getKidPracticeStageSupport(activity: KidPracticeActivity): KidPracticeStageSupport {
  if (activity.kind === 'speak') {
    return {
      title: 'Voice mission',
      body: 'Say the model word clearly. A grown-up does not need to type anything.',
      actionLabel: 'Play model',
      focus: 'Pronunciation',
    };
  }

  if (activity.kind === 'match') {
    return {
      title: 'Picture match',
      body: 'Compare the picture clue with each word before tapping.',
      actionLabel: 'Hear words',
      focus: 'Visual recall',
    };
  }

  if (activity.kind === 'read' || activity.kind === 'story') {
    return {
      title: 'Story clue',
      body: 'Read the sentence first. The correct answer is supported by the text.',
      actionLabel: 'Read aloud',
      focus: 'Comprehension',
    };
  }

  if (activity.kind === 'build') {
    return {
      title: 'Sentence check',
      body: 'Choose the sentence that sounds like natural English.',
      actionLabel: 'Hear sentence',
      focus: 'Grammar pattern',
    };
  }

  return {
    title: 'Fast recall',
    body: 'Look, listen, and pick the answer that matches the meaning.',
    actionLabel: 'Play audio',
    focus: 'Vocabulary',
  };
}

export function getKidPracticeRewardSteps(activity: KidPracticeActivity): KidPracticeRewardStep[] {
  const middle =
    activity.kind === 'speak'
      ? { id: 'speak', label: 'Speak', icon: '🎤' }
      : activity.kind === 'match'
        ? { id: 'match', label: 'Match', icon: '🧲' }
        : activity.kind === 'read' || activity.kind === 'story'
          ? { id: 'read', label: 'Read', icon: '📖' }
          : activity.kind === 'build'
            ? { id: 'build', label: 'Build', icon: '🌱' }
            : { id: 'choose', label: 'Choose', icon: '👆' };

  return [
    { id: 'listen', label: 'Listen', icon: '🔊' },
    middle,
    { id: 'explain', label: 'Learn why', icon: '💡' },
    { id: 'xp', label: 'Win XP', icon: '⭐' },
  ];
}

export function getKidPracticeDictionaryInsight(activity: KidPracticeActivity): KidPracticeInsight | null {
  const entries = getKidDictionaryEntries();
  const searchable = normalizePracticeText(`${activity.answer} ${activity.audioText} ${activity.prompt} ${activity.passage ?? ''}`);
  const entry = entries.find((item) => {
    const word = normalizePracticeText(item.word);
    return searchable.includes(word);
  });

  if (!entry) return null;

  return {
    entry,
    title: `${capitalize(entry.word)} mini dictionary`,
    body: entry.kidDefinition,
    chips: [
      entry.phonetic,
      entry.syllables.join('-'),
      entry.rhymes.length ? `Rhymes: ${entry.rhymes[0]}` : `Level ${entry.level}`,
    ],
  };
}

export function getKidPracticeCompletionPlan(mode: KidPracticeMode, correctCount: number, total: number, xp: number): KidPracticeCompletionPlan {
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const reviewWindow = accuracy >= 80 ? 'Tomorrow warm-up' : accuracy >= 50 ? 'Later today' : 'Quick retry';
  const masteryLabel = accuracy >= 80 ? 'Mastery rising' : accuracy >= 50 ? 'Almost there' : 'Needs another round';
  const celebration = accuracy >= 80 ? 'You made the words stick.' : accuracy >= 50 ? 'Good learning momentum.' : 'Mistakes are clues. Try a short retry.';
  const nextFocus =
    mode === 'speaking'
      ? 'Repeat the model once more before the next lesson.'
      : mode === 'listening'
        ? 'Listen for the first sound in each word.'
        : mode === 'grammar'
          ? 'Read the full sentence before choosing.'
          : 'Use the picture and meaning together.';

  return {
    accuracy,
    reviewWindow,
    masteryLabel,
    celebration,
    nextFocus,
    stats: [
      { icon: '✅', value: `${correctCount}/${total}`, label: 'correct', color: '#EFFFF8' },
      { icon: '🎯', value: `${accuracy}%`, label: 'accuracy', color: '#FFF7C7' },
      { icon: '⭐', value: `+${xp}`, label: 'XP earned', color: '#F4F0FF' },
    ],
  };
}

function normalizePracticeText(value: string) {
  return value.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
