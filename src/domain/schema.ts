import { z } from 'zod';

export const DifficultySchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const ExampleSentenceSchema = z.object({
  sentence: z.string(),
  source: z.string(),
});

export const WordSchema = z.object({
  id: z.string(),
  word: z.string(),
  phonetic: z.string().default(''),
  part_of_speech: z.string().default(''),
  definition: z.string(),
  short_definition: z.string(),
  etymology: z.string().default(''),
  difficulty_level: DifficultySchema,
  frequency_rank: z.number().int().nonnegative().default(0),
  categories: z.array(z.string()).default([]),
  example_sentences: z.array(ExampleSentenceSchema).default([]),
  synonyms: z.array(z.string()).default([]),
  antonyms: z.array(z.string()).default([]),
  image_url: z.string().optional(),
  audio_url: z.string().optional(),
  mnemonic: z.string().default(''),
});
export type Word = z.infer<typeof WordSchema>;

export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  emoji: z.string().default(''),
  description: z.string().default(''),
  word_count: z.number().int().nonnegative().default(0),
  color: z.string().default('#6C63FF'),
  is_premium: z.boolean().default(false),
});
export type Category = z.infer<typeof CategorySchema>;

export const PlacementQuestionSchema = z.object({
  word: z.string(),
  levelHint: z.string().optional(),
  choices: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
});
export type PlacementQuestion = z.infer<typeof PlacementQuestionSchema>;

export const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/);
export type IsoDate = z.infer<typeof IsoDateSchema>;

export const WordProgressSchema = z.object({
  wordId: z.string(),
  status: z.enum(['new', 'learning', 'reviewing', 'mastered']).default('new'),
  easeFactor: z.number().default(2.5),
  interval: z.number().int().default(1), // days
  repetitions: z.number().int().default(0),
  nextReviewDate: IsoDateSchema.optional(),
  lastReviewedAt: z.number().int().optional(), // epoch ms
  correctCount: z.number().int().default(0),
  incorrectCount: z.number().int().default(0),
  firstSeenAt: z.number().int().optional(),
  masteredAt: z.number().int().optional(),
});
export type WordProgress = z.infer<typeof WordProgressSchema>;

export const DailyStatSchema = z.object({
  date: IsoDateSchema,
  wordsLearned: z.number().int().default(0),
  wordsReviewed: z.number().int().default(0),
  xpEarned: z.number().int().default(0),
  sessionsCount: z.number().int().default(0),
  accuracyCorrect: z.number().int().default(0),
  accuracyTotal: z.number().int().default(0),
});
export type DailyStat = z.infer<typeof DailyStatSchema>;
