import { z } from 'zod';
import { prisma } from '@/server/db';
import { HttpError, json, readJson, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';
import { loadOrders } from '@/server/domain/orders';

export const runtime = 'nodejs';

type Ctx = { params: { id: string } };

const body = z.object({ status: z.enum(['preparing', 'ready', 'served', 'cancelled']) });

// An order only moves forward; served and cancelled orders are final.
const NEXT: Record<string, string[]> = {
  new: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['served', 'cancelled'],
};

export const PATCH = route<Ctx>(async (request, { params }) => {
  const { restaurantId } = requireStaffSession();
  const { status } = body.parse(await readJson(request));

  const order = await prisma.order.findFirst({ where: { id: params.id, restaurantId } });
  if (!order) throw new HttpError(404, 'Order not found.');
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
