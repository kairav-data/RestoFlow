import { z } from 'zod';
import { prisma } from '@/server/db';
import { HttpError, json, readJson, route } from '@/server/http';
import { requireCustomerSession } from '@/server/security/session';
import { findActiveRestaurant } from '@/server/domain/restaurants';

export const runtime = 'nodejs';

type Ctx = { params: { slug: string; id: string } };

const body = z.object({ method: z.enum(['upi', 'card', 'cash', 'wallet']) });

/**
 * The guest says how they will pay. Payment is settled at the table: this only records the request,
 * and the restaurant staff mark it paid in the portal.
 */
export const POST = route<Ctx>(async (request, { params }) => {
  const { customerId } = requireCustomerSession();
  const { method } = body.parse(await readJson(request));
  const restaurant = await findActiveRestaurant(params.slug);

  const order = await prisma.order.findFirst({
    where: { id: params.id, restaurantId: restaurant.id, customerId },
  });
  if (!order || order.status === 'cancelled') throw new HttpError(404, 'Order not found.');

  const open = await prisma.payment.findFirst({
    where: { restaurantId: restaurant.id, orderId: order.id, status: { in: ['pending', 'paid'] } },
    orderBy: { createdAt: 'desc' },
  });
  if (open?.status === 'paid') throw new HttpError(409, 'This order is already paid.');

  if (open) {
    await prisma.payment.update({ where: { id_createdAt: { id: open.id, createdAt: open.createdAt } }, data: { method } });
  } else {
    await prisma.payment.create({
      data: {
        restaurantId: restaurant.id,
        orderId: order.id,
        orderCreatedAt: order.createdAt,
        method,
        status: 'pending',
        amountMinor: order.totalMinor,
      },
    });
  }
  return json({ ok: true });
});
