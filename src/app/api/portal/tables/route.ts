import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db';
import { HttpError, json, readJson, route } from '@/server/http';
import { requireStaffSession } from '@/server/security/session';
import { tableInputSchema } from '@/features/tables/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function listTables(restaurantId: string) {
  const tables = await prisma.diningTable.findMany({
    where: { restaurantId, isActive: true },
    orderBy: { createdAt: 'asc' },
  });
  return tables.map((t) => ({ id: t.id, name: t.name, capacity: t.capacity }));
}

export const GET = route(async () => {
  const { restaurantId } = requireStaffSession();
  return json({ tables: await listTables(restaurantId) });
});

export const POST = route(async (request) => {
  const { restaurantId } = requireStaffSession();
  const input = tableInputSchema.parse(await readJson(request));

  const branch = await prisma.branch.findFirst({ where: { restaurantId, isActive: true }, orderBy: { createdAt: 'asc' } });
  if (!branch) throw new HttpError(409, 'This restaurant has no branch yet.');

  try {
    await prisma.diningTable.create({
      data: {
        restaurantId,
        branchId: branch.id,
        name: input.name,
        capacity: input.capacity,
        qrToken: crypto.randomUUID().replace(/-/g, ''),
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      // A table that was removed earlier keeps its row so past orders stay linked; bring it back instead.
      const old = await prisma.diningTable.findFirst({ where: { branchId: branch.id, name: input.name } });
      if (old && !old.isActive) {
        await prisma.diningTable.update({ where: { id: old.id }, data: { isActive: true, capacity: input.capacity } });
        return json({ tables: await listTables(restaurantId) }, { status: 201 });
      }
      throw new HttpError(409, `A table named "${input.name}" already exists.`);
    }
    throw err;
  }
  return json({ tables: await listTables(restaurantId) }, { status: 201 });
});
