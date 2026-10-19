import { prisma } from '@/server/db';
import { HttpError, json, readJson, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';
import { loadMenu } from '@/server/domain/restaurants';
import { Prisma } from '@prisma/client';
import { cleanNutrition, menuItemPatch, SPICE_TO_LEVEL, toMinor } from '@/server/domain/menuWrite';

export const runtime = 'nodejs';

type Ctx = { params: { id: string } };

const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

export const PATCH = route<Ctx>(async (request, { params }) => {
  const { restaurantId } = requireStaffSession();
  if (!isUuid(params.id)) throw new HttpError(404, 'Dish not found.');
  const patch = menuItemPatch.parse(await readJson(request));

  // Scoped by restaurantId: a dish id from another restaurant matches nothing.
  const current = await prisma.menuItem.findFirst({ where: { id: params.id, restaurantId } });
  if (!current) throw new HttpError(404, 'Dish not found.');

  const price = patch.price !== undefined ? toMinor(patch.price) : current.priceMinor;
  const half =
    patch.halfPrice === undefined ? current.halfPriceMinor : patch.halfPrice === null ? null : toMinor(patch.halfPrice);
  if (half !== null && half >= price) throw new HttpError(400, 'The half plate must cost less than the full plate.');

  let categoryId = current.categoryId;
  if (patch.category) {
    const category = await prisma.menuCategory.findFirst({ where: { restaurantId, slug: patch.category } });
    if (!category) throw new HttpError(400, 'Unknown category.');
    categoryId = category.id;
  }

  const nutrition = patch.nutrition === undefined ? undefined : cleanNutrition(patch.nutrition);

  await prisma.menuItem.update({
    where: { id: current.id },
    data: {
      name: patch.name,
      description: patch.description,
      priceMinor: price,
      halfPriceMinor: half,
      categoryId,
      isVegetarian: patch.isVegetarian,
      isAvailable: patch.isAvailable,
      spiceLevel: patch.spiceLevel ? SPICE_TO_LEVEL[patch.spiceLevel] : undefined,
      nutrition: nutrition === undefined ? undefined : nutrition === null ? Prisma.DbNull : nutrition,
      calories: nutrition === undefined ? undefined : patch.nutrition?.calories != null ? Math.round(patch.nutrition.calories) : null,
      imageUrl: patch.image === undefined ? undefined : patch.image,
    },
  });
  return json(await loadMenu(restaurantId));
});

/** Dishes that appear on past orders cannot be deleted; they are switched off instead so history stays intact. */
export const DELETE = route<Ctx>(async (_request, { params }) => {
  const { restaurantId } = requireStaffSession();
  if (!isUuid(params.id)) throw new HttpError(404, 'Dish not found.');
  const item = await prisma.menuItem.findFirst({ where: { id: params.id, restaurantId } });
  if (!item) throw new HttpError(404, 'Dish not found.');

  const ordered = await prisma.orderItem.count({ where: { restaurantId, menuItemId: item.id } });
  if (ordered > 0) {
    await prisma.menuItem.update({ where: { id: item.id }, data: { isAvailable: false } });
    return json({ removed: false, disabled: true, ...(await loadMenu(restaurantId)) });
  }
  await prisma.menuItem.delete({ where: { id: item.id } });
  return json({ removed: true, ...(await loadMenu(restaurantId)) });
});
