/**
 * Lexora — Seed Words Script (Prompt 14)
 *
 * This is a skeleton that you can run once Supabase is configured and you have a Claude API key.
 *
 * Recommended flow (production):
 * - Generate content via a backend (Edge Function) so the key isn't stored locally.
 * - Validate JSON strictly before inserting.
 *
 * To run locally:
 *   npm i -D ts-node
 *   npx ts-node scripts/seed-words.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_ANON_KEY');
if (!ANTHROPIC_API_KEY) throw new Error('Missing ANTHROPIC_API_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const categories = [
  'business',
  'academic',
  'medical',
  'legal',
  'literature',
  'science',
  'technology',
  'art',
  'travel',
  'food',
  'psychology',
  'philosophy',
  'environment',
  'sports',
  'daily-life',
  'idioms',
  'phrasal-verbs',
  'ielts',
  'gre-sat',
  'toefl',
  'formal',
  'informal',
  'emotions',
  'describing-people',
  'describing-places',
];

type WordRow = {
  word: string;
  phonetic: string;
  part_of_speech: string;
  definition: string;
  short_definition: string;
  etymology: string;
  difficulty_level: number;
  frequency_rank: number;
  categories: string[];
  example_sentences: { sentence: string; source: string }[];
  synonyms: string[];
  antonyms: string[];
  mnemonic: string;
  image_url?: string;
  audio_url?: string;
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callClaude(words: string[]): Promise<WordRow[]> {
  // NOTE: This is intentionally left as a stub. Wire to Anthropic SDK or HTTP call.
  // Use model: claude-sonnet-4-20250514
  // Request strict JSON:
  // {
  //   "words": [ { ...WordRow } ]
  // }
  //
  // Then parse + validate.
  throw new Error('Claude call not implemented yet. Implement via Anthropic SDK or Edge Function.');
}

async function upsertBatch(rows: WordRow[]) {
  const { error } = await supabase.from('words').upsert(rows, { onConflict: 'word' });
  if (error) throw error;
}

async function main() {
  console.log('Seeding words…');

  // 1) Provide a curated list OR generate a list separately.
  // Placeholder list:
  const targetWords = [
    'ephemeral',
    'meticulous',
    'nuance',
    'mellifluous',
    // ... expand to 2000
  ];

  const batches = chunk(targetWords, 20);
  let inserted = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Batch ${i + 1}/${batches.length}`);

    // 2) Generate data from Claude
    const rows = await callClaude(batch);

    // 3) Insert into Supabase (50 at a time is fine; here batch is small)
    await upsertBatch(rows);

    inserted += rows.length;
    console.log(`Inserted so far: ${inserted}`);

    // 4) Rate limit backoff
    await sleep(800);
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

