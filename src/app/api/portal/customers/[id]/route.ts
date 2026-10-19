import { HttpError, json, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';
import { loadCustomerHistory } from '@/server/domain/customerHistory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

/** One guest's profile and dish history at this restaurant. The restaurant comes from the session, never the request. */
export const GET = route<{ params: { id: string } }>(async (_request, { params }) => {
  const { restaurantId } = requireStaffSession();
  if (!isUuid(params.id)) throw new HttpError(404, 'Customer not found.');
  const history = await loadCustomerHistory(restaurantId, params.id);
  if (!history) throw new HttpError(404, 'Customer not found.');
  return json(history);
});
