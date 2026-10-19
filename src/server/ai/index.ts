import 'server-only';
import { geminiGenerateJson, GEMINI_MODEL } from './gemini';
import { resolveGoogleKey } from './googleKey';
import { OLLAMA_MODEL, ollamaGenerateJson } from './ollama';
import { AiError, type AiRequest } from './types';

export { AiError } from './types';

export type AiProvider = 'ollama' | 'google';

/** AI_PROVIDER=google switches to Gemini; the default is the free, open-source Ollama route. */
export function activeProvider(): AiProvider {
  return process.env.AI_PROVIDER?.toLowerCase() === 'google' ? 'google' : 'ollama';
}

export function activeModel(): string {
  return activeProvider() === 'google' ? GEMINI_MODEL : OLLAMA_MODEL;
}

/** Single entry point for every AI feature (menu scanning today; insights and recommendations next). */
export async function generateStructured(req: AiRequest): Promise<unknown> {
  if (activeProvider() === 'ollama') return ollamaGenerateJson(req);
  const key = await resolveGoogleKey();
  if (!key) {
    throw new AiError('AI is not set up yet. Ask your RestoFlow administrator to add the Google API key.', 503);
  }
  return geminiGenerateJson(key.apiKey, req);
}
