export const kidImageAssets = {
  appIcon: require('../../assets/icon.png'),
  splashIcon: require('../../assets/splash-icon.png'),
  androidForeground: require('../../assets/android-icon-foreground.png'),
  androidBackground: require('../../assets/android-icon-background.png'),
} as const;

export const kidCharacters = {
  buddy: '🦊',
  listener: '🐰',
  reader: '🐼',
  speaker: '🦁',
  coach: '👩‍🏫',
  guardian: '🔐',
} as const;

export const kidRouteArt = {
  adventure: '🚀',
  rewards: '🏆',
  listening: '🎧',
  speaking: '🎤',
  reading: '📖',
  grammar: '🌱',
  story: '🏝️',
  parent: '🔐',
} as const;

export const kidCategoryArt = {
  alphabet: '🔤',
  numbers: '🔢',
  colors: '🎨',
  animals: '🐶',
  fruits: '🍎',
  family: '👨‍👩‍👧',
  school: '🎒',
  speaking: '🎤',
} as const;

export type KidCharacterKey = keyof typeof kidCharacters;
export type KidRouteArtKey = keyof typeof kidRouteArt;
