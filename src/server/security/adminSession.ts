import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'rf_admin';
const TTL_SECONDS = 8 * 60 * 60;
const isProd = process.env.NODE_ENV === 'production';

export function adminCredentials(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) return { email: email.trim().toLowerCase(), password };
  return null;
}

function sessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || null;
}

const sign = (secret: string, payload: string) =>
  crypto.createHmac('sha256', secret).update(payload).digest('base64url');

/** Constant-time comparison that does not leak length. */
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function createSessionToken(): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const expires = String(Math.floor(Date.now() / 1000) + TTL_SECONDS);
  return `${expires}.${sign(secret, expires)}`;
}

function verifyToken(token: string | undefined): boolean {
  const secret = sessionSecret();
  if (!secret || !token) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  return safeEqual(signature, sign(secret, expires));
}

/** True when the current request carries a valid admin session cookie. */
export function isAdminRequest(): boolean {
  return verifyToken(cookies().get(ADMIN_COOKIE)?.value);
}

export const sessionCookie = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: isProd,
  path: '/',
  maxAge: TTL_SECONDS,
};
