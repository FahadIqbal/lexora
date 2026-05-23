import { seed } from '../../data/seed';

export const gameList = [
  { slug: 'speed-match', title: 'Speed Match', icon: '⚡', subtitle: 'Match words to definitions in 60s.' },
  { slug: 'fill-blank', title: 'Fill in the Blank', icon: '🧩', subtitle: 'Choose the missing word.' },
  { slug: 'scramble', title: 'Word Scramble', icon: '🔤', subtitle: 'Unscramble letters under pressure.' },
  { slug: 'definition-type', title: 'Definition Match', icon: '⌨️', subtitle: 'Type the word for a definition.' },
  { slug: 'true-false', title: 'True or False', icon: '↔️', subtitle: 'Swipe to judge the pair.' },
  { slug: 'word-chain', title: 'Word Chain', icon: '🔗', subtitle: 'Build a chain of related words.' },
] as const;

export function getGameWordSet(count = 12) {
  const day = Math.floor(Date.now() / 86_400_000);
  const out = [];
  for (let i = 0; i < count; i++) out.push(seed.words[(day + i) % seed.words.length]);
  return out;
}
