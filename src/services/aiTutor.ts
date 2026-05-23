import { env, hasAnthropic } from './env';

export type TutorMessage = { role: 'user' | 'assistant'; content: string };

/**
 * Minimal client scaffold.
 * We’ll upgrade this to Anthropic streaming + tool/word-card extraction once the API key is available.
 */
export async function sendTutorMessage(_messages: TutorMessage[]): Promise<string> {
  if (!hasAnthropic()) {
    return 'AI Tutor is not configured yet. Add EXPO_PUBLIC_ANTHROPIC_API_KEY to enable Claude responses.';
  }

  // Placeholder: wire to your backend (recommended) or direct-to-Anthropic (not recommended for production apps).
  // Keeping this as a stub to avoid shipping secrets in the client.
  return `AI Tutor is configured (key present: ${env.anthropicApiKey.slice(0, 4)}…). Next: implement a server endpoint for streaming responses.`;
}

