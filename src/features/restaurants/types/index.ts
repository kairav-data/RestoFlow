import type { MenuCategory, MenuItem } from '@/types';

export interface RestaurantTable {
  id: string;
  /** Human name printed on the QR tent card, e.g. "T12" or "Terrace 3". */
  name: string;
  capacity: number;
}

/** The signed-in staff member viewing the owner portal. */
export interface StaffProfile {
  id: string;
  name: string;
  role: 'owner' | 'manager' | 'staff' | 'kitchen';
  email: string;
}

/** Public view of a restaurant, as served to guests and the portal sign-in page. */
export interface Restaurant {
  id: string;
  /** URL-safe identifier used by the portal (/portal/<slug>) and guest links (/r/<slug>/t/<table>). */
  slug: string;
  name: string;
  /** Uploaded logo URL; the monogram is shown when absent. */
  logo?: string;
  tagline: string;
  cuisine: string;
  heroImage: string;
  heroSubtitle: string;
  heroDescription: string;
  rating: number;
  totalReviews: number;
  location: string;
  address: string;
  phone: string;
  operatingHours: string;
  currency: string;
  branches: string[];
  categories: MenuCategory[];
  menu: MenuItem[];
}
