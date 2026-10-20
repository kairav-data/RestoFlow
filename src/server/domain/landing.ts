import 'server-only';
import { prisma } from '../db';
import type { LandingData } from '@/features/landing/types';

/** Images stored inline in the database are only shown on the landing page when small, to keep the page light. */
const MAX_INLINE_IMAGE = 80_000;

/** The stock pictures used when a dish has no photo of its own (see menuScanService / dishForm). */
const PLACEHOLDER_PHOTOS = ['photo-1546833999-b9f581a1996d', 'photo-1599488615731-7e5c2823ff28', 'photo-1546069901-ba9599a7e63c'];
const isPlaceholder = (url: string | null) => !!url && PLACEHOLDER_PHOTOS.some((id) => url.includes(id));

interface RestaurantRow {
  slug: string;
  name: string;
  cuisine: string | null;
  location: string | null;
  tagline: string | null;
  rating_avg: string;
  rating_count: number;
  logo_url: string | null;
  cover_url: string | null;
  dish_count: number;
}

interface DishRow {
  id: string;
  name: string;
  image_url: string | null;
  price_minor: number;
  is_vegetarian: boolean;
  restaurant_name: string;
  slug: string;
  qty: number;
}

const EMPTY: LandingData = { restaurants: [], dishes: [], stats: { restaurants: 0, guests: 0, orders: 0 } };

/**
 * Live data for the public landing page: active restaurants, the dishes guests order most, and platform totals.
 * Falls back to an empty page (never an error) if the database cannot be reached.
 */
export async function loadLandingData(): Promise<LandingData> {
  try {
    const [restaurants, dishes, totals] = await Promise.all([
      prisma.$queryRaw<RestaurantRow[]>`
        SELECT r.slug, r.name, r.cuisine, r.location, r.tagline, r.rating_avg::text, r.rating_count,
               CASE WHEN length(r.logo_url) <= ${MAX_INLINE_IMAGE} THEN r.logo_url END AS logo_url,
               CASE WHEN length(r.cover_url) <= ${MAX_INLINE_IMAGE} THEN r.cover_url END AS cover_url,
               (SELECT count(*)::int FROM menu_items m WHERE m.restaurant_id = r.id AND m.is_available) AS dish_count
        FROM restaurants r
        WHERE r.status = 'active'
        ORDER BY r.rating_count DESC, r.created_at DESC
        LIMIT 12`,
      prisma.$queryRaw<DishRow[]>`
        WITH sales AS (
          SELECT restaurant_id, menu_item_id, sum(quantity)::int AS qty
          FROM order_items WHERE created_at >= now() - interval '30 days'
          GROUP BY restaurant_id, menu_item_id
        )
        SELECT m.id, m.name, m.price_minor, m.is_vegetarian, r.name AS restaurant_name, r.slug,
               CASE WHEN length(m.image_url) <= ${MAX_INLINE_IMAGE} THEN m.image_url END AS image_url,
               COALESCE(s.qty, 0) AS qty
        FROM menu_items m
        JOIN restaurants r ON r.id = m.restaurant_id AND r.status = 'active'
        LEFT JOIN sales s ON s.restaurant_id = m.restaurant_id AND s.menu_item_id = m.id
        WHERE m.is_available
        ORDER BY COALESCE(s.qty, 0) DESC, m.rating_count DESC, m.created_at DESC
        LIMIT 8`,
      prisma.$queryRaw<{ restaurants: number; guests: number; orders: number }[]>`
        SELECT (SELECT count(*)::int FROM restaurants WHERE status = 'active') AS restaurants,
               (SELECT count(*)::int FROM customers) AS guests,
               (SELECT count(*)::int FROM orders) AS orders`,
    ]);

    return {
      restaurants: restaurants.map((r) => ({
        slug: r.slug,
        name: r.name,
        cuisine: r.cuisine ?? '',
        location: r.location ?? '',
        tagline: r.tagline ?? '',
        rating: Number(r.rating_avg),
        ratingCount: r.rating_count,
        logo: r.logo_url ?? undefined,
        cover: r.cover_url ?? undefined,
        dishCount: r.dish_count,
      })),
      dishes: dishes.map((d) => ({
        id: d.id,
        name: d.name,
        image: d.image_url && !isPlaceholder(d.image_url) ? d.image_url : undefined,
        price: d.price_minor / 100,
        isVegetarian: d.is_vegetarian,
        restaurantName: d.restaurant_name,
        restaurantSlug: d.slug,
        timesOrdered: d.qty,
      })),
      stats: totals[0] ?? EMPTY.stats,
    };
  } catch (err) {
    console.error('[landing] could not load live data:', err);
    return EMPTY;
  }
}
