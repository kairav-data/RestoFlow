import { prisma } from '@/server/db';
import { HttpError, json, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RANGES = { today: 1, '7d': 7, '30d': 30 } as const;
type Range = keyof typeof RANGES;

interface Totals {
  orders: number;
  revenue: bigint;
  customers: number;
}

/** Live numbers for the owner dashboard, computed from real orders. Scoped to the session's restaurant. */
export const GET = route(async (request) => {
  const { restaurantId } = requireStaffSession();
  const range = (new URL(request.url).searchParams.get('range') ?? 'today') as Range;
  if (!(range in RANGES)) throw new HttpError(400, 'Unknown range.');
  const days = RANGES[range];

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { timezone: true } });
  if (!restaurant) throw new HttpError(404, 'Restaurant not found.');
  const tz = restaurant.timezone;

  // Start of the first day in the range, and of the equal-length period before it, in the restaurant's timezone.
  const bounds = await prisma.$queryRaw<{ start: Date; prev_start: Date }[]>`
    SELECT (date_trunc('day', now() AT TIME ZONE ${tz}) - make_interval(days => ${days - 1}::int)) AT TIME ZONE ${tz} AS start,
           (date_trunc('day', now() AT TIME ZONE ${tz}) - make_interval(days => ${days * 2 - 1}::int)) AT TIME ZONE ${tz} AS prev_start`;
  const { start, prev_start } = bounds[0];

  const totalsFor = (from: Date, to: Date | null) =>
    prisma.$queryRaw<Totals[]>`
      SELECT count(*)::int AS orders, COALESCE(sum(total_minor), 0) AS revenue,
             count(DISTINCT customer_id)::int AS customers
      FROM orders
      WHERE restaurant_id = ${restaurantId}::uuid AND status <> 'cancelled'
        AND created_at >= ${from} AND (${to}::timestamptz IS NULL OR created_at < ${to})`;

  const [current, previous, newCustomers, series, topDishes, open, rating, paid] = await Promise.all([
    totalsFor(start, null),
    totalsFor(prev_start, start),
    prisma.restaurantCustomer.count({ where: { restaurantId, firstVisitAt: { gte: start } } }),
    prisma.$queryRaw<{ bucket: Date; orders: number; revenue: bigint }[]>`
      SELECT date_trunc(${days === 1 ? 'hour' : 'day'}, o.created_at AT TIME ZONE ${tz}) AS bucket,
             count(*)::int AS orders, COALESCE(sum(o.total_minor), 0) AS revenue
      FROM orders o
      WHERE o.restaurant_id = ${restaurantId}::uuid AND o.status <> 'cancelled' AND o.created_at >= ${start}
      GROUP BY 1 ORDER BY 1`,
    prisma.$queryRaw<{ name: string; image: string | null; quantity: number; revenue: bigint }[]>`
      SELECT m.name, m.image_url AS image, sum(i.quantity)::int AS quantity, sum(i.line_total_minor) AS revenue
      FROM order_items i
      JOIN orders o ON o.id = i.order_id AND o.created_at = i.created_at
      JOIN menu_items m ON m.restaurant_id = i.restaurant_id AND m.id = i.menu_item_id
      WHERE i.restaurant_id = ${restaurantId}::uuid AND o.status <> 'cancelled' AND i.created_at >= ${start}
      GROUP BY m.id, m.name, m.image_url ORDER BY quantity DESC, revenue DESC LIMIT 6`,
    prisma.$queryRaw<{ status: string; n: number }[]>`
      SELECT status::text, count(*)::int AS n FROM orders
      WHERE restaurant_id = ${restaurantId}::uuid AND status IN ('new', 'preparing', 'ready')
        AND created_at >= now() - interval '2 days'
      GROUP BY status`,
    prisma.$queryRaw<{ avg: number | null; n: number }[]>`
      SELECT avg(overall_rating)::float AS avg, count(*)::int AS n FROM feedback
      WHERE restaurant_id = ${restaurantId}::uuid AND created_at >= ${start}`,
    prisma.$queryRaw<{ pending: number }[]>`
      SELECT count(*)::int AS pending FROM payments
      WHERE restaurant_id = ${restaurantId}::uuid AND status = 'pending' AND created_at >= now() - interval '2 days'`,
  ]);

  const cur = current[0];
  const prev = previous[0];
  const change = (now: number, before: number) => (before > 0 ? Math.round(((now - before) / before) * 100) : null);
  const revenue = Number(cur.revenue) / 100;
  const prevRevenue = Number(prev.revenue) / 100;

  return json({
    range,
    since: start.toISOString(),
    kpis: {
      revenue,
      revenueChange: change(revenue, prevRevenue),
      orders: cur.orders,
      ordersChange: change(cur.orders, prev.orders),
      avgOrderValue: cur.orders ? revenue / cur.orders : 0,
      customers: cur.customers,
      newCustomers,
      pendingPayments: paid[0].pending,
      rating: rating[0].avg ? Math.round(rating[0].avg * 10) / 10 : null,
      ratingCount: rating[0].n,
    },
    series: series.map((s) => ({
      // The bucket is already expressed in the restaurant's local time, so format it without a timezone shift.
      label:
        days === 1
          ? `${String(s.bucket.getUTCHours()).padStart(2, '0')}:00`
          : s.bucket.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }),
      orders: s.orders,
      revenue: Number(s.revenue) / 100,
    })),
    topDishes: topDishes.map((d) => ({
      name: d.name,
      image: d.image,
      quantity: d.quantity,
      revenue: Number(d.revenue) / 100,
    })),
    openOrders: Object.fromEntries(open.map((o) => [o.status, o.n])),
  });
});
