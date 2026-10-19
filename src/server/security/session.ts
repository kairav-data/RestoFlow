import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { HttpError } from '../http';

const isProd = process.env.NODE_ENV === 'production';

export type SessionKind = 'staff' | 'customer';

interface Payload {
  k: SessionKind;
  /** staff_users.id or customers.id */
  sub: string;
  /** restaurants.id for staff sessions */
  rid?: string;
  exp: number;
}

const COOKIE: Record<SessionKind, string> = { staff: 'rf_staff', customer: 'rf_customer' };
const TTL: Record<SessionKind, number> = { staff: 12 * 3600, customer: 30 * 24 * 3600 };

function secret(): string {
  const s = process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set.');
  return s;
}

const sign = (body: string) => crypto.createHmac('sha256', secret()).update(body).digest('base64url');

function encode(payload: Payload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

function decode(token: string | undefined, kind: SessionKind): Payload | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Payload;
    return payload.k === kind && payload.exp > Date.now() / 1000 ? payload : null;
  } catch {
    return null;
  }
}

export function startSession(kind: SessionKind, sub: string, rid?: string) {
  cookies().set(COOKIE[kind], encode({ k: kind, sub, rid, exp: Math.floor(Date.now() / 1000) + TTL[kind] }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: TTL[kind],
  });
}

export function endSession(kind: SessionKind) {
  cookies().set(COOKIE[kind], '', { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 0 });
}

export function readSession(kind: SessionKind): Payload | null {
  return decode(cookies().get(COOKIE[kind])?.value, kind);
}

/** The signed-in restaurant staff member. The restaurant id comes from here, never from the request. */
export function requireStaffSession(): { staffId: string; restaurantId: string } {
  const s = readSession('staff');
  if (!s?.rid) throw new HttpError(401, 'Please sign in again.');
  return { staffId: s.sub, restaurantId: s.rid };
}

export function requireCustomerSession(): { customerId: string } {
  const s = readSession('customer');
  if (!s) throw new HttpError(401, 'Please sign in to continue.');
  return { customerId: s.sub };
}
