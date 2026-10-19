import { z } from 'zod';
import { prisma } from '@/server/db';
import { HttpError, json, readJson, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';
import { loadMenu } from '@/server/domain/restaurants';
import { cleanNutrition, menuItemInput, SPICE_TO_LEVEL, slugify, toMinor } from '@/server/domain/menuWrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const { restaurantId } = requireStaffSession();
  return json(await loadMenu(restaurantId));
});

const bodySchema = z.object({ items: z.array(menuItemInput).min(1).max(100) });

/** Creates dishes (one or many, e.g. from an AI menu scan). The restaurant comes from the session. */
export const POST = route(async (request) => {
  const { restaurantId } = requireStaffSession();
  const { items } = bodySchema.parse(await readJson(request));

  const categories = await prisma.menuCategory.findMany({ where: { restaurantId } });
  if (categories.length === 0) throw new HttpError(409, 'Create a menu category first.');
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const taken = new Set((await prisma.menuItem.findMany({ where: { restaurantId }, select: { slug: true } })).map((i) => i.slug));

  const rows = items.map((item) => {
    const category = bySlug.get(item.category) ?? categories[0];
    let slug = slugify(item.name);
    for (let n = 2; taken.has(slug); n++) slug = `${slugify(item.name)}-${n}`;
    taken.add(slug);
    return {
      restaurantId,
      categoryId: category.id,
      slug,
      name: item.name,
      description: item.description || null,
      priceMinor: toMinor(item.price),
      halfPriceMinor: item.halfPrice ? toMinor(item.halfPrice) : null,
      isVegetarian: item.isVegetarian,
      spiceLevel: SPICE_TO_LEVEL[item.spiceLevel],
      imageUrl: item.image ?? null,
      tags: item.dietaryTags,
      nutrition: cleanNutrition(item.nutrition) ?? undefined,
      calories: item.nutrition?.calories != null ? Math.round(item.nutrition.calories) : null,
    };
  });

  await prisma.menuItem.createMany({ data: rows });
  return json({ created: rows.length, ...(await loadMenu(restaurantId)) }, { status: 201 });
});
