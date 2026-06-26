export const kidProfiles = [
  { id: 'mika', name: 'Mika', age: 7, avatar: '🦊', level: 5, streak: 16, xp: 323 },
  { id: 'lina', name: 'Lina', age: 6, avatar: '🐰', level: 3, streak: 9, xp: 184 },
  { id: 'zayd', name: 'Zayd', age: 8, avatar: '🐼', level: 7, streak: 24, xp: 608 },
];

export const kidCourses = [
  {
    id: 'starter',
    title: 'English Starter',
    subtitle: 'Alphabet, colors, numbers, and first words',
    icon: '🌈',
    color: '#8174F2',
    progress: 0.62,
    minutes: 8,
    level: 'Ages 5-7',
  },
  {
    id: 'phonics',
    title: 'Phonics Quest',
    subtitle: 'Hear sounds, blend letters, and read aloud',
    icon: '🔊',
    color: '#55B7FF',
    progress: 0.34,
    minutes: 6,
    level: 'Beginner',
  },
  {
    id: 'stories',
    title: 'Story Island',
    subtitle: 'Read tiny stories and answer picture questions',
    icon: '🏝️',
    color: '#FF7A7A',
    progress: 0.18,
    minutes: 10,
    level: 'Reading',
  },
  {
    id: 'grammar',
    title: 'Grammar Garden',
    subtitle: 'Make sentences, choose verbs, and fix mistakes',
    icon: '🌱',
    color: '#51D9A8',
    progress: 0.12,
    minutes: 7,
    level: 'Practice',
  },
];

export const kidCategories = [
  { id: 'alphabet', label: 'Alphabet', icon: '🔤', color: '#8174F2' },
  { id: 'numbers', label: 'Numbers', icon: '🔢', color: '#55B7FF' },
  { id: 'colors', label: 'Colors', icon: '🎨', color: '#FF7A7A' },
  { id: 'animals', label: 'Animals', icon: '🐶', color: '#51D9A8' },
  { id: 'fruits', label: 'Fruits', icon: '🍎', color: '#FFD93D' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧', color: '#FF9FB3' },
  { id: 'school', label: 'School', icon: '🎒', color: '#8BD3FF' },
  { id: 'speaking', label: 'Speaking', icon: '🎤', color: '#B39CFF' },
];

export const kidLessons = [
  {
    id: 'animals-1',
    courseId: 'starter',
    title: 'Animal Names',
    subtitle: 'Dog, cat, bird, fish, and more',
    icon: '🐶',
    color: '#51D9A8',
    type: 'vocabulary',
    progress: 0.75,
    xp: 50,
    stars: 3,
    locked: false,
  },
  {
    id: 'listen-colors',
    courseId: 'starter',
    title: 'Listen: Colors',
    subtitle: 'Tap the color you hear',
    icon: '🎧',
    color: '#55B7FF',
    type: 'listening',
    progress: 0.35,
    xp: 40,
    stars: 2,
    locked: false,
  },
  {
    id: 'speak-fruits',
    courseId: 'phonics',
    title: 'Say the Fruit',
    subtitle: 'Practice clear pronunciation',
    icon: '🎤',
    color: '#FF7A7A',
    type: 'speaking',
    progress: 0.1,
    xp: 45,
    stars: 1,
    locked: false,
  },
  {
    id: 'story-bunny',
    courseId: 'stories',
    title: 'The Little Bunny',
    subtitle: 'Read a short story and choose answers',
    icon: '🐰',
    color: '#8174F2',
    type: 'reading',
    progress: 0,
    xp: 60,
    stars: 0,
    locked: false,
  },
  {
    id: 'grammar-is-are',
    courseId: 'grammar',
    title: 'Is or Are?',
    subtitle: 'Build correct sentences',
    icon: '🌱',
    color: '#51D9A8',
    type: 'grammar',
    progress: 0,
    xp: 55,
    stars: 0,
    locked: false,
  },
  {
    id: 'story-space',
    courseId: 'stories',
    title: 'Space Story',
    subtitle: 'Unlock after 3 more stars',
    icon: '🚀',
    color: '#55B7FF',
    type: 'story',
    progress: 0,
    xp: 80,
    stars: 0,
    locked: true,
  },
] as const;

export type KidPracticeMode = 'vocabulary' | 'listening' | 'speaking' | 'reading' | 'grammar' | 'story';

export type KidPracticeActivity = {
  id: string;
  mode: KidPracticeMode;
  kind: 'choice' | 'match' | 'speak' | 'read' | 'build' | 'story';
  prompt: string;
  visual: string;
  audioText: string;
  options: string[];
  answer: string;
  hint: string;
  explanation: string;
  passage?: string;
  pairs?: { visual: string; word: string }[];
};

export const kidPracticeActivities: KidPracticeActivity[] = [
  {
    id: 'vocab-picture-cat',
    mode: 'vocabulary',
    kind: 'choice',
    prompt: 'Which word matches this picture?',
    visual: '🐱',
    audioText: 'cat',
    options: ['Cat', 'Dog', 'Fish', 'Bird'],
    answer: 'Cat',
    hint: 'A cat says meow.',
    explanation: 'The picture is a cat, and “cat” is the English word for this animal.',
  },
  {
    id: 'vocab-match-animals',
    mode: 'vocabulary',
    kind: 'match',
    prompt: 'Match the picture to the word.',
    visual: '🐶',
    audioText: 'dog cat bird fish',
    options: ['Dog', 'Cat', 'Bird', 'Fish'],
    answer: 'Dog',
    hint: 'A dog says woof.',
    explanation: 'The first picture is a dog. Matching the picture to “Dog” builds visual vocabulary.',
    pairs: [
      { visual: '🐶', word: 'Dog' },
      { visual: '🐱', word: 'Cat' },
      { visual: '🐦', word: 'Bird' },
      { visual: '🐟', word: 'Fish' },
    ],
  },
  {
    id: 'listen-yellow',
    mode: 'listening',
    kind: 'choice',
    prompt: 'Tap the color you hear.',
    visual: '🎧',
    audioText: 'yellow',
    options: ['Blue', 'Yellow', 'Green', 'Red'],
    answer: 'Yellow',
    hint: 'The sun is often yellow.',
    explanation: 'The audio says “yellow.” Listening first and then choosing the word trains sound recognition.',
  },
  {
    id: 'listen-school',
    mode: 'listening',
    kind: 'choice',
    prompt: 'Listen and choose the school word.',
    visual: '🎒',
    audioText: 'pencil',
    options: ['Pencil', 'Apple', 'Dog', 'Bunny'],
    answer: 'Pencil',
    hint: 'A pencil helps you write.',
    explanation: 'The audio says “pencil,” which is a school object used for writing.',
  },
  {
    id: 'speak-apple',
    mode: 'speaking',
    kind: 'speak',
    prompt: 'Listen, then say the word clearly.',
    visual: '🍎',
    audioText: 'apple',
    options: ['I said apple', 'I need to try again'],
    answer: 'I said apple',
    hint: 'Open your mouth for the “a” sound: apple.',
    explanation: 'Self-check speaking keeps practice gentle for kids while still encouraging clear pronunciation.',
  },
  {
    id: 'speak-family',
    mode: 'speaking',
    kind: 'speak',
    prompt: 'Say the family word.',
    visual: '👩',
    audioText: 'mother',
    options: ['I said mother', 'I need to try again'],
    answer: 'I said mother',
    hint: 'Try slowly: mo-ther.',
    explanation: 'Breaking the word into small sounds makes pronunciation easier to repeat.',
  },
  {
    id: 'read-bunny',
    mode: 'reading',
    kind: 'read',
    prompt: 'Read the sentence. Where is the bunny?',
    visual: '🐰',
    audioText: 'The bunny is under the tree.',
    options: ['Under the tree', 'In the sea', 'On the moon', 'In the box'],
    answer: 'Under the tree',
    hint: 'Look for the words “under the tree.”',
    explanation: 'The sentence says, “The bunny is under the tree,” so that is the correct answer.',
    passage: 'The bunny is under the tree. It has a red ball. The bunny is happy.',
  },
  {
    id: 'grammar-she-is',
    mode: 'grammar',
    kind: 'build',
    prompt: 'Choose the correct sentence.',
    visual: '🌱',
    audioText: 'She is happy.',
    options: ['She are happy.', 'She is happy.', 'She am happy.', 'She be happy.'],
    answer: 'She is happy.',
    hint: 'Use “is” with she, he, and it.',
    explanation: 'In English, “she” uses “is.” The correct sentence is “She is happy.”',
  },
  {
    id: 'story-rocket',
    mode: 'story',
    kind: 'story',
    prompt: 'What does Rami find on the moon?',
    visual: '🚀',
    audioText: 'Rami flies to the moon. He finds a blue star.',
    options: ['A blue star', 'A yellow fish', 'A red chair', 'A green apple'],
    answer: 'A blue star',
    hint: 'The story says he finds a blue star.',
    explanation: 'The story says Rami finds a blue star on the moon.',
    passage: 'Rami puts on his helmet. The rocket goes zoom. On the moon, Rami finds a blue star and says, “Hello!”',
  },
];

export const kidBadges = [
  { id: 'super-star', title: 'Super Star', icon: '⭐', unlocked: true, progress: 1 },
  { id: 'word-hero', title: 'Word Hero', icon: '🦸', unlocked: true, progress: 1 },
  { id: 'listener', title: 'Great Listener', icon: '🎧', unlocked: true, progress: 1 },
  { id: 'reader', title: 'Story Reader', icon: '📚', unlocked: false, progress: 0.45 },
  { id: 'speaker', title: 'Brave Speaker', icon: '🎤', unlocked: false, progress: 0.3 },
  { id: 'grammar', title: 'Grammar Buddy', icon: '🌱', unlocked: false, progress: 0.2 },
];

export const kidFriends = [
  { id: 'ava', name: 'Ava', avatar: '🐨', streak: 12, xp: 410 },
  { id: 'leo', name: 'Leo', avatar: '🦁', streak: 7, xp: 380 },
  { id: 'maya', name: 'Maya', avatar: '🐼', streak: 19, xp: 550 },
  { id: 'noah', name: 'Noah', avatar: '🐸', streak: 5, xp: 290 },
];

export const kidLeaderboard = [
  { rank: 1, name: 'Maya', avatar: '🐼', xp: 550, streak: 19 },
  { rank: 2, name: 'Mika', avatar: '🦊', xp: 323, streak: 16 },
  { rank: 3, name: 'Ava', avatar: '🐨', xp: 410, streak: 12 },
  { rank: 4, name: 'Leo', avatar: '🦁', xp: 380, streak: 7 },
  { rank: 5, name: 'Noah', avatar: '🐸', xp: 290, streak: 5 },
];

export const kidMissions = [
  { id: 'daily-words', title: 'Learn 5 words', reward: '+40 XP', progress: 0.6, icon: '📚' },
  { id: 'listen', title: 'Finish listening', reward: '+20 XP', progress: 0.2, icon: '🎧' },
  { id: 'friend', title: 'Challenge a friend', reward: 'Badge', progress: 0, icon: '🏆' },
];
