import { api, ApiError } from '@/lib/api';
import type { Restaurant, StaffProfile } from '@/features/restaurants/types';

/** Signs in restaurant staff. The server checks the password and sets an httpOnly session cookie for that one restaurant. */
export async function signInToPortal(
  slug: string,
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await api('/api/portal/login', { method: 'POST', body: { slug, email, password } });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : 'Sign in failed. Please try again.' };
  }
}

/** The signed-in staff member and their restaurant (with menu), or null when signed out or signed in elsewhere. */
export async function fetchPortalSession(slug: string): Promise<{ staff: StaffProfile; restaurant: Restaurant } | null> {
  try {
    const data = await api<{ staff: StaffProfile | null; restaurant: Restaurant | null }>('/api/portal/me');
    // A session for another restaurant must not unlock this portal.
    return data.staff && data.restaurant && data.restaurant.slug === slug ? { staff: data.staff, restaurant: data.restaurant } : null;
  } catch {
    return null;
  }
}

export async function signOutOfPortal(): Promise<void> {
  await api('/api/portal/logout', { method: 'POST' }).catch(() => undefined);
}
