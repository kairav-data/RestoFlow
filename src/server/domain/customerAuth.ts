import 'server-only';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../db';
import { HttpError } from '../http';
import { sendSms } from '../sms';

const OTP_TTL_MS = 5 * 60_000;
const MAX_ATTEMPTS = 5;
const MAX_CODES_PER_WINDOW = 3;
const WINDOW_MS = 10 * 60_000;

/** Accepts "98765 43210", "+91 98765 43210" etc. and returns E.164, or null when it cannot be one. */
export function normalizePhone(raw: string): string | null {
  const compact = raw.replace(/[\s()-]/g, '');
  const defaultCode = process.env.DEFAULT_COUNTRY_CODE || '+91';
  const candidate = compact.startsWith('+')
    ? compact
    : compact.startsWith('00')
      ? `+${compact.slice(2)}`
      : /^\d{10}$/.test(compact)
        ? `${defaultCode}${compact}`
        : `+${compact}`;
  return /^\+[1-9][0-9]{7,14}$/.test(candidate) ? candidate : null;
}

export const phoneSchema = z
  .string()
  .max(24)
  .transform((v, ctx) => {
    const phone = normalizePhone(v);
    if (!phone) ctx.addIssue({ code: 'custom', message: 'Enter a valid mobile number.' });
    return phone ?? '';
  });

const hashCode = (phone: string, code: string) =>
  crypto
    .createHash('sha256')
    .update(`${phone}:${code}:${process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || ''}`)
    .digest('hex');

/** Creates a six-digit code for the phone and texts it. Limits how many codes one number can request. */
export async function issueOtp(phone: string): Promise<{ devCode?: string }> {
  const since = new Date(Date.now() - WINDOW_MS);
  const recent = await prisma.otpCode.count({ where: { phone, createdAt: { gte: since } } });
  if (recent >= MAX_CODES_PER_WINDOW) {
    throw new HttpError(429, 'Too many codes requested. Please wait a few minutes and try again.');
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  await prisma.otpCode.create({
    data: { phone, codeHash: hashCode(phone, code), expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });
  const { logged } = await sendSms(phone, `${code} is your RestoFlow verification code. It expires in 5 minutes.`);
  // Only ever exposed when SMS is not configured and the server is not in production.
  return logged ? { devCode: code } : {};
}

/** Checks a code and burns it on success; throws a user-safe error otherwise. */
export async function consumeOtp(phone: string, code: string): Promise<void> {
  const otp = await prisma.otpCode.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp || otp.attempts >= MAX_ATTEMPTS) {
    throw new HttpError(400, 'That code has expired. Request a new one.');
  }
  const expected = Buffer.from(otp.codeHash);
  const given = Buffer.from(hashCode(phone, code));
  const ok = expected.length === given.length && crypto.timingSafeEqual(expected, given);
  if (!ok) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw new HttpError(400, 'That code is not correct.');
  }
  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
}
