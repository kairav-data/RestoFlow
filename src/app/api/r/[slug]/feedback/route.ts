import { z } from 'zod';
import { prisma } from '@/server/db';
import { HttpError, json, readJson, route } from '@/server/http';
import { requireCustomerSession } from '@/server/security/session';
import { findActiveRestaurant } from '@/server/domain/restaurants';

export const runtime = 'nodejs';

type Ctx = { params: { slug: string } };

const rating = z.number().int().min(1).max(5);

const body = z.object({
  orderId: z.string().uuid(),
  overall: rating,
  service: rating,
  ambience: rating,
  value: rating,
  wouldRecommend: z.boolean(),
  topics: z.array(z.string().trim().max(40)).max(10).default([]),
  suggestion: z.string().trim().max(1000).optional(),
  dishRatings: z
    .array(z.object({ menuItemId: z.string().uuid(), rating, note: z.string().trim().max(300).optional() }))
    .max(40)
    .default([]),
});

/** A guest rates a meal they ordered. One review per order. */
export const POST = route<Ctx>(async (request, { params }) => {
  const { customerId } = requireCustomerSession();
  const input = body.parse(await readJson(request));
  const restaurant = await findActiveRestaurant(params.slug);

  const order = await prisma.order.findFirst({
    where: { id: input.orderId, restaurantId: restaurant.id, customerId },
  });
  if (!order) throw new HttpError(404, 'Order not found.');
  if (await prisma.feedback.findFirst({ where: { restaurantId: restaurant.id, orderId: order.id } })) {
    throw new HttpError(409, 'You have already reviewed this order.');
  }

  // Only dishes that were actually on this order can be rated.
  const ordered = new Set(
    (await prisma.orderItem.findMany({ where: { restaurantId: restaurant.id, orderId: order.id }, select: { menuItemId: true } })).map(
      (i) => i.menuItemId,
    ),
  );
  const dishRatings = input.dishRatings.filter((d) => ordered.has(d.menuItemId));
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const feedback = await tx.feedback.create({
      data: {
        restaurantId: restaurant.id,
        branchId: order.branchId,
        tableId: order.tableId,
        customerId,
        orderId: order.id,
        orderCreatedAt: order.createdAt,
        overallRating: input.overall,
        serviceRating: input.service,
        ambienceRating: input.ambience,
        valueRating: input.value,
        wouldRecommend: input.wouldRecommend,
        topics: input.topics,
        suggestion: input.suggestion || null,
        createdAt: now,
      },
    });
    if (dishRatings.length > 0) {
      await tx.dishRating.createMany({
        data: dishRatings.map((d) => ({
          feedbackId: feedback.id,
          restaurantId: restaurant.id,
          menuItemId: d.menuItemId,
          rating: d.rating,
          note: d.note || null,
          createdAt: now,
        })),
      });
    }
    // Keep the denormalised averages shown on the menu and the restaurant page current.
    await tx.$executeRaw`
      UPDATE restaurants r SET rating_avg = s.avg, rating_count = s.n
      FROM (SELECT avg(overall_rating)::numeric(3,2) AS avg, count(*)::int AS n FROM feedback WHERE restaurant_id = ${restaurant.id}::uuid) s
      WHERE r.id = ${restaurant.id}::uuid`;
    for (const d of dishRatings) {
      await tx.$executeRaw`
        UPDATE menu_items m SET rating_avg = s.avg, rating_count = s.n
        FROM (SELECT avg(rating)::numeric(3,2) AS avg, count(*)::int AS n FROM dish_ratings
              WHERE restaurant_id = ${restaurant.id}::uuid AND menu_item_id = ${d.menuItemId}::uuid) s
        WHERE m.id = ${d.menuItemId}::uuid AND m.restaurant_id = ${restaurant.id}::uuid`;
    }
  });
  return json({ ok: true }, { status: 201 });
});
