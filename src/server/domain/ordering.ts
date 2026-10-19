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

/**
 * Creates an order for a signed-in guest. Prices, availability and totals are always taken from the database:
 * the client only says which dishes, how many, and which plate size.
 */
export async function placeOrder(restaurantId: string, customerId: string, input: PlaceOrderInput) {
  const restaurant = await prisma.restaurant.findFirst({ where: { id: restaurantId, status: 'active' } });
  if (!restaurant) throw new HttpError(404, 'Restaurant not found.');

  const table = await prisma.diningTable.findFirst({
    where: { restaurantId, name: { equals: input.tableName, mode: 'insensitive' }, isActive: true },
  });
  if (!table) throw new HttpError(404, 'This table is not set up for ordering. Please ask the staff.');

  // Merge repeated lines of the same dish and size.
  const lines = new Map<string, PlaceOrderInput['items'][number]>();
  for (const line of input.items) {
    const key = `${line.menuItemId}:${line.portion}`;
    const prev = lines.get(key);
    lines.set(key, prev ? { ...prev, quantity: Math.min(20, prev.quantity + line.quantity) } : line);
  }

  const dishes = await prisma.menuItem.findMany({
    where: { restaurantId, id: { in: [...new Set(input.items.map((i) => i.menuItemId))] } },
  });
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
      menuItemId: dish.id,
      name: `${dish.name}${label}`,
      unit,
      quantity: line.quantity,
      portion: dish.halfPriceMinor ? line.portion : null,
      notes: line.notes ?? null,
    };
  });

  const { taxPercent, servicePercent } = chargeRates(restaurant.settings);
  const subtotal = orderLines.reduce((sum, l) => sum + l.unit * l.quantity, 0);
  const tax = Math.round((subtotal * taxPercent) / 100);
  const service = Math.round((subtotal * servicePercent) / 100);
  const total = subtotal + tax + service;
  const now = new Date();

  const orderId = await prisma.$transaction(async (tx) => {
    // Re-use the guest's open session at this table, otherwise start a new visit.
    let session = await tx.guestSession.findFirst({
      where: {
        restaurantId,
        tableId: table.id,
        customerId,
        status: 'active',
        startedAt: { gte: new Date(now.getTime() - SESSION_REUSE_MS) },
      },
      orderBy: { startedAt: 'desc' },
    });
    if (!session) {
      session = await tx.guestSession.create({
        data: { restaurantId, branchId: table.branchId, tableId: table.id, customerId },
      });
      await tx.restaurantCustomer.upsert({
        where: { restaurantId_customerId: { restaurantId, customerId } },
        create: { restaurantId, customerId, firstVisitAt: now, lastVisitAt: now, visitCount: 1 },
        update: { lastVisitAt: now, visitCount: { increment: 1 } },
      });
    }

    // Ticket numbers are per branch per day; the advisory lock stops two simultaneous orders taking the same number.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${table.branchId}::text))`;
    const next = await tx.$queryRaw<{ n: number }[]>`
      SELECT COALESCE(MAX(order_number), 0)::int + 1 AS n FROM orders
      WHERE restaurant_id = ${restaurantId}::uuid AND branch_id = ${table.branchId}::uuid
        AND created_at >= (date_trunc('day', now() AT TIME ZONE ${restaurant.timezone}) AT TIME ZONE ${restaurant.timezone})`;

    const order = await tx.order.create({
      data: {
        restaurantId,
        branchId: table.branchId,
        tableId: table.id,
        sessionId: session.id,
        customerId,
        orderNumber: next[0].n,
        orderType: 'qr_online',
        subtotalMinor: subtotal,
        taxMinor: tax,
        serviceChargeMinor: service,
        totalMinor: total,
        notes: input.notes ?? null,
        createdAt: now,
      },
    });
    const itemIds = orderLines.map(() => crypto.randomUUID());
    await tx.orderItem.createMany({
      data: orderLines.map((l, n) => ({
        id: itemIds[n],
        orderId: order.id,
        restaurantId,
        menuItemId: l.menuItemId,
        nameSnapshot: l.name,
        unitPriceMinor: l.unit,
        quantity: l.quantity,
        lineTotalMinor: l.unit * l.quantity,
        portion: l.portion,
        notes: l.notes,
        createdAt: now,
      })),
    });

    // The guest's dish history: one row per dish, linked to their customer ID, so "what did they eat" is a single lookup.
    const guest = await tx.customer.findUniqueOrThrow({ where: { id: customerId }, select: { customerCode: true } });
    await tx.customerDishHistory.createMany({
      data: orderLines.map((l, n) => ({
        customerId,
        customerCode: guest.customerCode,
        restaurantId,
        branchId: table.branchId,
        sessionId: session.id,
        orderId: order.id,
        orderItemId: itemIds[n],
        orderNumber: order.orderNumber,
        tableName: table.name,
        menuItemId: l.menuItemId,
        dishName: l.name,
        portion: l.portion,
        quantity: l.quantity,
        unitPriceMinor: l.unit,
        lineTotalMinor: l.unit * l.quantity,
        orderedAt: now,
      })),
    });
    return order.id;
  });

  return orderId;
}
