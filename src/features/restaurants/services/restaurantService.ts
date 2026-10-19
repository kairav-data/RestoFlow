import { api, ApiError } from '@/lib/api';
import type { Restaurant } from '../types';

/** Public restaurant profile; pass withMenu for the guest ordering experience. Resolves null when it does not exist. */
export async function fetchRestaurant(slug: string, withMenu = false): Promise<Restaurant | null> {
  try {
    const data = await api<{ restaurant: Restaurant }>(
      `/api/public/restaurants/${encodeURIComponent(slug.trim().toLowerCase())}${withMenu ? '?menu=1' : ''}`,
    );
    return data.restaurant;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/** Initials used for the monogram mark, e.g. "SpiceHaven" -> "SH". */
export function restaurantMonogram(name: string): string {
  const words = name.split(/[\s'’-]+/).filter(Boolean);
  if (words.length === 1) {
    const caps = name.match(/[A-Z]/g);
    return (caps && caps.length > 1 ? caps.slice(0, 2).join('') : name.slice(0, 2)).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}
