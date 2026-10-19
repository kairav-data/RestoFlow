import { prisma } from '@/server/db';
import { json, route } from '@/server/http';
import { readSession } from '@/server/security/session';
import { toClientRestaurant } from '@/server/domain/restaurants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** The signed-in staff member and their restaurant (with menu). Returns nulls when not signed in. */
export const GET = route(async () => {
  const session = readSession('staff');
  if (!session?.rid) return json({ staff: null, restaurant: null });

  const [staff, restaurant] = await Promise.all([
    prisma.staffUser.findFirst({ where: { id: session.sub, restaurantId: session.rid, status: 'active' } }),
    prisma.restaurant.findFirst({ where: { id: session.rid, status: 'active' } }),
  ]);
  if (!staff || !restaurant) return json({ staff: null, restaurant: null });

  return json({
    staff: { id: staff.id, name: staff.fullName, role: staff.role, email: staff.email },
    restaurant: await toClientRestaurant(restaurant, true),
  });
});
