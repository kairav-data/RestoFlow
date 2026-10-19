import 'server-only';
import { readGoogleKey } from './secretStore';

export type KeySource = 'admin' | 'environment' | 'none';

/** Key used for every AI feature: the admin-saved key first, then the GOOGLE_API_KEY environment variable. */
export async function resolveGoogleKey(): Promise<{ apiKey: string; source: Exclude<KeySource, 'none'> } | null> {
  const stored = await readGoogleKey();
  if (stored) return { apiKey: stored.apiKey, source: 'admin' };
  const env = process.env.GOOGLE_API_KEY?.trim();
  return env ? { apiKey: env, source: 'environment' } : null;
}

/** Safe description of the key for the admin UI. Never returns the key itself. */
export async function googleKeyStatus(): Promise<{ source: KeySource; last4?: string; updatedAt?: string }> {
  const stored = await readGoogleKey();
  if (stored) return { source: 'admin', last4: stored.apiKey.slice(-4), updatedAt: stored.updatedAt };
  const env = process.env.GOOGLE_API_KEY?.trim();
  return env ? { source: 'environment', last4: env.slice(-4) } : { source: 'none' };
}
