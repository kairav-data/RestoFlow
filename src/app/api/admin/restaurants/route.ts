import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { HttpError, json, readJson, route } from '@/server/http';
import { requireAdmin } from '@/server/security/adminGuard';
import { onboardingSchema } from '@/features/admin/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = ['Starters', 'Mains', 'Breads & Rice', 'Desserts', 'Beverages'];
const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Logos and cover photos arrive as resized data URLs; cap their size and type.
const imageSchema = z
  .string()
  .max(600_000)
  .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/)
  .optional();

const createSchema = z.object({ details: onboardingSchema, logo: imageSchema, cover: imageSchema });

export const GET = route(async () => {
  requireAdmin();
  const restaurants = await prisma.restaurant.findMany({ orderBy: { createdAt: 'desc' } });
  const owners = await prisma.staffUser.findMany({
    where: { restaurantId: { in: restaurants.map((r) => r.id) }, role: 'owner' },
    select: { restaurantId: true, email: true, fullName: true },
  });
  const ownerOf = new Map(owners.map((o) => [o.restaurantId, o]));
  return json({
    restaurants: restaurants.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      cuisine: r.cuisine ?? '',
      location: r.location ?? '',
      logo: r.logoUrl ?? undefined,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      ownerName: ownerOf.get(r.id)?.fullName ?? '',
      ownerEmail: ownerOf.get(r.id)?.email ?? '',
    })),
  });
});

export const POST = route(async (request) => {
  requireAdmin();
  const { details: d, logo, cover } = createSchema.parse(await readJson(request));

  if (await prisma.restaurant.findUnique({ where: { slug: d.slug } })) {
    throw new HttpError(409, 'This restaurant code is already in use.');
  }
  if (await prisma.staffUser.findFirst({ where: { email: { equals: d.ownerEmail, mode: 'insensitive' } } })) {
    throw new HttpError(409, 'This email already belongs to another account.');
  }

  const passwordHash = await bcrypt.hash(d.password, 12);
  try {
    const restaurant = await prisma.$transaction(async (tx) => {
      const created = await tx.restaurant.create({
        data: {
          slug: d.slug,
          name: d.name,
          tagline: d.tagline || null,
          cuisine: d.cuisine,
          currency: d.currency,
          phone: d.phone,
          description: d.description || null,
          address: d.address,
          location: d.location,
          operatingHours: d.operatingHours,
          logoUrl: logo ?? null,
          coverUrl: cover ?? null,
        },
      });
      const branch = await tx.branch.create({
        data: { restaurantId: created.id, name: d.location, address: d.address, city: d.location, phone: d.phone },
      });
      await tx.diningTable.createMany({
        data: Array.from({ length: d.tableCount }, (_, i) => ({
          restaurantId: created.id,
          branchId: branch.id,
          name: `T${String(i + 1).padStart(2, '0')}`,
          capacity: 4,
          qrToken: crypto.randomUUID().replace(/-/g, ''),
        })),
      });
      await tx.menuCategory.createMany({
        data: DEFAULT_CATEGORIES.map((name, i) => ({
          restaurantId: created.id,
          slug: slugify(name),
          name,
          sortOrder: i,
        })),
      });
      await tx.staffUser.create({
        data: {
          restaurantId: created.id,
          email: d.ownerEmail,
          passwordHash,
          fullName: d.ownerName,
          role: 'owner',
        },
      });
      return created;
    });
    return json({ restaurant: { id: restaurant.id, slug: restaurant.slug, name: restaurant.name } }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new HttpError(409, 'That restaurant code or owner email is already in use.');
    }
    throw err;
  }
});
