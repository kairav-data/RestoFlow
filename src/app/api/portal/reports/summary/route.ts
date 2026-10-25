import { json, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';
import { reportRangeSchema, reportSummary, requireReportAccess } from '@/server/domain/reports';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Headline revenue and order numbers for a date range (dates in the restaurant's timezone, both inclusive). */
export const GET = route(async (request) => {
  const { staffId, restaurantId } = requireStaffSession();
  const params = new URL(request.url).searchParams;
  const range = reportRangeSchema.parse({ from: params.get('from'), to: params.get('to') });
  const restaurant = await requireReportAccess(staffId, restaurantId);
  return json(await reportSummary({ restaurantId, timezone: restaurant.timezone, range }));
});
