import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db';
import { json, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SORTS: Record<string, string> = {
  recent: 'rc.last_visit_at DESC',
  spend: 'rc.total_spent_minor DESC',
  visits: 'rc.visit_count DESC, rc.last_visit_at DESC',
  newest: 'rc.first_visit_at DESC',
};

interface Row {
  id: string;
  customer_code: string;
  name: string;
  phone: string;
  email: string | null;
  visit_count: number;
  total_spent_minor: bigint;
  first_visit_at: Date;
  last_visit_at: Date;
  orders_count: number;
  tags: string[];
}

/** The restaurant's own guests: everyone who has ordered here, with visits and spend. Scoped to the session's restaurant. */
export const GET = route(async (request) => {
  const { restaurantId } = requireStaffSession();
  const params = new URL(request.url).searchParams;
  const q = (params.get('q') ?? '').trim().slice(0, 60);
  const order = SORTS[params.get('sort') ?? 'recent'] ?? SORTS.recent;
  const limit = Math.min(100, Math.max(1, Number(params.get('limit')) || 25));
  const offset = Math.max(0, Number(params.get('offset')) || 0);
  const like = `%${q.replace(/[%_\\]/g, '\\$&')}%`;
  const search = q ? Prisma.sql`AND (c.name ILIKE ${like} OR c.phone LIKE ${like} OR c.customer_code ILIKE ${like})` : Prisma.empty;

  const [rows, summary] = await Promise.all([
    prisma.$queryRaw<Row[]>`
      SELECT c.id, c.customer_code, c.name, c.phone, c.email, rc.visit_count, rc.total_spent_minor, rc.first_visit_at, rc.last_visit_at,
             rc.tags,
             (SELECT count(*)::int FROM orders o WHERE o.restaurant_id = rc.restaurant_id AND o.customer_id = c.id
                AND o.status <> 'cancelled') AS orders_count
      FROM restaurant_customers rc
      JOIN customers c ON c.id = rc.customer_id
      WHERE rc.restaurant_id = ${restaurantId}::uuid ${search}
      ORDER BY ${Prisma.raw(order)}
      LIMIT ${limit} OFFSET ${offset}`,
    prisma.$queryRaw<{ total: number; new_30d: number; returning: number; spent: bigint }[]>`
      SELECT count(*)::int AS total,
             count(*) FILTER (WHERE first_visit_at >= now() - interval '30 days')::int AS new_30d,
             count(*) FILTER (WHERE visit_count > 1)::int AS returning,
             COALESCE(sum(total_spent_minor), 0) AS spent
      FROM restaurant_customers WHERE restaurant_id = ${restaurantId}::uuid`,
  ]);

  const s = summary[0];
  return json({
    summary: { total: s.total, newLast30Days: s.new_30d, returning: s.returning, totalSpent: Number(s.spent) / 100 },
    customers: rows.map((r) => ({
      id: r.id,
      customerCode: r.customer_code,
      name: r.name,
      phone: r.phone,
      email: r.email,
      visits: r.visit_count,
      orders: r.orders_count,
      totalSpent: Number(r.total_spent_minor) / 100,
      firstVisitAt: r.first_visit_at.toISOString(),
      lastVisitAt: r.last_visit_at.toISOString(),
      tags: r.tags,
    })),
  });
});
