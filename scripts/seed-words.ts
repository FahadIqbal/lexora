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
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadDotEnv() {
  const p = path.join(process.cwd(), '.env');
  if (!fs.existsSync(p)) return;
  const raw = fs.readFileSync(p, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();

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

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function safeString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function extractJsonObject(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('Claude response did not include a JSON object');
  }
  const slice = text.slice(start, end + 1);
  return JSON.parse(slice) as unknown;
}

async function callClaude(words: string[]): Promise<WordRow[]> {
  const system =
    'You generate structured vocabulary entries for a language learning app.\n' +
    'Return only valid JSON. No markdown. No extra text.\n' +
    'Categories must be selected from the allowed list.';

  const user =
    `Generate a JSON object with shape {"words":[...]} for the following words:\n` +
    `${words.map((w) => `- ${w}`).join('\n')}\n\n` +
    `Allowed categories:\n${categories.map((c) => `- ${c}`).join('\n')}\n\n` +
    `Each word must include:\n` +
    `- word (string)\n` +
    `- phonetic (string)\n` +
    `- part_of_speech (string)\n` +
    `- definition (string)\n` +
    `- short_definition (string)\n` +
    `- etymology (string)\n` +
    `- difficulty_level (1-5 integer)\n` +
    `- frequency_rank (integer >= 0)\n` +
    `- categories (array of 1-3 strings from allowed list)\n` +
    `- example_sentences (array of 2 objects {sentence, source})\n` +
    `- synonyms (array of strings)\n` +
    `- antonyms (array of strings)\n` +
    `- mnemonic (string)\n` +
    `Optional: image_url, audio_url (strings)\n\n` +
    `Return only JSON.`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': ANTHROPIC_API_KEY,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2400,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  const raw = (await r.json().catch(() => ({}))) as any;
  if (!r.ok) {
    const msg = raw?.error?.message || `Request failed (${r.status})`;
    throw new Error(msg);
  }

  const text = (raw?.content || []).map((b: any) => (b?.type === 'text' ? b.text : '')).join('');
  const parsed = extractJsonObject(text) as any;
  const arr = Array.isArray(parsed?.words) ? parsed.words : null;
  if (!arr) throw new Error('Invalid JSON shape: expected {"words":[...]}');

  return arr.map((row: any) => {
    const cats = Array.isArray(row?.categories) ? row.categories.map((c: any) => String(c)) : [];
    const filteredCats = cats.filter((c: string) => categories.includes(c)).slice(0, 3);

    const examples = Array.isArray(row?.example_sentences) ? row.example_sentences : [];
    const example_sentences = examples
      .map((e: any) => ({ sentence: safeString(e?.sentence), source: safeString(e?.source, 'Lexora') }))
      .filter((e: any) => e.sentence.length > 0)
      .slice(0, 4);

    return {
      word: safeString(row?.word).trim(),
      phonetic: safeString(row?.phonetic),
      part_of_speech: safeString(row?.part_of_speech),
      definition: safeString(row?.definition),
      short_definition: safeString(row?.short_definition),
      etymology: safeString(row?.etymology),
      difficulty_level: clampInt(Number(row?.difficulty_level ?? 3), 1, 5),
      frequency_rank: Math.max(0, Math.round(Number(row?.frequency_rank ?? 0))),
      categories: filteredCats.length ? filteredCats : ['daily-life'],
      example_sentences,
      synonyms: Array.isArray(row?.synonyms) ? row.synonyms.map((s: any) => String(s)).filter(Boolean).slice(0, 12) : [],
      antonyms: Array.isArray(row?.antonyms) ? row.antonyms.map((s: any) => String(s)).filter(Boolean).slice(0, 12) : [],
      mnemonic: safeString(row?.mnemonic),
      image_url: typeof row?.image_url === 'string' ? row.image_url : undefined,
      audio_url: typeof row?.audio_url === 'string' ? row.audio_url : undefined,
    } satisfies WordRow;
  });
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
