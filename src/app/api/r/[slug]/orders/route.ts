import { HttpError, json, readJson, route } from '@/server/http';
import { requireCustomerSession } from '@/server/security/session';
import { isRateLimited } from '@/server/security/rateLimit';
import { findActiveRestaurant } from '@/server/domain/restaurants';
import { placeOrder, placeOrderSchema } from '@/server/domain/ordering';
import { loadOrders } from '@/server/domain/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { slug: string } };

/** The signed-in guest's own orders at this restaurant (for live tracking and the bill). */
export const GET = route<Ctx>(async (_request, { params }) => {
  const { customerId } = requireCustomerSession();
  const restaurant = await findActiveRestaurant(params.slug);
  const since = new Date(Date.now() - 24 * 3600_000);
  const orders = await loadOrders({ restaurantId: restaurant.id, customerId, createdAt: { gte: since } }, 30);
  return json({ orders });
});

export const POST = route<Ctx>(async (request, { params }) => {
  const { customerId } = requireCustomerSession();
  if (isRateLimited(`order:${customerId}`, request, 12)) {
    throw new HttpError(429, 'You are ordering too quickly. Please wait a moment.');
  }
  const restaurant = await findActiveRestaurant(params.slug);
  const input = placeOrderSchema.parse(await readJson(request));
  const orderId = await placeOrder(restaurant, customerId, input);
  return json({ orderId }, { status: 201 });
});
