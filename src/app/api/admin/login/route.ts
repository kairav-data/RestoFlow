import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ADMIN_COOKIE,
  adminCredentials,
  createSessionToken,
  safeEqual,
  sessionCookie,
} from '@/server/security/adminSession';

export const runtime = 'nodejs';

const bodySchema = z.object({ email: z.string().max(200), password: z.string().max(200) });

const attempts = new Map<string, number[]>();
function tooManyAttempts(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 5;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (tooManyAttempts(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Wait a minute and try again.' }, { status: 429 });
  }

  const creds = adminCredentials();
  const token = createSessionToken();
  if (!creds || !token) {
    return NextResponse.json(
      { error: 'Admin sign-in is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_SESSION_SECRET.' },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  const valid =
    parsed.success &&
    safeEqual(parsed.data.email.trim().toLowerCase(), creds.email) &&
    safeEqual(parsed.data.password, creds.password);
  if (!valid) {
    return NextResponse.json({ error: 'Those details do not match a RestoFlow administrator.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, sessionCookie);
  return res;
}
