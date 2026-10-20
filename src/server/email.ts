import 'server-only';
import { HttpError } from './http';

const isProd = process.env.NODE_ENV === 'production';

const apiKey = () => (process.env.RESEND_API_KEY || process.env.RESEND_API || '').trim();
const sender = () => process.env.RESEND_FROM?.trim() || 'RestoFlow <login@onboarding.cleanflow.one>';

export function emailConfigured(): boolean {
  return Boolean(apiKey());
}

const escapeHtml = (v: string) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Sends an email through Resend. In local development, when no Resend key is set, the message is printed to
 * the server console instead so sign-in can be tested. `logged` is true when it was only logged (never in production).
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
  options?: { replyTo?: string },
): Promise<{ logged: boolean }> {
  if (!emailConfigured()) {
    if (isProd) throw new HttpError(503, 'Email is not available right now. Please try again later.');
    console.log(`[email:dev] to ${to} | ${subject}\n${text}`);
    return { logged: true };
  }

  let res: Response;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey()}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: sender(), to: [to], subject, text, html, ...(options?.replyTo ? { reply_to: options.replyTo } : {}) }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new HttpError(503, 'We could not send the email. Please try again.');
  }
  if (!res.ok) {
    console.error('[email] Resend rejected the message:', res.status, (await res.text().catch(() => '')).slice(0, 400));
    throw new HttpError(502, 'We could not send the email. Check the address and try again.');
  }
  return { logged: false };
}

/** The sign-in code email: the code is in the subject too, so it shows in notification previews. */
export function otpEmail(code: string): { subject: string; text: string; html: string } {
  const safe = escapeHtml(code);
  return {
    subject: `${code} is your RestoFlow sign-in code`,
    text: `Your RestoFlow verification code is ${code}.\n\nIt expires in 5 minutes. If you did not ask for it, you can ignore this email.`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#0f172a">
  <p style="margin:0 0 8px;font-size:14px;color:#64748b">RestoFlow</p>
  <h1 style="margin:0 0 16px;font-size:20px">Your sign-in code</h1>
  <p style="margin:0 0 16px;font-size:14px">Enter this code to continue ordering:</p>
  <p style="margin:0 0 16px;font-size:34px;font-weight:700;letter-spacing:8px;color:#C8202F">${safe}</p>
  <p style="margin:0;font-size:12px;color:#64748b">It expires in 5 minutes. If you did not ask for it, you can ignore this email.</p>
</div>`,
  };
}
