import { json, route } from '@/server/http';
import { endSession } from '@/server/security/session';

export const runtime = 'nodejs';

export const POST = route(async () => {
  endSession('staff');
  return json({ ok: true });
});
