import 'server-only';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../db';
import { HttpError } from '../http';
import { otpEmail, sendEmail } from '../email';

const OTP_TTL_MS = 5 * 60_000;
const MAX_ATTEMPTS = 5;
const MAX_CODES_PER_WINDOW = 3;
const WINDOW_MS = 10 * 60_000;

/** Guests are identified by a lower-case email address. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .pipe(z.email('Enter a valid email address.'));

const hashCode = (email: string, code: string) =>
  crypto
    .createHash('sha256')
    .update(`${email}:${code}:${process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || ''}`)
    .digest('hex');

/** Creates a six-digit code for the address and emails it. Limits how many codes one address can request. */
export async function issueOtp(email: string): Promise<{ devCode?: string }> {
  const since = new Date(Date.now() - WINDOW_MS);
  const recent = await prisma.otpCode.count({ where: { identifier: email, createdAt: { gte: since } } });
  if (recent >= MAX_CODES_PER_WINDOW) {
    throw new HttpError(429, 'Too many codes requested. Please wait a few minutes and try again.');
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  await prisma.otpCode.create({
    data: { identifier: email, codeHash: hashCode(email, code), expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });
  const { subject, text, html } = otpEmail(code);
  const { logged } = await sendEmail(email, subject, text, html);
  // Only ever exposed when email is not configured and the server is not in production.
  return logged ? { devCode: code } : {};
}

/** Checks a code and burns it on success; throws a user-safe error otherwise. */
export async function consumeOtp(email: string, code: string): Promise<void> {
  const otp = await prisma.otpCode.findFirst({
    where: { identifier: email, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp || otp.attempts >= MAX_ATTEMPTS) {
    throw new HttpError(400, 'That code has expired. Request a new one.');
  }
  const expected = Buffer.from(otp.codeHash);
  const given = Buffer.from(hashCode(email, code));
  const ok = expected.length === given.length && crypto.timingSafeEqual(expected, given);
  if (!ok) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw new HttpError(400, 'That code is not correct.');
  }
  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
}
