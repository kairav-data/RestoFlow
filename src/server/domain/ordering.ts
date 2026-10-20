import 'server-only';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../db';
import { HttpError } from '../http';
import { chargeRates } from './restaurants';

const SESSION_REUSE_MS = 6 * 3600_000;

export const placeOrderSchema = z.object({
  tableName: z.string().trim().min(1).max(24),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.number().int().min(1).max(20),
        portion: z.enum(['half', 'full']).default('full'),
        notes: z.string().trim().max(200).optional(),
      }),
    )
    .min(1, 'Your cart is empty.')
    .max(40),
  notes: z.string().trim().max(300).optional(),
});
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

type ActiveRestaurant = NonNullable<Awaited<ReturnType<typeof prisma.restaurant.findFirst>>>;

/**
 * Creates an order for a signed-in guest. Prices, availability and totals are always taken from the database:
 * the client only says which dishes, how many, and which plate size.
 *
 * Speed: one parallel read (table, dishes, guest), then ONE SQL statement that reuses or opens the visit,
 * counts the visit, allocates the ticket number, and writes the order, its items and the guest dish history.
 * A single statement is atomic, so there is no multi-step transaction to wait on.
 */
export async function placeOrder(restaurant: ActiveRestaurant, customerId: string, input: PlaceOrderInput) {
  const restaurantId = restaurant.id;

  const [table, dishes, guest] = await Promise.all([
    prisma.diningTable.findFirst({
      where: { restaurantId, name: { equals: input.tableName, mode: 'insensitive' }, isActive: true },
    }),
    prisma.menuItem.findMany({
      where: { restaurantId, id: { in: [...new Set(input.items.map((i) => i.menuItemId))] } },
    }),
    prisma.customer.findUniqueOrThrow({ where: { id: customerId }, select: { customerCode: true } }),
  ]);
  if (!table) throw new HttpError(404, 'This table is not set up for ordering. Please ask the staff.');

  // Merge repeated lines of the same dish and size.
  const lines = new Map<string, PlaceOrderInput['items'][number]>();
  for (const line of input.items) {
    const key = `${line.menuItemId}:${line.portion}`;
    const prev = lines.get(key);
    lines.set(key, prev ? { ...prev, quantity: Math.min(20, prev.quantity + line.quantity) } : line);
  }
  const dishById = new Map(dishes.map((d) => [d.id, d]));

  const orderLines = [...lines.values()].map((line) => {
    const dish = dishById.get(line.menuItemId);
    if (!dish) throw new HttpError(400, 'A dish in your cart is no longer on the menu.');
    if (!dish.isAvailable) throw new HttpError(409, `${dish.name} is not available right now. Please remove it and try again.`);
    if (line.portion === 'half' && !dish.halfPriceMinor) {
      throw new HttpError(400, `${dish.name} is not sold as a half plate.`);
    }
    const unit = line.portion === 'half' ? dish.halfPriceMinor! : dish.priceMinor;
    const label = dish.halfPriceMinor ? ` (${line.portion === 'half' ? 'Half' : 'Full'} plate)` : '';
    return {
      id: crypto.randomUUID(),
      menu_item_id: dish.id,
      name: `${dish.name}${label}`,
      unit,
      qty: line.quantity,
      portion: dish.halfPriceMinor ? line.portion : null,
      notes: line.notes ?? null,
    };
  });

  const { taxPercent, servicePercent } = chargeRates(restaurant.settings);
  const subtotal = orderLines.reduce((sum, l) => sum + l.unit * l.qty, 0);
  const tax = Math.round((subtotal * taxPercent) / 100);
  const service = Math.round((subtotal * servicePercent) / 100);
  const total = subtotal + tax + service;
  const now = new Date();
  const reuseSince = new Date(now.getTime() - SESSION_REUSE_MS);
  const itemsJson = JSON.stringify(orderLines);
  const notes = input.notes ?? null;

  const created = await prisma.$queryRaw<{ id: string }[]>`
    WITH
    reuse AS (
      SELECT id FROM guest_sessions
      WHERE restaurant_id = ${restaurantId}::uuid AND table_id = ${table.id}::uuid AND customer_id = ${customerId}::uuid
        AND status = 'active' AND started_at >= ${reuseSince}::timestamptz
      ORDER BY started_at DESC LIMIT 1
    ),
    fresh AS (
      INSERT INTO guest_sessions (restaurant_id, branch_id, table_id, customer_id, started_at)
      SELECT ${restaurantId}::uuid, ${table.branchId}::uuid, ${table.id}::uuid, ${customerId}::uuid, ${now}::timestamptz
      WHERE NOT EXISTS (SELECT 1 FROM reuse)
      RETURNING id
    ),
    sess AS (SELECT id FROM reuse UNION ALL SELECT id FROM fresh),
    visit AS (
      INSERT INTO restaurant_customers (restaurant_id, customer_id, first_visit_at, last_visit_at, visit_count)
      SELECT ${restaurantId}::uuid, ${customerId}::uuid, ${now}::timestamptz, ${now}::timestamptz, 1
      WHERE EXISTS (SELECT 1 FROM fresh)
      ON CONFLICT (restaurant_id, customer_id)
      DO UPDATE SET last_visit_at = EXCLUDED.last_visit_at, visit_count = restaurant_customers.visit_count + 1
      RETURNING 1
    ),
    ticket AS (
      INSERT INTO order_ticket_counters (branch_id, day, last_number)
      VALUES (
        ${table.branchId}::uuid,
        (${now}::timestamptz AT TIME ZONE ${restaurant.timezone}::text)::date,
        COALESCE((
          SELECT max(order_number) FROM orders
          WHERE restaurant_id = ${restaurantId}::uuid AND branch_id = ${table.branchId}::uuid
            AND created_at >= (date_trunc('day', ${now}::timestamptz AT TIME ZONE ${restaurant.timezone}::text) AT TIME ZONE ${restaurant.timezone}::text)
        ), 0) + 1
      )
      ON CONFLICT (branch_id, day) DO UPDATE SET last_number = order_ticket_counters.last_number + 1
      RETURNING last_number
    ),
    ord AS (
      INSERT INTO orders (restaurant_id, branch_id, table_id, session_id, customer_id, order_number, order_type,
                          subtotal_minor, tax_minor, service_charge_minor, total_minor, notes, created_at, updated_at)
      SELECT ${restaurantId}::uuid, ${table.branchId}::uuid, ${table.id}::uuid, (SELECT id FROM sess), ${customerId}::uuid,
             (SELECT last_number FROM ticket), 'qr_online', ${subtotal}::int, ${tax}::int, ${service}::int, ${total}::int,
             ${notes}::text, ${now}::timestamptz, ${now}::timestamptz
      RETURNING id, order_number
    ),
    items AS (
      INSERT INTO order_items (id, order_id, restaurant_id, menu_item_id, name_snapshot, unit_price_minor, quantity,
                               line_total_minor, portion, notes, created_at)
      SELECT l.id, (SELECT id FROM ord), ${restaurantId}::uuid, l.menu_item_id, l.name, l.unit, l.qty, l.unit * l.qty,
             l.portion, l.notes, ${now}::timestamptz
      FROM jsonb_to_recordset(${itemsJson}::jsonb)
           AS l(id uuid, menu_item_id uuid, name text, unit int, qty int, portion text, notes text)
      RETURNING 1
    ),
    history AS (
      INSERT INTO customer_dish_history (customer_id, customer_code, restaurant_id, branch_id, session_id, order_id,
                                         order_item_id, order_number, table_name, menu_item_id, dish_name, portion,
                                         quantity, unit_price_minor, line_total_minor, ordered_at)
      SELECT ${customerId}::uuid, ${guest.customerCode}::text, ${restaurantId}::uuid, ${table.branchId}::uuid, (SELECT id FROM sess),
             (SELECT id FROM ord), l.id, (SELECT order_number FROM ord), ${table.name}::text, l.menu_item_id, l.name, l.portion,
             l.qty, l.unit, l.unit * l.qty, ${now}::timestamptz
      FROM jsonb_to_recordset(${itemsJson}::jsonb)
           AS l(id uuid, menu_item_id uuid, name text, unit int, qty int, portion text, notes text)
      RETURNING 1
    )
    SELECT id FROM ord`;

  return created[0].id;
}
