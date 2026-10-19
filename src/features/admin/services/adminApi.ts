import { api } from '@/lib/api';
import type { OnboardingValues } from '../types';

/** A restaurant as the platform admin sees it. */
export interface AdminRestaurant {
  id: string;
  slug: string;
  name: string;
  cuisine: string;
  location: string;
  logo?: string;
  status: 'pending' | 'active' | 'suspended' | 'closed';
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export async function listRestaurants(): Promise<AdminRestaurant[]> {
  return (await api<{ restaurants: AdminRestaurant[] }>('/api/admin/restaurants')).restaurants;
}

/** Creates the restaurant, its first branch, tables, menu categories and the owner account in one step. */
export async function createRestaurant(
  details: OnboardingValues,
  images: { logo?: string; cover?: string },
): Promise<{ id: string; slug: string; name: string }> {
  const res = await api<{ restaurant: { id: string; slug: string; name: string } }>('/api/admin/restaurants', {
    method: 'POST',
    body: { details, logo: images.logo, cover: images.cover },
  });
  return res.restaurant;
}

/** Issues a new one-time owner password. The server returns it once; it is never stored in plain text. */
export function resetOwnerPassword(slug: string) {
  return api<{ ownerEmail: string; ownerName: string; password: string }>(
    `/api/admin/restaurants/${encodeURIComponent(slug)}/reset-password`,
    { method: 'POST' },
  );
}

export async function closeRestaurant(slug: string): Promise<void> {
  await api(`/api/admin/restaurants/${encodeURIComponent(slug)}`, { method: 'DELETE' });
}
