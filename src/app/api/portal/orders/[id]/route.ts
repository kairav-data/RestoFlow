import { z } from 'zod';
import { prisma } from '@/server/db';
import { HttpError, json, readJson, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';
import { loadOrders } from '@/server/domain/orders';

export const runtime = 'nodejs';

type Ctx = { params: { id: string } };

const body = z.union([
  z.object({ status: z.enum(['preparing', 'ready', 'served', 'cancelled']) }),
  z.object({ isParcel: z.boolean() }),
]);

// An order only moves forward; served and cancelled orders are final.
const NEXT: Record<string, string[]> = {
  new: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['served', 'cancelled'],
};

export const PATCH = route<Ctx>(async (request, { params }) => {
  const { restaurantId } = requireStaffSession();
  const input = body.parse(await readJson(request));

  const order = await prisma.order.findFirst({ where: { id: params.id, restaurantId } });
  if (!order) throw new HttpError(404, 'Order not found.');

  // Packing can change until the order leaves the kitchen.
  if ('isParcel' in input) {
    if (!['new', 'preparing', 'ready'].includes(order.status)) {
      throw new HttpError(409, `This order is already ${order.status}, so its packing cannot change.`);
    }
    await prisma.order.update({
      where: { id_createdAt: { id: order.id, createdAt: order.createdAt } },
      data: { isParcel: input.isParcel },
    });
    const [updated] = await loadOrders({ restaurantId, id: order.id }, 1);
    return json({ order: updated });
  }

  const { status } = input;
  if (!NEXT[order.status]?.includes(status)) {
    throw new HttpError(409, `This order is already ${order.status}, so it cannot be marked ${status}.`);
  }

  const now = new Date();
  await prisma.order.update({
    where: { id_createdAt: { id: order.id, createdAt: order.createdAt } },
    data: { status, readyAt: status === 'ready' ? now : undefined, servedAt: status === 'served' ? now : undefined },
  });
  const [updated] = await loadOrders({ restaurantId, id: order.id }, 1);
  return json({ order: updated });
});
