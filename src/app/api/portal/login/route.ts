import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { HttpError, json, readJson, route } from '@/server/http';
import { startSession } from '@/server/security/session';
import { isRateLimited } from '@/server/security/rateLimit';

export const runtime = 'nodejs';

const body = z.object({
  slug: z.string().trim().toLowerCase().max(60),
  email: z.string().trim().max(200),
  password: z.string().min(1).max(200),
});

// Compared against when the account does not exist, so response time does not reveal which emails are valid.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

export const POST = route(async (request) => {
  if (isRateLimited('portal-login', request, 10, 10 * 60_000)) {
    throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
  }
  const { slug, email, password } = body.parse(await readJson(request));

  const restaurant = await prisma.restaurant.findFirst({ where: { slug, status: 'active' } });
  const staff = restaurant
    ? await prisma.staffUser.findFirst({
        where: { restaurantId: restaurant.id, email: { equals: email, mode: 'insensitive' }, status: 'active' },
      })
    : null;

  const valid = await bcrypt.compare(password, staff?.passwordHash ?? DUMMY_HASH);
  if (!restaurant || !staff || !valid) {
    throw new HttpError(401, `Those details do not match ${restaurant?.name ?? 'this restaurant'}. Check the email and password.`);
  }

  await prisma.staffUser.update({ where: { id: staff.id }, data: { lastLoginAt: new Date() } });
  startSession('staff', staff.id, restaurant.id);
  return json({ ok: true });
});
