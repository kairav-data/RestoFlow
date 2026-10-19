import { z } from 'zod';
import { HttpError, json, readJson, route } from '@/server/http';
import { issueOtp, phoneSchema } from '@/server/domain/customerAuth';
import { isRateLimited } from '@/server/security/rateLimit';

export const runtime = 'nodejs';

export const POST = route(async (request) => {
  if (isRateLimited('otp-request', request, 10, 10 * 60_000)) {
    throw new HttpError(429, 'Too many attempts. Try again later.');
  }
  const { phone } = z.object({ phone: phoneSchema }).parse(await readJson(request));
  const result = await issueOtp(phone);
  return json({ ok: true, phone, ...result });
});
