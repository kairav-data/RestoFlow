import 'server-only';
import { z } from 'zod';
import { toMinor } from './money';
import { nutritionSchema } from '@/features/menu/types';
import type { NutritionInfo } from '@/types';

export const SPICE_TO_LEVEL = { mild: 0, medium: 1, spicy: 2, 'extra-spicy': 3 } as const;

export const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';

/** Dish photos are uploaded as small resized data URLs, or are plain https links. */
const imageSchema = z
  .string()
  .max(400_000)
  .refine((v) => /^https:\/\//.test(v) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v), 'Invalid image');

/** Drops empty values; returns null when nothing was entered so the column stays NULL. */
export function cleanNutrition(input: NutritionInfo | null | undefined): Record<string, string | number> | null {
  if (!input) return null;
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === '') continue;
    out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : null;
}

const price = z.number().positive().max(1_000_000);

export const menuItemInput = z
  .object({
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(240).optional(),
    price,
    halfPrice: price.nullish(),
    category: z.string().trim().max(60),
    isVegetarian: z.boolean(),
    spiceLevel: z.enum(['mild', 'medium', 'spicy', 'extra-spicy']).default('mild'),
    image: imageSchema.nullish(),
    dietaryTags: z.array(z.string().max(30)).max(10).default([]),
    nutrition: nutritionSchema.nullish(),
  })
  .refine((v) => v.halfPrice == null || v.halfPrice < v.price, {
    message: 'The half plate must cost less than the full plate.',
    path: ['halfPrice'],
  });

export const menuItemPatch = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(240).optional(),
  price: price.optional(),
  halfPrice: price.nullable().optional(),
  category: z.string().trim().max(60).optional(),
  isVegetarian: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  spiceLevel: z.enum(['mild', 'medium', 'spicy', 'extra-spicy']).optional(),
  image: imageSchema.nullable().optional(),
  /** null clears the nutrition facts. */
  nutrition: nutritionSchema.nullable().optional(),
});

export { toMinor };
