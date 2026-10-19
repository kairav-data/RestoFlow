import type { MenuCategory } from '@/types';
import { fileToResizedDataUrl } from '@/lib/image';
import { extractResponseSchema, type DraftDish, type ExtractedDish, type NewDish } from '../types';

export const MAX_MENU_PHOTOS = 4;

const PLACEHOLDER_VEG =
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80';
const PLACEHOLDER_NONVEG =
  'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80';

/** Sends one menu photo to the server-side AI route and returns the dishes it read. */
export async function scanMenuPhoto(
  file: File,
  categories: Pick<MenuCategory, 'id' | 'name'>[],
): Promise<ExtractedDish[]> {
  const image = await fileToResizedDataUrl(file, 1800, 'image/jpeg');
  const res = await fetch('/api/menu/extract', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ image, categories: categories.map(({ id, name }) => ({ id, name })) }),
  });
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (json as { error?: string } | null)?.error;
    throw new Error(message || 'Menu scanning failed. Try again.');
  }
  return extractResponseSchema.parse(json).dishes;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Merges dishes from several photos, dropping repeats of the same name, and prepares them for review. */
export function toDrafts(
  batches: ExtractedDish[][],
  categories: Pick<MenuCategory, 'id'>[],
  existingNames: string[],
): DraftDish[] {
  const seen = new Set(existingNames.map(norm));
  const drafts: DraftDish[] = [];
  for (const dish of batches.flat()) {
    const key = norm(dish.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    drafts.push({
      key: `${key}-${drafts.length}`,
      include: true,
      name: dish.name,
      description: dish.description,
      price: dish.price === null ? '' : String(dish.price),
      halfPrice:
        dish.halfPrice !== null && dish.price !== null && dish.halfPrice > 0 && dish.halfPrice < dish.price
          ? String(dish.halfPrice)
          : '',
      categoryId: dish.categoryId ?? categories[0]?.id ?? '',
      isVegetarian: dish.isVegetarian,
      spiceLevel: dish.spiceLevel,
      confidence: dish.price === null && dish.confidence === 'high' ? 'medium' : dish.confidence,
    });
  }
  return drafts;
}

export function draftToMenuItem(draft: DraftDish): NewDish {
  return {
    name: draft.name.trim(),
    description: draft.description.trim() || undefined,
    price: Number(draft.price),
    halfPrice: draft.halfPrice.trim() ? Number(draft.halfPrice) : undefined,
    category: draft.categoryId,
    isVegetarian: draft.isVegetarian,
    dietaryTags: [draft.isVegetarian ? 'vegetarian' : 'non-vegetarian'],
    spiceLevel: draft.spiceLevel,
    image: draft.image ?? (draft.isVegetarian ? PLACEHOLDER_VEG : PLACEHOLDER_NONVEG),
  };
}

/** Why a draft cannot be added yet, or null when it is ready. */
export function draftIssue(draft: DraftDish): 'name' | 'price' | 'half' | null {
  const half = draft.halfPrice.trim();
  if (draft.name.trim().length === 0) return 'name';
  if (draft.price.trim() === '' || !(Number(draft.price) >= 0)) return 'price';
  if (half !== '' && !(Number(half) > 0 && Number(half) < Number(draft.price))) return 'half';
  return null;
}

/** A draft can be added when it has a name and a valid price. */
export function isDraftReady(draft: DraftDish): boolean {
  return draftIssue(draft) === null;
}
