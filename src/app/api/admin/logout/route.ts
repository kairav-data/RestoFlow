import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, sessionCookie } from '@/server/security/adminSession';

export const runtime = 'nodejs';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { ...sessionCookie, maxAge: 0 });
  return res;
}
