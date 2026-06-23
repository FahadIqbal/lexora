import { env, hasAnthropic } from './env';

export type TutorMessage = { role: 'user' | 'assistant'; content: string };

type AnthropicMessage = { role: 'user' | 'assistant'; content: string };

type AnthropicResponse = {
  content?: Array<{ type: 'text'; text: string } | { type: string }>;
  error?: { type?: string; message?: string };
};

function extractText(res: AnthropicResponse): string {
  const blocks = res.content ?? [];
  const text = blocks
    .map((b) => (b && typeof b === 'object' && 'type' in b && b.type === 'text' && 'text' in b ? (b.text as string) : ''))
    .join('')
    .trim();
  return text;
}

function offlineTutorResponse(messages: TutorMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === 'user')?.content.trim() || 'a new word';
  const wordMatch = last.match(/(?:about|word|for|use|quiz me on|synonyms for|explain)\s+[_*"]?([a-zA-Z-]{4,})[_*"]?/i);
  const word = wordMatch?.[1]?.replace(/[-_]/g, ' ') || last.split(/\s+/).find((x) => /^[a-zA-Z-]{4,}$/.test(x)) || 'this word';
  const asksQuiz = /quiz|test|practice/i.test(last);
  const asksSynonyms = /synonym|similar|alternative/i.test(last);
  const asksSimpler = /simple|simpler|explain|meaning/i.test(last);

  if (asksQuiz) {
    return [
      `### Quick quiz: ${word}`,
      '',
      `Pick the strongest use of **${word}**:`,
      '',
      `A. A precise word used when the situation needs nuance.`,
      `B. A filler word with no clear meaning.`,
      `C. A word only used in casual slang.`,
      '',
      'Reply with **A**, **B**, or **C**, and I will coach the next step.',
    ].join('\n');
  }

  if (asksSynonyms) {
    return [
      `### Synonym coach: ${word}`,
      '',
      '- **Close match:** precise',
      '- **Softer option:** thoughtful',
      '- **Stronger option:** exacting',
      '',
      `Use the strongest synonym only when the sentence needs confidence or expertise.`,
      '',
      `Try: "Her feedback was **precise**, which made the revision easier."`,
    ].join('\n');
  }

  if (asksSimpler) {
    return [
      `### Simple meaning: ${word}`,
      '',
      `Think of **${word}** as a word you use when you want to sound clear, specific, and intentional.`,
      '',
      '- **Plain version:** clear and exact',
      '- **Common mistake:** using it when a simpler everyday word would be warmer',
      '',
      `Micro-practice: write one sentence using **${word}** in a work message.`,
    ].join('\n');
  }

  return [
    `### Coach note: ${word}`,
    '',
    `Here is a practical way to use **${word}** without sounding forced:`,
    '',
    `> "The team needed a more **${word}** explanation before making a decision."`,
    '',
    '- Keep the sentence concrete.',
    '- Pair the word with a real situation.',
    '- Avoid using it twice in the same paragraph.',
    '',
    'Ask me to make it simpler, find synonyms, or quiz you next.',
  ].join('\n');
}

export async function sendTutorMessage(messages: TutorMessage[]): Promise<string> {
  if (!hasAnthropic()) {
    return offlineTutorResponse(messages);
  }

  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    return 'AI Tutor is disabled in production builds. Proxy requests through a backend or Supabase Edge Function.';
  }

  const system =
    'You are Lexora AI Tutor, an expert vocabulary coach.\n' +
    'Be concise, practical, and friendly.\n' +
    'Prefer: (1) a crisp meaning, (2) 1-2 examples, (3) common mistakes, (4) a quick micro-quiz when appropriate.\n' +
    'Use Markdown with short bullets. Avoid long preambles.';

  const payload = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })) as AnthropicMessage[],
  };

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': env.anthropicApiKey,
    },
    body: JSON.stringify(payload),
  });

  const raw = (await r.json().catch(() => ({}))) as AnthropicResponse;
  if (!r.ok) {
    const msg = raw?.error?.message || `Request failed (${r.status})`;
    return `AI Tutor error: ${msg}`;
  }

  const text = extractText(raw);
  return text || 'AI Tutor returned an empty response.';
}
