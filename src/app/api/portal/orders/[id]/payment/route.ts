import { z } from 'zod';
import { prisma } from '@/server/db';
import { HttpError, json, readJson, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';
import { loadOrders } from '@/server/domain/orders';

export const runtime = 'nodejs';

type Ctx = { params: { id: string } };

const body = z.object({ method: z.enum(['upi', 'card', 'cash', 'wallet']) });

/** Staff confirm that the guest has paid at the table. Updates the guest's lifetime spend once. */
export const POST = route<Ctx>(async (request, { params }) => {
  const { restaurantId } = requireStaffSession();
  const { method } = body.parse(await readJson(request));

  const order = await prisma.order.findFirst({ where: { id: params.id, restaurantId } });
  if (!order || order.status === 'cancelled') throw new HttpError(404, 'Order not found.');

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    const existing = await tx.payment.findFirst({
      where: { restaurantId, orderId: order.id, status: { in: ['pending', 'paid'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (existing?.status === 'paid') throw new HttpError(409, 'This order is already paid.');

    if (existing) {
      await tx.payment.update({
        where: { id_createdAt: { id: existing.id, createdAt: existing.createdAt } },
        data: { method, status: 'paid', paidAt: now },
      });
    } else {
      await tx.payment.create({
        data: {
          restaurantId,
          orderId: order.id,
          orderCreatedAt: order.createdAt,
          method,
          status: 'paid',
          amountMinor: order.totalMinor,
          paidAt: now,
        },
      });
    }
    if (order.customerId) {
      await tx.restaurantCustomer.updateMany({
        where: { restaurantId, customerId: order.customerId },
        data: { totalSpentMinor: { increment: order.totalMinor } },
      });
    }
  });

  const [updated] = await loadOrders({ restaurantId, id: order.id }, 1);
  return json({ order: updated });
});
