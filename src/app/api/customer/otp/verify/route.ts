import { z } from 'zod';
import { prisma } from '@/server/db';
import { HttpError, json, readJson, route } from '@/server/http';
import { consumeOtp, emailSchema } from '@/server/domain/customerAuth';
import { startSession } from '@/server/security/session';
import { isRateLimited } from '@/server/security/rateLimit';

export const runtime = 'nodejs';

const body = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code.'),
  name: z.string().trim().min(2, 'Enter your name.').max(60).optional(),
});

export const POST = route(async (request) => {
  if (isRateLimited('otp-verify', request, 20, 10 * 60_000)) {
    throw new HttpError(429, 'Too many attempts. Try again later.');
  }
  const { email, code, name } = body.parse(await readJson(request));

  const existing = await prisma.customer.findUnique({ where: { email } });
  // A new guest must give a name; check before burning the code so they can retry with the same one.
  if (!existing && !name) throw new HttpError(422, 'NAME_REQUIRED');
  if (existing?.status === 'disabled') throw new HttpError(403, 'This account is disabled.');

  await consumeOtp(email, code);

  const now = new Date();
  const customer = existing
    ? await prisma.customer.update({
        where: { id: existing.id },
        data: { lastLoginAt: now, phoneVerifiedAt: existing.phoneVerifiedAt ?? now },
      })
    : await prisma.customer.create({ data: { email, name: name!, phoneVerifiedAt: now, lastLoginAt: now } });

  startSession('customer', customer.id);
  return json({ customer: { id: customer.id, name: customer.name, email: customer.email } });
});
