import 'server-only';
import { AiError, type AiRequest } from './types';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const MAX_ATTEMPTS = 3;

/** Gemini's schema dialect: upper-case types and `nullable` instead of type unions. */
function toGeminiSchema(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(toGeminiSchema);
  if (!node || typeof node !== 'object') return node;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === 'type') {
      const types = (Array.isArray(value) ? value : [value]) as string[];
      const real = types.find((t) => t !== 'null') ?? 'string';
      out.type = real.toUpperCase();
      if (types.includes('null')) out.nullable = true;
    } else {
      out[key] = toGeminiSchema(value);
    }
  }
  return out;
}

export async function geminiGenerateJson(apiKey: string, req: AiRequest): Promise<unknown> {
  const parts: unknown[] = [];
  if (req.image) parts.push({ inline_data: { mime_type: req.image.mimeType, data: req.image.base64 } });
  parts.push({ text: req.prompt });

  const request = () =>
    fetch(`${BASE}/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: toGeminiSchema(req.schema),
          temperature: 0.1,
        },
      }),
      signal: AbortSignal.timeout(25_000),
    });

  // Google returns 500/503 during demand spikes; these usually clear within seconds, so retry with backoff.
  let res: Response | undefined;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1500 * attempt));
    try {
      res = await request();
    } catch {
      res = undefined;
      continue;
    }
    if (res.status !== 503 && res.status !== 500) break;
    console.warn(`[gemini] ${res.status} on attempt ${attempt + 1}/${MAX_ATTEMPTS}, retrying`);
  }
  if (!res) throw new AiError('The AI service did not respond. Try again.', 504);
  if (res.status === 503 || res.status === 500) {
    throw new AiError('The AI service is under heavy demand right now. Wait a minute and try again.', 503);
  }

  // Upstream bodies are never forwarded to clients, but the reason is logged for the server operator.
  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as
      | { error?: { status?: string; message?: string; details?: { reason?: string }[] } }
      | null;
    const reason = detail?.error?.details?.find((d) => d.reason)?.reason;
    console.error(`[gemini] ${res.status} ${detail?.error?.status ?? ''} ${reason ?? ''} model=${GEMINI_MODEL}: ${detail?.error?.message ?? 'no message'}`);
    if (reason === 'API_KEY_INVALID' || res.status === 401 || res.status === 403) {
      throw new AiError('Google rejected the API key. Ask your administrator to check it.', 502);
    }
    if (res.status === 429) throw new AiError('The AI service is busy or over quota. Try again shortly.', 429);
    if (res.status === 404) throw new AiError('The configured AI model is not available for this key.', 502);
    throw new AiError('The AI service could not process this request.', 502);
  }

  const body = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');
  if (!text) throw new AiError('The AI service returned no result.', 422);
  try {
    return JSON.parse(text);
  } catch {
    throw new AiError('The AI service returned an unreadable result.', 422);
  }
}

/** Cheap check that a key is accepted by Google, used before saving it. */
export async function verifyKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/models?pageSize=1`, {
      headers: { 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
