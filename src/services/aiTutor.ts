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

export async function sendTutorMessage(messages: TutorMessage[]): Promise<string> {
  if (!hasAnthropic()) {
    return 'AI Tutor is not configured yet. Add EXPO_PUBLIC_ANTHROPIC_API_KEY to enable Claude responses.';
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
