import { HttpError, json, readJson, route } from '@/server/http';
import { isRateLimited } from '@/server/security/rateLimit';
import { sendEmail } from '@/server/email';
import { contactSchema } from '@/features/landing/types';

export const runtime = 'nodejs';

const TOPIC_LABEL = {
  restaurant: 'Restaurant owner',
  guest: 'Guest',
  partnership: 'Partnership',
  other: 'Other',
} as const;

const escapeHtml = (v: string) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Sends a landing-page enquiry to the RestoFlow team. The recipient is fixed on the server, never taken from the request. */
export const POST = route(async (request) => {
  if (isRateLimited('contact', request, 5, 10 * 60_000)) {
    throw new HttpError(429, 'Too many messages. Please try again in a few minutes.');
  }
  const input = contactSchema.parse(await readJson(request));
  // Bots fill the hidden field; pretend it worked so they do not adapt.
  if (input.website) return json({ ok: true });

  const to = process.env.CONTACT_EMAIL?.trim() || 'admin@cleanflow.one';
  const topic = TOPIC_LABEL[input.topic];
  const lines = [`Topic: ${topic}`, `Name: ${input.name}`, `Email: ${input.email}`, input.phone ? `Phone: ${input.phone}` : '', '', input.message].filter(
    (l, i) => l !== '' || i > 3,
  );
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#0f172a">
  <p><strong>${escapeHtml(topic)}</strong> enquiry from the RestoFlow website</p>
  <p>${escapeHtml(input.name)} &lt;${escapeHtml(input.email)}&gt;${input.phone ? ` &middot; ${escapeHtml(input.phone)}` : ''}</p>
  <p style="white-space:pre-wrap;border-left:3px solid #C8202F;padding-left:12px">${escapeHtml(input.message)}</p>
</div>`;

  await sendEmail(to, `RestoFlow enquiry: ${topic} - ${input.name}`, lines.join('\n'), html, { replyTo: input.email });
  return json({ ok: true });
});
