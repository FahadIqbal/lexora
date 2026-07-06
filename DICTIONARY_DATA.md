# Dictionary Data

Lexora can support a full professional dictionary, including definitions, phonetics, examples, synonyms, antonyms, mnemonics, categories, images, and pronunciation audio references.

Oxford/OUP dictionary content is licensed content. Do not copy or commit Oxford entries, definitions, examples, or audio files into this repository unless the project has explicit rights to distribute them.

## Licensed Import

Use the importer for any licensed dictionary export:

```bash
npx tsx scripts/import-licensed-dictionary.ts \
  --file ./licensed-dictionary.jsonl \
  --source-name "Licensed dictionary export" \
  --source-license "Commercial license held by Lexora"
```

Use `--dry-run` to validate shape without writing to Supabase.

Accepted formats:

- JSON array of word rows
- `{ "words": [...] }`
- JSONL, one word row per line

Each row must match the app `Word` shape from `src/domain/schema.ts`.

## Pronunciation

The app supports:

- `phonetic` text for IPA or learner-friendly pronunciation.
- `audio_url` for licensed recorded audio references.
- Device text-to-speech fallback through `expo-speech` when recorded audio is unavailable.

Recorded dictionary audio should be hosted by a licensed provider or by Lexora-owned storage with distribution rights.
