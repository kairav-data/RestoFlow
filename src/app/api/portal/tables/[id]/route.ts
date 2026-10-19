import { prisma } from '@/server/db';
import { HttpError, json, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';

export const runtime = 'nodejs';

type Ctx = { params: { id: string } };

/** Tables are switched off rather than deleted, so past orders and visits keep their table. */
export const DELETE = route<Ctx>(async (_request, { params }) => {
  const { restaurantId } = requireStaffSession();
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) throw new HttpError(404, 'Table not found.');
  const table = await prisma.diningTable.findFirst({ where: { id: params.id, restaurantId } });
  if (!table) throw new HttpError(404, 'Table not found.');
  await prisma.diningTable.update({ where: { id: table.id }, data: { isActive: false } });

  const tables = await prisma.diningTable.findMany({ where: { restaurantId, isActive: true }, orderBy: { createdAt: 'asc' } });
  return json({ tables: tables.map((t) => ({ id: t.id, name: t.name, capacity: t.capacity })) });
});
