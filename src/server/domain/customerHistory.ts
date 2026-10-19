import 'server-only';
import { prisma } from '../db';

interface HistoryRow {
  order_id: string;
  order_number: number;
  session_id: string | null;
  table_name: string | null;
  dish_name: string;
  menu_item_id: string;
  portion: string | null;
  quantity: number;
  line_total_minor: number;
  ordered_at: Date;
  status: string;
  paid: boolean;
}

/**
 * Everything one guest has ordered at one restaurant, grouped into visits (a visit is one sitting at a table).
 * Returns null unless the guest has actually visited this restaurant, so ids from other restaurants reveal nothing.
 */
export async function loadCustomerHistory(restaurantId: string, customerId: string) {
  const link = await prisma.restaurantCustomer.findUnique({
    where: { restaurantId_customerId: { restaurantId, customerId } },
  });
  if (!link) return null;
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) return null;

  const rows = await prisma.$queryRaw<HistoryRow[]>`
    SELECT h.order_id, h.order_number, h.session_id, h.table_name, h.dish_name, h.menu_item_id, h.portion, h.quantity,
           h.line_total_minor, h.ordered_at, o.status::text AS status,
           EXISTS (SELECT 1 FROM payments p WHERE p.restaurant_id = o.restaurant_id AND p.order_id = o.id
                   AND p.status = 'paid') AS paid
    FROM customer_dish_history h
    JOIN orders o ON o.id = h.order_id AND o.created_at = h.ordered_at AND o.restaurant_id = h.restaurant_id
    WHERE h.restaurant_id = ${restaurantId}::uuid AND h.customer_id = ${customerId}::uuid
    ORDER BY h.ordered_at DESC, h.dish_name
    LIMIT 2000`;

  // Group dish rows into orders, then orders into visits.
  const orders = new Map<string, {
    id: string; orderNumber: number; sessionId: string | null; tableName: string | null; orderedAt: string;
    status: string; paid: boolean; total: number; items: { name: string; quantity: number; portion: string | null; total: number }[];
  }>();
  for (const r of rows) {
    let order = orders.get(r.order_id);
    if (!order) {
      order = {
        id: r.order_id, orderNumber: r.order_number, sessionId: r.session_id, tableName: r.table_name,
        orderedAt: r.ordered_at.toISOString(), status: r.status, paid: r.paid, total: 0, items: [],
      };
      orders.set(r.order_id, order);
    }
    order.total += r.line_total_minor / 100;
    order.items.push({ name: r.dish_name, quantity: r.quantity, portion: r.portion, total: r.line_total_minor / 100 });
  }

  const visits = new Map<string, { id: string; startedAt: string; tableName: string | null; orders: typeof orderList; spent: number }>();
  const orderList = [...orders.values()];
  for (const order of orderList) {
    const key = order.sessionId ?? order.id;
    let visit = visits.get(key);
    if (!visit) {
      visit = { id: key, startedAt: order.orderedAt, tableName: order.tableName, orders: [], spent: 0 };
      visits.set(key, visit);
    }
    visit.orders.push(order);
    if (order.orderedAt < visit.startedAt) visit.startedAt = order.orderedAt;
    if (order.status !== 'cancelled') visit.spent += order.total;
  }

  // Favourites exclude cancelled orders.
  const cancelled = new Set(orderList.filter((o) => o.status === 'cancelled').map((o) => o.id));
  const dishes = new Map<string, { menuItemId: string; name: string; times: number; lastOrderedAt: string }>();
  for (const r of rows) {
    if (cancelled.has(r.order_id)) continue;
    const name = r.dish_name.replace(/ \((Half|Full) plate\)$/, '');
    const d = dishes.get(r.menu_item_id);
    if (d) d.times += r.quantity;
    else dishes.set(r.menu_item_id, { menuItemId: r.menu_item_id, name, times: r.quantity, lastOrderedAt: r.ordered_at.toISOString() });
  }

  const validOrders = orderList.filter((o) => o.status !== 'cancelled');
  return {
    customer: {
      id: customer.id,
      customerCode: customer.customerCode,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      memberSince: customer.createdAt.toISOString(),
    },
    stats: {
      visits: link.visitCount,
      orders: validOrders.length,
      totalSpent: Number(link.totalSpentMinor) / 100,
      averageOrder: validOrders.length ? validOrders.reduce((s, o) => s + o.total, 0) / validOrders.length : 0,
      firstVisitAt: link.firstVisitAt.toISOString(),
      lastVisitAt: link.lastVisitAt.toISOString(),
    },
    favourites: [...dishes.values()].sort((a, b) => b.times - a.times).slice(0, 5),
    visits: [...visits.values()].sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)),
  };
}
