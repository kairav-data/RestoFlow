/** Admin authentication is verified by the server, which sets an httpOnly session cookie. */
export async function signInAsAdmin(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: body?.error ?? 'Sign in failed. Try again.' };
  } catch {
    return { ok: false, error: 'Could not reach the server. Try again.' };
  }
}

export async function hasAdminSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/session', { cache: 'no-store' });
    return res.ok && ((await res.json()) as { signedIn: boolean }).signedIn;
  } catch {
    return false;
  }
}

export async function signOutAdmin(): Promise<void> {
  try {
    await fetch('/api/admin/logout', { method: 'POST' });
  } catch {
    /* the cookie expires on its own */
  }
}

export type AiKeyStatus = { source: 'admin' | 'environment' | 'none'; last4?: string; updatedAt?: string };

export async function getAiKeyStatus(): Promise<AiKeyStatus> {
  const res = await fetch('/api/admin/ai-settings', { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not load AI settings. Sign in again.');
  return res.json();
}

export async function saveAiKey(apiKey: string): Promise<AiKeyStatus> {
  const res = await fetch('/api/admin/ai-settings', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error((body as { error?: string } | null)?.error ?? 'The key could not be saved.');
  return body as AiKeyStatus;
}

export async function removeAiKey(): Promise<AiKeyStatus> {
  const res = await fetch('/api/admin/ai-settings', { method: 'DELETE' });
  if (!res.ok) throw new Error('The key could not be removed.');
  return res.json();
}
