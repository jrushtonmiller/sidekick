/**
 * Minimal resilient client for OpenRouter chat completions. These calls are
 * large and slow (form text, images), and the API occasionally returns an empty
 * body or a transient 5xx — so we retry those a couple of times and surface
 * anything else (4xx, truncation) with a clear error. Returns the assistant
 * message content string; callers parse it.
 */
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export interface PostChatOptions {
  tries?: number;
  retryDelayMs?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function postChat(
  body: Record<string, unknown>,
  apiKey = process.env.OPENROUTER_API_KEY,
  opts: PostChatOptions = {},
): Promise<string> {
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');
  const tries = opts.tries ?? 3;
  const retryDelayMs = opts.retryDelayMs ?? 800;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= tries; attempt++) {
    const retriable = attempt < tries;
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        if (res.status >= 500 && retriable) {
          lastErr = new Error(`OpenRouter ${res.status}: ${detail.slice(0, 200)}`);
          await sleep(retryDelayMs * attempt);
          continue;
        }
        throw new Error(`OpenRouter ${res.status}: ${detail.slice(0, 400)}`);
      }

      const raw = await res.text();
      if (!raw.trim()) {
        if (retriable) {
          lastErr = new Error('empty response body');
          await sleep(retryDelayMs * attempt);
          continue;
        }
        throw new Error('OpenRouter returned an empty response body');
      }

      const data = JSON.parse(raw) as any;
      const choice = data.choices?.[0];
      if (choice?.finish_reason === 'length') {
        throw new Error('response truncated (finish_reason=length) — raise max_tokens');
      }
      const content: string = choice?.message?.content ?? '';
      if (!content.trim() && retriable) {
        lastErr = new Error('empty message content');
        await sleep(retryDelayMs * attempt);
        continue;
      }
      return content;
    } catch (err) {
      // Network-level failure: retry if attempts remain, else rethrow.
      if (retriable && !(err instanceof Error && /truncated|OpenRouter 4/.test(err.message))) {
        lastErr = err;
        await sleep(retryDelayMs * attempt);
        continue;
      }
      throw err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('OpenRouter request failed');
}
