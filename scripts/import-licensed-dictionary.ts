import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { WordSchema } from '../src/domain/schema';

type Args = {
  file: string;
  sourceName: string;
  sourceLicense: string;
  dryRun: boolean;
};

const ImportWordSchema = WordSchema.omit({ id: true }).extend({
  id: z.string().optional(),
  word: z.string().min(1),
});

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const read = (name: string) => {
    const idx = args.indexOf(name);
    if (idx < 0) return '';
    return args[idx + 1] ?? '';
  };
  const file = read('--file');
  const sourceName = read('--source-name');
  const sourceLicense = read('--source-license');
  const dryRun = args.includes('--dry-run');

  if (!file) throw new Error('Missing --file path/to/dictionary.json or .jsonl');
  if (!sourceName) throw new Error('Missing --source-name. Example: --source-name "Licensed Oxford export"');
  if (!sourceLicense) throw new Error('Missing --source-license. Import only data you have rights to use.');
  return { file, sourceName, sourceLicense, dryRun };
}

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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

function readRows(filePath: string) {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, 'utf8');
  if (abs.endsWith('.jsonl')) {
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as unknown);
  }
  const parsed = JSON.parse(raw) as unknown;
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { words?: unknown[] }).words)) {
    return (parsed as { words: unknown[] }).words;
  }
  throw new Error('Dictionary file must be an array, {"words":[...]}, or JSONL.');
}

function normalizeRow(row: unknown, sourceName: string) {
  const parsed = ImportWordSchema.parse(row);
  const word = parsed.word.trim();
  return {
    ...parsed,
    id: parsed.id ?? `licensed-${slugify(word)}`,
    word,
    example_sentences: parsed.example_sentences.length
      ? parsed.example_sentences
      : [{ sentence: `I learned the word ${word}.`, source: sourceName }],
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  loadDotEnv();
  const args = parseArgs();
  const rows = readRows(args.file).map((row) => normalizeRow(row, args.sourceName));

  console.log(`Validated ${rows.length} dictionary entries from ${args.sourceName}.`);
  console.log(`License confirmation: ${args.sourceLicense}`);
  if (args.dryRun) return;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseKey) throw new Error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY.');

  const supabase = createClient(supabaseUrl, supabaseKey);
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from('words').upsert(batch, { onConflict: 'id' });
    if (error) throw error;
    console.log(`Imported ${Math.min(i + batch.length, rows.length)}/${rows.length}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
