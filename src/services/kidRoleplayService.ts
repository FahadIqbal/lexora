import type { KidPracticeMode } from '../data/kidContent';
import { getKidAdaptiveReviewQueue } from './kidAdaptiveLearningService';
import { getKidDictionaryEntries, type KidDictionaryEntry } from './kidDictionaryService';
import type { KidRuntimeState } from './kidLearningService';

export type KidRoleplayChoice = {
  id: string;
  label: string;
  spokenText: string;
  correct: boolean;
  response: string;
  explanation: string;
  entryId?: string;
  skill: KidPracticeMode;
};

export type KidRoleplayTurn = {
  id: string;
  buddyLine: string;
  prompt: string;
  sceneIcon: string;
  choices: KidRoleplayChoice[];
};

export type KidRoleplayScenario = {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  objective: string;
  icon: string;
  color: string;
  accent: string;
  rewardXp: number;
  focusWords: KidDictionaryEntry[];
  turns: KidRoleplayTurn[];
};

export function getKidRoleplayScenarios(kid: KidRuntimeState): KidRoleplayScenario[] {
  const entries = getKidDictionaryEntries();
  const queue = getKidAdaptiveReviewQueue(kid, 6).map((item) => item.entry);
  const pick = createWordPicker([...queue, ...entries]);

  const apple = pick('kid-apple', 'fruits');
  const banana = pick('kid-banana', 'fruits');
  const hello = pick('kid-hello', 'daily-conversation');
  const like = pick('kid-like', 'grammar');
  const pencil = pick('kid-pencil', 'school');
  const book = pick('kid-book', 'school');
  const mother = pick('kid-mother', 'family');
  const happy = pick('kid-happy', 'feelings');

  return [
    {
      id: 'snack-shop',
      title: 'Snack Shop Chat',
      subtitle: 'Order a snack with kind English.',
      location: 'Sunny Snack Shop',
      objective: `Use ${hello.word}, ${apple.word}, and ${like.word} in a friendly mini conversation.`,
      icon: '🧃',
      color: '#8174F2',
      accent: '#FFD93D',
      rewardXp: 45,
      focusWords: [hello, apple, banana, like],
      turns: [
        makeGreetingTurn(hello),
        {
          id: 'choose-snack',
          buddyLine: 'Buddy says: What snack would you like today?',
          prompt: 'Choose the polite answer.',
          sceneIcon: apple.emoji,
          choices: [
            {
              id: 'apple-like',
              label: `I like ${apple.word}.`,
              spokenText: `I like ${apple.word}.`,
              correct: true,
              response: `Great. One ${apple.word}, please!`,
              explanation: `“I like ${apple.word}” is clear, polite, and uses the target word naturally.`,
              entryId: apple.id,
              skill: 'speaking',
            },
            {
              id: 'banana-one',
              label: `${banana.word}. Now.`,
              spokenText: `${banana.word}. Now.`,
              correct: false,
              response: 'Buddy smiles and says: Let’s make it kinder.',
              explanation: `The word is useful, but the sentence needs a friendly phrase like “please” or “I like.”`,
              entryId: banana.id,
              skill: 'speaking',
            },
            {
              id: 'not-food',
              label: 'I see a pencil.',
              spokenText: 'I see a pencil.',
              correct: false,
              response: 'Buddy points back to the snack shelf.',
              explanation: 'That sentence is correct English, but it does not answer the snack question.',
              skill: 'speaking',
            },
          ],
        },
        {
          id: 'say-thanks',
          buddyLine: 'The shop helper gives you the snack.',
          prompt: 'What should you say next?',
          sceneIcon: '🌟',
          choices: [
            {
              id: 'thank-you',
              label: 'Thank you!',
              spokenText: 'Thank you!',
              correct: true,
              response: 'Buddy cheers: Kind words unlocked!',
              explanation: '“Thank you” finishes a conversation warmly and politely.',
              skill: 'speaking',
            },
            {
              id: 'hello-again',
              label: `${hello.word}!`,
              spokenText: `${hello.word}!`,
              correct: false,
              response: 'Buddy says: We already greeted them.',
              explanation: `“${capitalize(hello.word)}” starts a conversation. “Thank you” closes this moment.`,
              entryId: hello.id,
              skill: 'speaking',
            },
          ],
        },
      ],
    },
    {
      id: 'classroom-helper',
      title: 'Classroom Helper',
      subtitle: 'Ask for school things with confidence.',
      location: 'Bright Classroom',
      objective: `Practice asking for a ${pencil.word} and talking about a ${book.word}.`,
      icon: '🎒',
      color: '#55B7FF',
      accent: '#51D9A8',
      rewardXp: 40,
      focusWords: [hello, pencil, book],
      turns: [
        makeGreetingTurn(hello),
        {
          id: 'ask-pencil',
          buddyLine: 'Teacher says: What do you need for drawing?',
          prompt: 'Pick the useful classroom sentence.',
          sceneIcon: pencil.emoji,
          choices: [
            {
              id: 'need-pencil',
              label: `I need a ${pencil.word}, please.`,
              spokenText: `I need a ${pencil.word}, please.`,
              correct: true,
              response: 'Teacher says: Here you go.',
              explanation: `This sentence names the object and adds “please,” so it is clear and kind.`,
              entryId: pencil.id,
              skill: 'speaking',
            },
            {
              id: 'need-book',
              label: `I eat a ${book.word}.`,
              spokenText: `I eat a ${book.word}.`,
              correct: false,
              response: 'Buddy laughs gently: Books are for reading.',
              explanation: `A ${book.word} is not food. Use “read” or “open” with book.`,
              entryId: book.id,
              skill: 'grammar',
            },
          ],
        },
        {
          id: 'read-book',
          buddyLine: 'Your friend asks: What can we do with a book?',
          prompt: 'Choose the sentence that makes sense.',
          sceneIcon: book.emoji,
          choices: [
            {
              id: 'read-book',
              label: `We can read a ${book.word}.`,
              spokenText: `We can read a ${book.word}.`,
              correct: true,
              response: 'Buddy says: Reading team!',
              explanation: `“Read a ${book.word}” is a natural school sentence.`,
              entryId: book.id,
              skill: 'reading',
            },
            {
              id: 'book-runs',
              label: `The ${book.word} runs fast.`,
              spokenText: `The ${book.word} runs fast.`,
              correct: false,
              response: 'Buddy says: A book cannot run.',
              explanation: 'The grammar is possible, but the meaning is silly for this scene.',
              entryId: book.id,
              skill: 'grammar',
            },
          ],
        },
      ],
    },
    {
      id: 'family-story',
      title: 'Family Story',
      subtitle: 'Talk about people and feelings.',
      location: 'Cozy Story Room',
      objective: `Use family and feeling words like ${mother.word} and ${happy.word}.`,
      icon: '🏡',
      color: '#FF7A7A',
      accent: '#8174F2',
      rewardXp: 45,
      focusWords: [mother, happy, hello],
      turns: [
        makeGreetingTurn(hello),
        {
          id: 'mother-line',
          buddyLine: 'Buddy asks: Who is in your family story?',
          prompt: 'Choose the clear family sentence.',
          sceneIcon: mother.emoji,
          choices: [
            {
              id: 'my-mother',
              label: `My ${mother.word} is kind.`,
              spokenText: `My ${mother.word} is kind.`,
              correct: true,
              response: 'Buddy says: That is a warm sentence.',
              explanation: `“My ${mother.word} is kind” uses a family noun and a describing word.`,
              entryId: mother.id,
              skill: 'speaking',
            },
            {
              id: 'mother-color',
              label: `My ${mother.word} is yellow.`,
              spokenText: `My ${mother.word} is yellow.`,
              correct: false,
              response: 'Buddy says: Let’s describe people kindly.',
              explanation: 'Use feeling or character words for people, such as kind, happy, or helpful.',
              entryId: mother.id,
              skill: 'grammar',
            },
          ],
        },
        {
          id: 'happy-ending',
          buddyLine: 'The story ends with a smile.',
          prompt: 'Pick the best ending.',
          sceneIcon: happy.emoji,
          choices: [
            {
              id: 'happy-ending',
              label: `We are ${happy.word}.`,
              spokenText: `We are ${happy.word}.`,
              correct: true,
              response: 'Buddy says: Perfect story ending.',
              explanation: `“We are ${happy.word}” is a simple feeling sentence.`,
              entryId: happy.id,
              skill: 'speaking',
            },
            {
              id: 'happy-object',
              label: `${capitalize(happy.word)} is a pencil.`,
              spokenText: `${capitalize(happy.word)} is a pencil.`,
              correct: false,
              response: 'Buddy says: Happy is a feeling, not an object.',
              explanation: `Use ${happy.word} to describe how someone feels.`,
              entryId: happy.id,
              skill: 'grammar',
            },
          ],
        },
      ],
    },
  ];
}

export function getKidRoleplayScenario(kid: KidRuntimeState, id?: string | null) {
  const scenarios = getKidRoleplayScenarios(kid);
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}

function makeGreetingTurn(entry: KidDictionaryEntry): KidRoleplayTurn {
  return {
    id: 'hello',
    buddyLine: 'Buddy waves and starts the conversation.',
    prompt: 'How do you answer?',
    sceneIcon: entry.emoji,
    choices: [
      {
        id: 'hello-kind',
        label: `${capitalize(entry.word)}!`,
        spokenText: `${capitalize(entry.word)}!`,
        correct: true,
        response: 'Buddy waves back.',
        explanation: `“${capitalize(entry.word)}” is a friendly way to begin.`,
        entryId: entry.id,
        skill: 'speaking',
      },
      {
        id: 'silent',
        label: '...',
        spokenText: '...',
        correct: false,
        response: 'Buddy waits kindly.',
        explanation: 'A greeting helps the conversation start.',
        entryId: entry.id,
        skill: 'speaking',
      },
    ],
  };
}

function createWordPicker(entries: KidDictionaryEntry[]) {
  return (preferredId: string, fallbackCategory: string) => {
    return (
      entries.find((entry) => entry.id === preferredId) ??
      entries.find((entry) => entry.category === fallbackCategory) ??
      entries[0]
    );
  };
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
