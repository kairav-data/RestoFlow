import { prisma } from '@/server/db';
import { HttpError, json, route } from '@/server/http';
import { requireAdmin } from '@/server/security/adminGuard';

export const runtime = 'nodejs';

type Ctx = { params: { slug: string } };

/** Closing is reversible: the restaurant stops serving guests and staff can no longer sign in, but data stays. */
export const DELETE = route<Ctx>(async (_request, { params }) => {
  requireAdmin();
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: params.slug } });
  if (!restaurant) throw new HttpError(404, 'Restaurant not found.');
  await prisma.restaurant.update({ where: { id: restaurant.id }, data: { status: 'closed' } });
  return json({ ok: true });
});
