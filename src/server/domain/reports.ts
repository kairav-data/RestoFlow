import 'server-only';
import { z } from 'zod';
import { prisma } from '../db';
import { HttpError } from '../http';
import { fromMinor } from './money';

const MAX_DAYS = 366;
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use dates like 2026-10-25.');

export const reportRangeSchema = z
  .object({ from: isoDate, to: isoDate })
  .refine((r) => r.from <= r.to, { message: 'The start date must be on or before the end date.' })
  .refine((r) => (Date.parse(r.to) - Date.parse(r.from)) / 86_400_000 < MAX_DAYS, {
    message: `Reports can cover at most ${MAX_DAYS} days.`,
  });
export type ReportRange = z.infer<typeof reportRangeSchema>;

export const REPORT_KINDS = ['orders', 'daily', 'dishes'] as const;
export type ReportKind = (typeof REPORT_KINDS)[number];

/** Reports show revenue, so only owners and managers may open them. */
export async function requireReportAccess(staffId: string, restaurantId: string) {
  const [staff, restaurant] = await Promise.all([
    prisma.staffUser.findFirst({ where: { id: staffId, restaurantId, status: 'active' }, select: { role: true } }),
    prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { timezone: true, currency: true, slug: true } }),
  ]);
  if (!staff || !restaurant) throw new HttpError(401, 'Please sign in again.');
  if (staff.role !== 'owner' && staff.role !== 'manager') {
    throw new HttpError(403, 'Only owners and managers can view reports.');
  }
  return restaurant;
}

type Scope = { restaurantId: string; timezone: string; range: ReportRange };

/** Start and end (exclusive) of the range, as instants, with both dates read in the restaurant's timezone. */
async function bounds({ timezone, range }: Scope) {
  const [b] = await prisma.$queryRaw<{ start: Date; end: Date }[]>`
    SELECT (${range.from}::date)::timestamp AT TIME ZONE ${timezone}::text AS start,
           ((${range.to}::date) + 1)::timestamp AT TIME ZONE ${timezone}::text AS "end"`;
  return b;
}

const TYPE_LABEL: Record<string, string> = { dine_in: 'Staff (dine-in)', takeaway: 'Staff (counter)', qr_online: 'QR' };

export interface OrderReportRow {
  date: string;
  time: string;
  orderNumber: number;
  source: string;
  parcel: boolean;
  table: string;
  guest: string;
  items: string;
  itemCount: number;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  placedBy: string;
}

/** One row per order in the range, oldest first, including cancelled orders so the report is complete. */
export async function orderRows(scope: Scope): Promise<OrderReportRow[]> {
  const { start, end } = await bounds(scope);
  const rows = await prisma.$queryRaw<
    {
      local: Date;
      order_number: number;
      order_type: string;
      is_parcel: boolean;
      table_name: string | null;
      guest: string | null;
      items: string | null;
      item_count: number;
      subtotal_minor: number;
      tax_minor: number;
      service_charge_minor: number;
      discount_minor: number;
      total_minor: number;
      status: string;
      pay_status: string | null;
      pay_method: string | null;
      staff_name: string | null;
    }[]
  >`
    SELECT o.created_at AT TIME ZONE ${scope.timezone}::text AS local, o.order_number, o.order_type::text AS order_type,
           o.is_parcel, t.name AS table_name, COALESCE(c.name, o.guest_name) AS guest,
           (SELECT string_agg(i.quantity || ' x ' || i.name_snapshot, '; ' ORDER BY i.name_snapshot)
              FROM order_items i
             WHERE i.order_id = o.id AND i.created_at = o.created_at AND i.restaurant_id = o.restaurant_id) AS items,
           (SELECT COALESCE(sum(i.quantity), 0)::int
              FROM order_items i
             WHERE i.order_id = o.id AND i.created_at = o.created_at AND i.restaurant_id = o.restaurant_id) AS item_count,
           o.subtotal_minor, o.tax_minor, o.service_charge_minor, o.discount_minor, o.total_minor, o.status::text AS status,
           pay.status::text AS pay_status, pay.method::text AS pay_method, s.full_name AS staff_name
    FROM orders o
    LEFT JOIN dining_tables t ON t.restaurant_id = o.restaurant_id AND t.id = o.table_id
    LEFT JOIN customers c ON c.id = o.customer_id
    LEFT JOIN staff_users s ON s.restaurant_id = o.restaurant_id AND s.id = o.placed_by_staff_id
    LEFT JOIN LATERAL (
      SELECT p.status, p.method FROM payments p
      WHERE p.restaurant_id = o.restaurant_id AND p.order_id = o.id
      ORDER BY p.created_at DESC LIMIT 1
    ) pay ON true
    WHERE o.restaurant_id = ${scope.restaurantId}::uuid AND o.created_at >= ${start} AND o.created_at < ${end}
    ORDER BY o.created_at`;

  return rows.map((r) => ({
    // `local` is already in restaurant time, so read its UTC fields to avoid a second timezone shift.
    date: r.local.toISOString().slice(0, 10),
    time: r.local.toISOString().slice(11, 16),
    orderNumber: r.order_number,
    source: TYPE_LABEL[r.order_type] ?? r.order_type,
    parcel: r.is_parcel,
    table: r.table_name ?? '',
    guest: r.guest ?? '',
    items: r.items ?? '',
    itemCount: r.item_count,
    subtotal: fromMinor(r.subtotal_minor),
    tax: fromMinor(r.tax_minor),
    serviceCharge: fromMinor(r.service_charge_minor),
    discount: fromMinor(r.discount_minor),
    total: fromMinor(r.total_minor),
    status: r.status,
    paymentStatus: r.status === 'cancelled' ? '' : r.pay_status === 'paid' ? 'paid' : 'unpaid',
    paymentMethod: r.pay_status === 'paid' ? (r.pay_method ?? '') : '',
    placedBy: r.staff_name ?? '',
  }));
}

export interface DailyReportRow {
  date: string;
  orders: number;
  cancelled: number;
  parcels: number;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  revenue: number;
  collected: number;
  cash: number;
  upi: number;
  card: number;
  wallet: number;
  unpaid: number;
}

/** Revenue per day. Revenue counts every order that was not cancelled; "collected" counts confirmed payments. */
export async function dailyRows(scope: Scope): Promise<DailyReportRow[]> {
  const { start, end } = await bounds(scope);
  const rows = await prisma.$queryRaw<
    {
      day: Date;
      orders: number;
      cancelled: number;
      parcels: number;
      subtotal: bigint;
      tax: bigint;
      service: bigint;
      discount: bigint;
      revenue: bigint;
      cash: bigint;
      upi: bigint;
      card: bigint;
      wallet: bigint;
    }[]
  >`
    WITH o AS (
      SELECT o.*, (o.created_at AT TIME ZONE ${scope.timezone}::text)::date AS day, pay.method AS paid_method
      FROM orders o
      LEFT JOIN LATERAL (
        SELECT p.method FROM payments p
        WHERE p.restaurant_id = o.restaurant_id AND p.order_id = o.id AND p.status = 'paid'
        ORDER BY p.created_at DESC LIMIT 1
      ) pay ON true
      WHERE o.restaurant_id = ${scope.restaurantId}::uuid AND o.created_at >= ${start} AND o.created_at < ${end}
    )
    SELECT day,
           count(*) FILTER (WHERE status <> 'cancelled')::int AS orders,
           count(*) FILTER (WHERE status = 'cancelled')::int AS cancelled,
           count(*) FILTER (WHERE status <> 'cancelled' AND is_parcel)::int AS parcels,
           COALESCE(sum(subtotal_minor) FILTER (WHERE status <> 'cancelled'), 0) AS subtotal,
           COALESCE(sum(tax_minor) FILTER (WHERE status <> 'cancelled'), 0) AS tax,
           COALESCE(sum(service_charge_minor) FILTER (WHERE status <> 'cancelled'), 0) AS service,
           COALESCE(sum(discount_minor) FILTER (WHERE status <> 'cancelled'), 0) AS discount,
           COALESCE(sum(total_minor) FILTER (WHERE status <> 'cancelled'), 0) AS revenue,
           COALESCE(sum(total_minor) FILTER (WHERE status <> 'cancelled' AND paid_method = 'cash'), 0) AS cash,
           COALESCE(sum(total_minor) FILTER (WHERE status <> 'cancelled' AND paid_method = 'upi'), 0) AS upi,
           COALESCE(sum(total_minor) FILTER (WHERE status <> 'cancelled' AND paid_method = 'card'), 0) AS card,
           COALESCE(sum(total_minor) FILTER (WHERE status <> 'cancelled' AND paid_method = 'wallet'), 0) AS wallet
    FROM o GROUP BY day ORDER BY day`;

  return rows.map((r) => {
    const money = (v: bigint) => Number(v) / 100;
    const collected = money(r.cash + r.upi + r.card + r.wallet);
    return {
      date: r.day.toISOString().slice(0, 10),
      orders: r.orders,
      cancelled: r.cancelled,
      parcels: r.parcels,
      subtotal: money(r.subtotal),
      tax: money(r.tax),
      serviceCharge: money(r.service),
      discount: money(r.discount),
      revenue: money(r.revenue),
      collected,
      cash: money(r.cash),
      upi: money(r.upi),
      card: money(r.card),
      wallet: money(r.wallet),
      unpaid: Math.round((money(r.revenue) - collected) * 100) / 100,
    };
  });
}

export interface DishReportRow {
  dish: string;
  category: string;
  quantity: number;
  orders: number;
  revenue: number;
}

/** What sold, best first. The dish name includes the plate size, as printed on the ticket. Cancelled orders are left out. */
export async function dishRows(scope: Scope): Promise<DishReportRow[]> {
  const { start, end } = await bounds(scope);
  const rows = await prisma.$queryRaw<{ dish: string; category: string | null; quantity: number; orders: number; revenue: bigint }[]>`
    SELECT i.name_snapshot AS dish, cat.name AS category, sum(i.quantity)::int AS quantity,
           count(DISTINCT i.order_id)::int AS orders, sum(i.line_total_minor) AS revenue
    FROM order_items i
    JOIN orders o ON o.id = i.order_id AND o.created_at = i.created_at AND o.restaurant_id = i.restaurant_id
    LEFT JOIN menu_items m ON m.restaurant_id = i.restaurant_id AND m.id = i.menu_item_id
    LEFT JOIN menu_categories cat ON cat.restaurant_id = m.restaurant_id AND cat.id = m.category_id
    WHERE i.restaurant_id = ${scope.restaurantId}::uuid AND o.status <> 'cancelled'
      AND i.created_at >= ${start} AND i.created_at < ${end}
    GROUP BY i.name_snapshot, cat.name
    ORDER BY revenue DESC, quantity DESC`;
  return rows.map((r) => ({
    dish: r.dish,
    category: r.category ?? '',
    quantity: r.quantity,
    orders: r.orders,
    revenue: Number(r.revenue) / 100,
  }));
}

/** Headline numbers for the reports screen, built from the same rows the downloads use. */
export async function reportSummary(scope: Scope) {
  const [daily, dishes] = await Promise.all([dailyRows(scope), dishRows(scope)]);
  const sum = (pick: (d: DailyReportRow) => number) => Math.round(daily.reduce((s, d) => s + pick(d), 0) * 100) / 100;
  const orders = sum((d) => d.orders);
  const revenue = sum((d) => d.revenue);
  return {
    totals: {
      orders,
      cancelled: sum((d) => d.cancelled),
      parcels: sum((d) => d.parcels),
      revenue,
      avgOrderValue: orders ? Math.round((revenue / orders) * 100) / 100 : 0,
      subtotal: sum((d) => d.subtotal),
      tax: sum((d) => d.tax),
      serviceCharge: sum((d) => d.serviceCharge),
      discount: sum((d) => d.discount),
      collected: sum((d) => d.collected),
      unpaid: sum((d) => d.unpaid),
    },
    payments: { cash: sum((d) => d.cash), upi: sum((d) => d.upi), card: sum((d) => d.card), wallet: sum((d) => d.wallet) },
    days: daily.map((d) => ({ date: d.date, orders: d.orders, revenue: d.revenue })),
    topDishes: dishes.slice(0, 5),
  };
}
export type ReportSummary = Awaited<ReturnType<typeof reportSummary>>;
