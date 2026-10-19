import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminRequest } from '@/server/security/adminSession';
import { googleKeyStatus } from '@/server/ai/googleKey';
import { deleteGoogleKey, saveGoogleKey } from '@/server/ai/secretStore';
import { verifyKey } from '@/server/ai/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const unauthorized = () => NextResponse.json({ error: 'Admin sign-in required.' }, { status: 401 });

export async function GET() {
  if (!isAdminRequest()) return unauthorized();
  return NextResponse.json(await googleKeyStatus());
}

/** Tolerates a pasted `GOOGLE_API_KEY=...` line or surrounding quotes. */
const cleanKey = (v: unknown) =>
  typeof v === 'string' ? v.trim().replace(/^[A-Z_]+\s*=\s*/, '').replace(/^["']|["']$/g, '').trim() : v;

const putSchema = z.object({
  apiKey: z.preprocess(
    cleanKey,
    z.string().min(20, 'That key looks too short.').max(300).regex(/^[\w.\-~+/=]+$/, 'That key contains characters Google keys do not use. Paste only the key.'),
  ),
});

export async function PUT(request: Request) {
  if (!isAdminRequest()) return unauthorized();
  const parsed = putSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Enter a valid API key.' }, { status: 400 });
  }
  if (!(await verifyKey(parsed.data.apiKey))) {
    return NextResponse.json(
      { error: 'Google rejected this key. Check it is a Gemini API key and the API is enabled.' },
      { status: 422 },
    );
  }
  try {
    await saveGoogleKey(parsed.data.apiKey);
  } catch {
    return NextResponse.json(
      { error: 'The key could not be stored. Set SETTINGS_ENCRYPTION_SECRET on the server.' },
      { status: 500 },
    );
  }
  return NextResponse.json(await googleKeyStatus());
}

export async function DELETE() {
  if (!isAdminRequest()) return unauthorized();
  await deleteGoogleKey();
  return NextResponse.json(await googleKeyStatus());
}
