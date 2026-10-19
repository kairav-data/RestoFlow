import 'server-only';
import type { Order, OrderItem, OrderStatus as ClientStatus, OrderType as ClientType } from '@/types';
import { prisma } from '../db';
import { fromMinor } from './money';
import { FALLBACK_DISH } from './restaurants';

const TYPE_TO_CLIENT: Record<string, ClientType> = { dine_in: 'dine-in', takeaway: 'takeaway', qr_online: 'qr-online' };

type OrderWhere = {
  restaurantId: string;
  customerId?: string;
  id?: string;
  status?: { in: ClientStatus[] };
  createdAt?: { gte?: Date };
};

/**
 * Loads orders with their items, table name, customer and latest payment. The caller supplies a `where`
 * that is already scoped to one restaurant (and optionally one customer).
 */
export async function loadOrders(where: OrderWhere, take = 100): Promise<Order[]> {
  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, take });
  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const tableIds = [...new Set(orders.map((o) => o.tableId).filter((v): v is string => !!v))];
  const customerIds = [...new Set(orders.map((o) => o.customerId).filter((v): v is string => !!v))];
  const oldest = orders[orders.length - 1].createdAt;

  const [items, tables, customers, payments, menuItems] = await Promise.all([
    prisma.orderItem.findMany({
      where: { restaurantId: where.restaurantId, orderId: { in: orderIds }, createdAt: { gte: oldest } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.diningTable.findMany({ where: { restaurantId: where.restaurantId, id: { in: tableIds } } }),
    prisma.customer.findMany({ where: { id: { in: customerIds } }, select: { id: true, name: true, phone: true } }),
    prisma.payment.findMany({
      where: { restaurantId: where.restaurantId, orderId: { in: orderIds } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.menuItem.findMany({
      where: { restaurantId: where.restaurantId },
      select: { id: true, imageUrl: true, isVegetarian: true },
    }),
  ]);

  const tableName = new Map(tables.map((t) => [t.id, t.name]));
  const customerById = new Map(customers.map((c) => [c.id, c]));
  const dish = new Map(menuItems.map((m) => [m.id, m]));
  const latestPayment = new Map<string, (typeof payments)[number]>();
  for (const p of payments) if (!latestPayment.has(p.orderId)) latestPayment.set(p.orderId, p);

  return orders.map((o) => {
    const customer = o.customerId ? customerById.get(o.customerId) : undefined;
    const payment = latestPayment.get(o.id);
    const orderItems: OrderItem[] = items
      .filter((i) => i.orderId === o.id)
      .map((i) => ({
        id: i.id,
        menuItemId: i.menuItemId,
        name: i.nameSnapshot,
        price: fromMinor(i.unitPriceMinor),
        quantity: i.quantity,
        image: dish.get(i.menuItemId)?.imageUrl || FALLBACK_DISH,
        isVegetarian: dish.get(i.menuItemId)?.isVegetarian ?? true,
        portion: (i.portion as 'half' | 'full' | null) ?? undefined,
        specialInstructions: i.notes ?? undefined,
      }));
    return {
      id: o.id,
      orderNumber: `#${o.orderNumber}`,
      tableNumber: o.tableId ? tableName.get(o.tableId) ?? '' : '',
      customerName: customer?.name,
      customerPhone: customer?.phone,
      orderType: TYPE_TO_CLIENT[o.orderType] ?? 'dine-in',
      items: orderItems,
      subtotal: fromMinor(o.subtotalMinor),
      taxes: fromMinor(o.taxMinor),
      serviceCharge: fromMinor(o.serviceChargeMinor),
      discount: fromMinor(o.discountMinor),
      total: fromMinor(o.totalMinor),
      status: o.status as ClientStatus,
      createdAt: o.createdAt.toISOString(),
      estimatedReadyMinutes: 15,
      diningSessionId: o.sessionId ?? '',
      paymentStatus: payment ? (payment.status === 'paid' ? 'paid' : 'pending') : 'none',
      paymentMethod: payment?.method,
    } satisfies Order;
  });
}
