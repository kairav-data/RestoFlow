import 'server-only';
import { AiError, type AiRequest } from './types';

export const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
// A vision-capable open model. `ollama pull qwen2.5vl:7b` or `gemma3:4b` run fully offline;
// `gemma4:31b-cloud` is an open model served through your Ollama account.
const RAW_MODEL = process.env.OLLAMA_MODEL || 'gemma4:31b-cloud';
// Ollama's hosted API (https://ollama.com) is used with an API key and names models without the "-cloud" suffix.
const HOSTED = /^https:\/\/(www\.)?ollama\.com$/.test(OLLAMA_BASE_URL);
export const OLLAMA_MODEL = HOSTED ? RAW_MODEL.replace(/-cloud$/, '') : RAW_MODEL;
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY?.trim();

/** Free, open-source models served by Ollama. Structured output is enforced with the JSON Schema `format`. */
export async function ollamaGenerateJson(req: AiRequest): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(OLLAMA_API_KEY ? { authorization: `Bearer ${OLLAMA_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: req.schema,
        options: { temperature: 0.1 },
        messages: [{ role: 'user', content: `${req.prompt}

Respond with ONLY a JSON object of this shape. No prose, no markdown.
${req.outputHint ?? JSON.stringify(req.schema)}`, ...(req.image ? { images: [req.image.base64] } : {}) }],
      }),
      signal: AbortSignal.timeout(55_000),
    });
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === 'TimeoutError';
    console.error(`[ollama] request failed (${OLLAMA_BASE_URL}, model=${OLLAMA_MODEL}):`, err);
    throw new AiError(
      timedOut
        ? 'The AI model took too long to read this photo. Try a smaller photo or a faster model.'
        : HOSTED ? 'Cannot reach the Ollama cloud API. Try again in a moment.' : 'Cannot reach Ollama. Start the Ollama app on the server and try again.',
      timedOut ? 504 : 503,
    );
  }

  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { error?: string } | null;
    console.error(`[ollama] ${res.status} model=${OLLAMA_MODEL}: ${detail?.error ?? 'no message'}`);
    if (res.status === 404) {
      throw new AiError(`The AI model "${OLLAMA_MODEL}" is not installed. Run: ollama pull ${OLLAMA_MODEL}`, 503);
    }
    if (res.status === 401 || res.status === 403) {
      throw new AiError(
        HOSTED ? 'The Ollama API key is missing or not valid. Set OLLAMA_API_KEY on the server.' : 'Ollama is not signed in for cloud models. Run: ollama signin',
        503,
      );
    }
    // Surface the provider reason when it is a model problem (retired, unavailable, no image support), minus its internal ref id.
    const reason = detail?.error?.replace(/\s*\(ref:[^)]*\)\s*$/, '').trim();
    if (reason && /retired|deprecated|not found|unavailable|does not support|image/i.test(reason)) {
      throw new AiError(`The AI model "${OLLAMA_MODEL}" cannot be used: ${reason.slice(0, 160)}`, 503);
    }
    throw new AiError('The AI model could not process this photo. Make sure it supports images.', 502);
  }

  const body = (await res.json()) as { message?: { content?: string } };
  const text = body.message?.content?.trim();
  if (!text) throw new AiError('The AI model returned no result.', 422);
  const parsed = parseLooseJson(text);
  if (parsed === undefined) {
    console.error(`[ollama] unparseable output from ${OLLAMA_MODEL}: ${text.slice(0, 300)}`);
    throw new AiError('The AI model returned an unreadable result. Try again.', 422);
  }
  return parsed;
}

/** Some models (notably cloud-served ones) ignore `format`, so accept fenced or prefixed JSON too. */
function parseLooseJson(text: string): unknown {
  const candidates = [text, text.replace(/^```(?:json)?\s*|\s*```$/g, '')];
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) candidates.push(text.slice(start, end + 1));
  for (const c of candidates) {
    try {
      return JSON.parse(c);
    } catch {
      /* try the next candidate */
    }
  }
  return undefined;
}
