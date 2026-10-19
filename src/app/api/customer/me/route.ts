import { prisma } from '@/server/db';
import { json, route } from '@/server/http';
import { readSession } from '@/server/security/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const session = readSession('customer');
  if (!session) return json({ customer: null });
  const customer = await prisma.customer.findUnique({ where: { id: session.sub } });
  if (!customer || customer.status !== 'active') return json({ customer: null });
  return json({ customer: { id: customer.id, name: customer.name, phone: customer.phone } });
});
