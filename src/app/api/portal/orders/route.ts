import { json, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';
import { loadOrders } from '@/server/domain/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Orders for the signed-in restaurant from the last N hours (default 24, max 720). Polled by the live orders screen. */
export const GET = route(async (request) => {
  const { restaurantId } = requireStaffSession();
  const hours = Math.min(720, Math.max(1, Number(new URL(request.url).searchParams.get('hours')) || 24));
  const since = new Date(Date.now() - hours * 3600_000);
  return json({ orders: await loadOrders({ restaurantId, createdAt: { gte: since } }, 300) });
});
