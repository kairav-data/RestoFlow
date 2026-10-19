import { json, route } from '@/server/http';
import { findActiveRestaurant, toClientRestaurant } from '@/server/domain/restaurants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { slug: string } };

/** Public restaurant profile. `?menu=1` also returns the menu, which is what guests see after scanning a QR. */
export const GET = route<Ctx>(async (request, { params }) => {
  const restaurant = await findActiveRestaurant(params.slug);
  const withMenu = new URL(request.url).searchParams.get('menu') === '1';
  return json({ restaurant: await toClientRestaurant(restaurant, withMenu) });
});
