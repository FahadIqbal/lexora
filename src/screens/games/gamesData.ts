export type GameSlug = 'speed-match' | 'fill-blank' | 'scramble' | 'definition-type' | 'true-false' | 'word-chain';

export interface GameInfo {
  slug: GameSlug;
  title: string;
  icon: string;
  subtitle: string;
  colors: [string, string];
  difficulty: 1 | 2 | 3 | 4 | 5;
  featured?: boolean;
  xpReward: number;
}

export const gameList: GameInfo[] = [
  {
    slug: 'speed-match',
    title: 'Speed Match',
    icon: '⚡',
    subtitle: 'Match words to definitions in 60s.',
    colors: ['#4FB3FF', '#00D8A7'],
    difficulty: 3,
    featured: true,
    xpReward: 50,
  },
  {
    slug: 'fill-blank',
    title: 'Fill in the Blank',
    icon: '🧩',
    subtitle: 'Choose the missing word.',
    colors: ['#8A7CFF', '#FF5D8F'],
    difficulty: 2,
    xpReward: 30,
  },
  {
    slug: 'scramble',
    title: 'Word Scramble',
    icon: '🔤',
    subtitle: 'Unscramble letters under pressure.',
    colors: ['#00D8A7', '#4FB3FF'],
    difficulty: 2,
    xpReward: 30,
  },
  {
    slug: 'definition-type',
    title: 'Definition Match',
    icon: '⌨️',
    subtitle: 'Type the word for a definition.',
    colors: ['#4FB3FF', '#8A7CFF'],
    difficulty: 4,
    xpReward: 40,
  },
  {
    slug: 'true-false',
    title: 'True or False',
    icon: '↔️',
    subtitle: 'Swipe to judge the pair.',
    colors: ['#FF5D8F', '#FFC857'],
    difficulty: 1,
    xpReward: 20,
  },
  {
    slug: 'word-chain',
    title: 'Word Chain',
    icon: '🔗',
    subtitle: 'Build a chain of related words.',
    colors: ['#4CE77D', '#00D8A7'],
    difficulty: 4,
    xpReward: 45,
  },
];
