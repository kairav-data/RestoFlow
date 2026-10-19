import 'server-only';
import type { MenuCategory as ClientCategory, MenuItem as ClientItem, SpiceLevel } from '@/types';
import type { Restaurant as ClientRestaurant } from '@/features/restaurants/types';
import { prisma } from '../db';
import { HttpError } from '../http';
import { fromMinor } from './money';

export const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80';
export const FALLBACK_DISH =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

const SPICE: SpiceLevel[] = ['mild', 'medium', 'spicy', 'extra-spicy'];
const DIETARY = new Set(['vegetarian', 'non-vegetarian', 'egg', 'vegan', 'gluten-free', 'dairy-free', 'jain', 'halal']);

type ItemRow = Awaited<ReturnType<typeof prisma.menuItem.findMany>>[number];
type CategoryRow = Awaited<ReturnType<typeof prisma.menuCategory.findMany>>[number];

export function toClientItem(row: ItemRow, categorySlug: string): ClientItem {
  const tags = row.tags ?? [];
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    price: fromMinor(row.priceMinor),
    halfPrice: row.halfPriceMinor ? fromMinor(row.halfPriceMinor) : undefined,
    category: categorySlug,
    image: row.imageUrl || FALLBACK_DISH,
    rating: Number(row.ratingAvg),
    reviewCount: row.ratingCount,
    isVegetarian: row.isVegetarian,
    spiceLevel: SPICE[Math.min(3, Math.max(0, row.spiceLevel))],
    dietaryTags: tags.filter((t) => DIETARY.has(t)) as ClientItem['dietaryTags'],
    calories: row.calories ?? 0,
    nutrition: (row.nutrition as ClientItem['nutrition'] | null) ?? undefined,
    prepTimeMinutes: row.prepMinutes ?? 15,
    isChefSpecial: tags.includes('chef_special'),
    isBestSeller: tags.includes('best_seller'),
    isMostOrdered: tags.includes('most_ordered'),
    isAvailable: row.isAvailable,
    allergens: row.allergens ?? [],
    whyCustomersLoveIt: [],
    pairings: [],
  };
}

export function toClientCategory(row: CategoryRow, itemCount: number): ClientCategory {
  return { id: row.slug, name: row.name, itemCount, image: row.imageUrl || FALLBACK_DISH };
}

export async function findActiveRestaurant(slug: string) {
  const restaurant = await prisma.restaurant.findFirst({ where: { slug: slug.trim().toLowerCase(), status: 'active' } });
  if (!restaurant) throw new HttpError(404, 'Restaurant not found.');
  return restaurant;
}

/** Menu and categories for one restaurant. Every query is scoped by restaurantId. */
export async function loadMenu(restaurantId: string) {
  const [categories, items] = await Promise.all([
    prisma.menuCategory.findMany({ where: { restaurantId, isActive: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    prisma.menuItem.findMany({ where: { restaurantId }, orderBy: { createdAt: 'desc' } }),
  ]);
  const slugById = new Map(categories.map((c) => [c.id, c.slug]));
  // Popularity comes from real orders over the last two weeks (cancelled orders do not count).
  const sold = await prisma.$queryRaw<{ id: string; qty: number }[]>`
    SELECT i.menu_item_id AS id, sum(i.quantity)::int AS qty
    FROM order_items i JOIN orders o ON o.id = i.order_id AND o.created_at = i.created_at
    WHERE i.restaurant_id = ${restaurantId}::uuid AND o.status <> 'cancelled' AND i.created_at >= now() - interval '14 days'
    GROUP BY i.menu_item_id`;
  const soldById = new Map(sold.map((r) => [r.id, r.qty]));
  const topIds = new Set([...sold].sort((x, y) => y.qty - x.qty).slice(0, 5).map((r) => r.id));
  const menu = items
    .filter((i) => slugById.has(i.categoryId))
    .map((i) => ({
      ...toClientItem(i, slugById.get(i.categoryId)!),
      ordersCount: soldById.get(i.id) ?? 0,
    }))
    .map((i) => ({ ...i, isMostOrdered: i.isMostOrdered || topIds.has(i.id) }));
  const counts = new Map<string, number>();
  for (const m of menu) counts.set(m.category, (counts.get(m.category) ?? 0) + 1);
  return { categories: categories.map((c) => toClientCategory(c, counts.get(c.slug) ?? 0)), menu };
}

export async function toClientRestaurant(
  row: NonNullable<Awaited<ReturnType<typeof prisma.restaurant.findFirst>>>,
  withMenu: boolean,
): Promise<ClientRestaurant> {
  const [branches, menu] = await Promise.all([
    prisma.branch.findMany({ where: { restaurantId: row.id, isActive: true }, orderBy: { createdAt: 'asc' } }),
    withMenu ? loadMenu(row.id) : Promise.resolve({ categories: [], menu: [] }),
  ]);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logo: row.logoUrl ?? undefined,
    tagline: row.tagline ?? '',
    cuisine: row.cuisine ?? '',
    heroImage: row.coverUrl || FALLBACK_HERO,
    heroSubtitle: row.tagline || `Welcome to ${row.name}`,
    heroDescription: row.description ?? '',
    rating: Number(row.ratingAvg),
    totalReviews: row.ratingCount,
    location: row.location ?? '',
    address: row.address ?? '',
    phone: row.phone ?? '',
    operatingHours: row.operatingHours ?? '',
    currency: row.currency,
    branches: branches.map((b) => b.name),
    categories: menu.categories,
    menu: menu.menu,
  };
}

/** Tax and service charge percentages, configurable per restaurant in `settings`. */
export function chargeRates(settings: unknown): { taxPercent: number; servicePercent: number } {
  const s = (settings ?? {}) as { taxPercent?: number; servicePercent?: number };
  return { taxPercent: Number(s.taxPercent ?? 5), servicePercent: Number(s.servicePercent ?? 5) };
}
