import { z } from 'zod';
import type { NutritionInfo } from '@/types';

export const SPICE_LEVELS = ['mild', 'medium', 'spicy', 'extra-spicy'] as const;

/** Open-source models are less strict than schema-enforced APIs, so tolerate common slips instead of rejecting a whole menu. */
const lenientPrice = z.preprocess((v) => {
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return v ?? null;
}, z.number().nonnegative().max(1_000_000).nullable());

export const extractedDishSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(240).nullish().transform((v) => v ?? ''),
  price: lenientPrice,
  halfPrice: lenientPrice.optional().transform((v) => v ?? null),
  categoryId: z.string().trim().max(60).nullish().transform((v) => v ?? null),
  isVegetarian: z.boolean().catch(false),
  spiceLevel: z.enum(SPICE_LEVELS).catch('mild'),
  /** low = hard to read or guessed; the owner is asked to double-check these. */
  confidence: z.enum(['high', 'medium', 'low']).catch('medium'),
});
export type ExtractedDish = z.infer<typeof extractedDishSchema>;

export const extractResponseSchema = z.object({ dishes: z.array(extractedDishSchema).max(150) });

export const extractRequestSchema = z.object({
  image: z
    .string()
    .max(6_000_000)
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/, 'Send a JPEG, PNG or WebP image'),
  categories: z
    .array(z.object({ id: z.string().max(60), name: z.string().max(60) }))
    .min(1)
    .max(30),
});
export type ExtractRequest = z.infer<typeof extractRequestSchema>;

/** A dish in the review step: extracted data plus the owner's edits. */
export interface DraftDish {
  key: string;
  include: boolean;
  name: string;
  description: string;
  price: string;
  /** Empty = no half plate. */
  halfPrice: string;
  categoryId: string;
  isVegetarian: boolean;
  spiceLevel: (typeof SPICE_LEVELS)[number];
  confidence: ExtractedDish['confidence'];
  /** Photo uploaded by the owner; falls back to a category-neutral placeholder. */
  image?: string;
}

export const describeRequestSchema = z.object({
  dishes: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        category: z.string().trim().max(60).optional(),
        isVegetarian: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(40),
});
export type DescribeRequest = z.infer<typeof describeRequestSchema>;

export const describeResponseSchema = z.object({
  descriptions: z.array(
    z.object({ name: z.string().trim().min(1).max(80), description: z.string().trim().min(1).max(240) }),
  ),
});

const grams = z.number().min(0).max(1000);

/** Nutrition facts are optional; empty fields are dropped and an all-empty form means "no nutrition info". */
export const nutritionSchema = z
  .object({
    servingSize: z.string().trim().max(40),
    calories: z.number().min(0).max(5000),
    protein: grams,
    carbs: grams,
    fat: grams,
    fiber: grams,
    sugar: grams,
    sodium: z.number().min(0).max(20000),
  })
  .partial();

/** A dish to create. Prices are in whole currency units; `category` is the category id (slug). */
export interface NewDish {
  name: string;
  description?: string;
  price: number;
  halfPrice?: number;
  category: string;
  isVegetarian: boolean;
  spiceLevel?: (typeof SPICE_LEVELS)[number];
  image?: string;
  dietaryTags?: string[];
  nutrition?: NutritionInfo;
}

/** Fields the owner can change on an existing dish. Prices are whole currency units; `category` is the category id (slug). */
export interface DishChanges {
  name?: string;
  description?: string;
  price?: number;
  halfPrice?: number | null;
  category?: string;
  isVegetarian?: boolean;
  isAvailable?: boolean;
  spiceLevel?: (typeof SPICE_LEVELS)[number];
  image?: string | null;
  nutrition?: NutritionInfo | null;
}
