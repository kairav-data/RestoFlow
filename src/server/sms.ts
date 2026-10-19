import 'server-only';
import { HttpError } from './http';

const isProd = process.env.NODE_ENV === 'production';

export function smsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_FROM || process.env.TWILIO_MESSAGING_SERVICE_SID),
  );
}

/**
 * Sends a text message through Twilio. In local development, when Twilio is not configured, the message
 * is printed to the server console instead so sign-in can be tested without an SMS account.
 * `logged` is true when the message was only logged (never in production).
 */
export async function sendSms(to: string, body: string): Promise<{ logged: boolean }> {
  if (!smsConfigured()) {
    if (isProd) throw new HttpError(503, 'SMS sign-in is not available right now. Please try again later.');
    console.log(`[sms:dev] to ${to}: ${body}`);
    return { logged: true };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const form = new URLSearchParams({ To: to, Body: body });
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) form.set('MessagingServiceSid', process.env.TWILIO_MESSAGING_SERVICE_SID);
  else form.set('From', process.env.TWILIO_FROM!);

  let res: Response;
  try {
    res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        authorization: `Basic ${Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: form,
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new HttpError(503, 'We could not send the SMS. Please try again.');
  }
  if (!res.ok) {
    console.error('[sms] Twilio rejected the message:', res.status, (await res.text().catch(() => '')).slice(0, 300));
    throw new HttpError(502, 'We could not send the SMS. Check the number and try again.');
  }
  return { logged: false };
}
