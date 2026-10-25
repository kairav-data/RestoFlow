import 'server-only';
import { Prisma } from '@prisma/client';
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

interface Row {
  id: string;
  order_number: number;
  order_type: string;
  status: string;
  subtotal_minor: number;
  tax_minor: number;
  service_charge_minor: number;
  discount_minor: number;
  total_minor: number;
  created_at: Date;
  session_id: string | null;
  is_parcel: boolean;
  guest_name: string | null;
  staff_name: string | null;
  table_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
  pay_status: string | null;
  pay_method: string | null;
  items: {
    id: string;
    menuItemId: string;
    name: string;
    unit: number;
    qty: number;
    portion: string | null;
    notes: string | null;
    image: string | null;
    veg: boolean | null;
  }[];
}

/**
 * Loads orders with their items, table name, customer and latest payment in ONE database round trip.
 * The caller supplies a `where` that is already scoped to one restaurant (and optionally one customer).
 */
export async function loadOrders(where: OrderWhere, take = 100): Promise<Order[]> {
  const filters: Prisma.Sql[] = [Prisma.sql`o.restaurant_id = ${where.restaurantId}::uuid`];
  if (where.customerId) filters.push(Prisma.sql`o.customer_id = ${where.customerId}::uuid`);
  if (where.id) filters.push(Prisma.sql`o.id = ${where.id}::uuid`);
  if (where.status) filters.push(Prisma.sql`o.status::text = ANY(${where.status.in})`);
  if (where.createdAt?.gte) filters.push(Prisma.sql`o.created_at >= ${where.createdAt.gte}`);

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT o.id, o.order_number, o.order_type::text AS order_type, o.status::text AS status,
           o.subtotal_minor, o.tax_minor, o.service_charge_minor, o.discount_minor, o.total_minor,
           o.created_at, o.session_id, o.is_parcel, o.guest_name, s.full_name AS staff_name,
           t.name AS table_name, c.name AS customer_name, c.email AS customer_email,
           pay.status::text AS pay_status, pay.method::text AS pay_method,
           COALESCE((
             SELECT json_agg(json_build_object(
                      'id', i.id, 'menuItemId', i.menu_item_id, 'name', i.name_snapshot, 'unit', i.unit_price_minor,
                      'qty', i.quantity, 'portion', i.portion, 'notes', i.notes, 'image', m.image_url, 'veg', m.is_vegetarian)
                    ORDER BY i.name_snapshot)
             FROM order_items i
             LEFT JOIN menu_items m ON m.restaurant_id = i.restaurant_id AND m.id = i.menu_item_id
             WHERE i.order_id = o.id AND i.created_at = o.created_at AND i.restaurant_id = o.restaurant_id
           ), '[]'::json) AS items
    FROM orders o
    LEFT JOIN dining_tables t ON t.restaurant_id = o.restaurant_id AND t.id = o.table_id
    LEFT JOIN customers c ON c.id = o.customer_id
    LEFT JOIN staff_users s ON s.restaurant_id = o.restaurant_id AND s.id = o.placed_by_staff_id
    LEFT JOIN LATERAL (
      SELECT p.status, p.method FROM payments p
      WHERE p.restaurant_id = o.restaurant_id AND p.order_id = o.id
      ORDER BY p.created_at DESC LIMIT 1
    ) pay ON true
    WHERE ${Prisma.join(filters, ' AND ')}
    ORDER BY o.created_at DESC
    LIMIT ${take}`;

  return rows.map((o) => {
    const items: OrderItem[] = o.items.map((i) => ({
      id: i.id,
      menuItemId: i.menuItemId,
      name: i.name,
      price: fromMinor(i.unit),
      quantity: i.qty,
      image: i.image || FALLBACK_DISH,
      isVegetarian: i.veg ?? true,
      portion: (i.portion as 'half' | 'full' | null) ?? undefined,
      specialInstructions: i.notes ?? undefined,
    }));
    return {
      id: o.id,
      orderNumber: `#${o.order_number}`,
      tableNumber: o.table_name ?? '',
      customerName: o.customer_name ?? o.guest_name ?? undefined,
      customerEmail: o.customer_email ?? undefined,
      orderType: TYPE_TO_CLIENT[o.order_type] ?? 'dine-in',
      isParcel: o.is_parcel,
      placedByStaff: o.staff_name ?? undefined,
      items,
      subtotal: fromMinor(o.subtotal_minor),
      taxes: fromMinor(o.tax_minor),
      serviceCharge: fromMinor(o.service_charge_minor),
      discount: fromMinor(o.discount_minor),
      total: fromMinor(o.total_minor),
      status: o.status as ClientStatus,
      createdAt: o.created_at.toISOString(),
      estimatedReadyMinutes: 15,
      diningSessionId: o.session_id ?? '',
      paymentStatus: o.pay_status ? (o.pay_status === 'paid' ? 'paid' : 'pending') : 'none',
      paymentMethod: (o.pay_method as Order['paymentMethod']) ?? undefined,
    } satisfies Order;
  });
}
