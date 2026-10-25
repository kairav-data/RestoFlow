import { prisma } from '@/server/db';
import { HttpError, json, readJson, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';
import { isRateLimited } from '@/server/security/rateLimit';
import { loadOrders } from '@/server/domain/orders';
import { placeStaffOrder, staffOrderSchema } from '@/server/domain/ordering';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Orders for the signed-in restaurant from the last N hours (default 24, max 720). Polled by the live orders screen. */
export const GET = route(async (request) => {
  const { restaurantId } = requireStaffSession();
  const hours = Math.min(720, Math.max(1, Number(new URL(request.url).searchParams.get('hours')) || 24));
  const since = new Date(Date.now() - hours * 3600_000);
  return json({ orders: await loadOrders({ restaurantId, createdAt: { gte: since } }, 300) });
});

/** Staff enter an order for a guest without a phone, or a parcel at the counter. */
export const POST = route(async (request) => {
  const { staffId, restaurantId } = requireStaffSession();
  if (isRateLimited(`staff-order:${staffId}`, request, 30)) {
    throw new HttpError(429, 'Too many orders in a short time. Please wait a moment.');
  }
  const input = staffOrderSchema.parse(await readJson(request));
  const restaurant = await prisma.restaurant.findFirst({ where: { id: restaurantId, status: 'active' } });
  if (!restaurant) throw new HttpError(403, 'This restaurant is not active.');

  const orderId = await placeStaffOrder(restaurant, staffId, input);
  const [order] = await loadOrders({ restaurantId, id: orderId }, 1);
  return json({ order }, { status: 201 });
});
