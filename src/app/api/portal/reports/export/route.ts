import { z } from 'zod';
import { HttpError, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';
import { isRateLimited } from '@/server/security/rateLimit';
import { csvResponse, toCsv, type CsvColumn } from '@/server/csv';
import {
  REPORT_KINDS,
  dailyRows,
  dishRows,
  orderRows,
  reportRangeSchema,
  requireReportAccess,
  type DailyReportRow,
  type DishReportRow,
  type OrderReportRow,
} from '@/server/domain/reports';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ORDER_COLUMNS: CsvColumn<OrderReportRow>[] = [
  { header: 'Date', value: (r) => r.date },
  { header: 'Time', value: (r) => r.time },
  { header: 'Order #', value: (r) => r.orderNumber },
  { header: 'Source', value: (r) => r.source },
  { header: 'Parcel', value: (r) => r.parcel },
  { header: 'Table', value: (r) => r.table },
  { header: 'Guest', value: (r) => r.guest },
  { header: 'Items', value: (r) => r.items },
  { header: 'Item count', value: (r) => r.itemCount },
  { header: 'Subtotal', value: (r) => r.subtotal },
  { header: 'Tax', value: (r) => r.tax },
  { header: 'Service charge', value: (r) => r.serviceCharge },
  { header: 'Discount', value: (r) => r.discount },
  { header: 'Total', value: (r) => r.total },
  { header: 'Status', value: (r) => r.status },
  { header: 'Payment', value: (r) => r.paymentStatus },
  { header: 'Payment method', value: (r) => r.paymentMethod },
  { header: 'Entered by staff', value: (r) => r.placedBy },
];

const DAILY_COLUMNS: CsvColumn<DailyReportRow>[] = [
  { header: 'Date', value: (r) => r.date },
  { header: 'Orders', value: (r) => r.orders },
  { header: 'Cancelled', value: (r) => r.cancelled },
  { header: 'Parcels', value: (r) => r.parcels },
  { header: 'Subtotal', value: (r) => r.subtotal },
  { header: 'Tax', value: (r) => r.tax },
  { header: 'Service charge', value: (r) => r.serviceCharge },
  { header: 'Discount', value: (r) => r.discount },
  { header: 'Revenue', value: (r) => r.revenue },
  { header: 'Collected', value: (r) => r.collected },
  { header: 'Cash', value: (r) => r.cash },
  { header: 'UPI', value: (r) => r.upi },
  { header: 'Card', value: (r) => r.card },
  { header: 'Wallet', value: (r) => r.wallet },
  { header: 'Unpaid', value: (r) => r.unpaid },
];

const DISH_COLUMNS: CsvColumn<DishReportRow>[] = [
  { header: 'Dish', value: (r) => r.dish },
  { header: 'Category', value: (r) => r.category },
  { header: 'Quantity sold', value: (r) => r.quantity },
  { header: 'Orders', value: (r) => r.orders },
  { header: 'Revenue', value: (r) => r.revenue },
];

/** Downloads one report as CSV: order details, daily revenue, or dish sales. */
export const GET = route(async (request) => {
  const { staffId, restaurantId } = requireStaffSession();
  if (isRateLimited(`report:${staffId}`, request, 30)) {
    throw new HttpError(429, 'Too many downloads in a short time. Please wait a moment.');
  }
  const params = new URL(request.url).searchParams;
  const kind = z.enum(REPORT_KINDS).parse(params.get('kind'));
  const range = reportRangeSchema.parse({ from: params.get('from'), to: params.get('to') });
  const restaurant = await requireReportAccess(staffId, restaurantId);
  const scope = { restaurantId, timezone: restaurant.timezone, range };
  const name = `${restaurant.slug}-${kind}-${range.from}_to_${range.to}.csv`;

  if (kind === 'orders') return csvResponse(toCsv(await orderRows(scope), ORDER_COLUMNS), name);
  if (kind === 'daily') return csvResponse(toCsv(await dailyRows(scope), DAILY_COLUMNS), name);
  return csvResponse(toCsv(await dishRows(scope), DISH_COLUMNS), name);
});
