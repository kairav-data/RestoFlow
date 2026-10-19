import { prisma } from '@/server/db';
import { json, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Recent guest reviews with averages, for the Feedback & Reviews screen. */
export const GET = route(async () => {
  const { restaurantId } = requireStaffSession();

  const [rows, agg, dishes] = await Promise.all([
    prisma.feedback.findMany({ where: { restaurantId }, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.$queryRaw<{ n: number; overall: number | null; service: number | null; ambience: number | null; value: number | null; recommend: number | null }[]>`
      SELECT count(*)::int AS n, avg(overall_rating)::float AS overall, avg(service_rating)::float AS service,
             avg(ambience_rating)::float AS ambience, avg(value_rating)::float AS value,
             avg(CASE WHEN would_recommend THEN 1 ELSE 0 END)::float AS recommend
      FROM feedback WHERE restaurant_id = ${restaurantId}::uuid`,
    prisma.$queryRaw<{ name: string; avg: number; n: number }[]>`
      SELECT m.name, avg(d.rating)::float AS avg, count(*)::int AS n
      FROM dish_ratings d JOIN menu_items m ON m.restaurant_id = d.restaurant_id AND m.id = d.menu_item_id
      WHERE d.restaurant_id = ${restaurantId}::uuid
      GROUP BY m.id, m.name HAVING count(*) >= 1 ORDER BY avg DESC, n DESC LIMIT 20`,
  ]);

  const customers = await prisma.customer.findMany({
    where: { id: { in: rows.map((r) => r.customerId).filter((v): v is string => !!v) } },
    select: { id: true, name: true },
  });
  const nameOf = new Map(customers.map((c) => [c.id, c.name]));
  const round = (n: number | null) => (n === null ? null : Math.round(n * 10) / 10);
  const a = agg[0];

  return json({
    summary: {
      count: a.n,
      overall: round(a.overall),
      service: round(a.service),
      ambience: round(a.ambience),
      value: round(a.value),
      recommendPercent: a.recommend === null ? null : Math.round(a.recommend * 100),
    },
    dishes: dishes.map((d) => ({ name: d.name, rating: Math.round(d.avg * 10) / 10, count: d.n })),
    reviews: rows.map((r) => ({
      id: r.id,
      customerName: r.customerId ? nameOf.get(r.customerId) ?? 'Guest' : 'Guest',
      overall: r.overallRating,
      service: r.serviceRating,
      ambience: r.ambienceRating,
      value: r.valueRating,
      wouldRecommend: r.wouldRecommend,
      topics: r.topics,
      suggestion: r.suggestion,
      createdAt: r.createdAt.toISOString(),
    })),
  });
});
