import { z } from 'zod';
import { CategorySchema, PlacementQuestionSchema, WordSchema, type Category, type PlacementQuestion, type Word } from '../../domain/schema';

import rawCategories from './categories.json';
import rawWords from './words.json';
import rawPlacement from './placement.json';

const CategoriesSchema = z.array(CategorySchema);
const WordsSchema = z.array(WordSchema);
const PlacementSchema = z.array(PlacementQuestionSchema);

export const seed = {
  categories: CategoriesSchema.parse(rawCategories) as Category[],
  words: WordsSchema.parse(rawWords) as Word[],
  placement: PlacementSchema.parse(rawPlacement) as PlacementQuestion[],
} as const;

