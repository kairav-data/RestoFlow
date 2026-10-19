import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/server/db';
import { HttpError, json, route } from '@/server/http';
import { requireAdmin } from '@/server/security/adminGuard';

export const runtime = 'nodejs';

type Ctx = { params: { slug: string } };

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const generatePassword = (length = 12) => Array.from(crypto.randomBytes(length), (b) => ALPHABET[b % ALPHABET.length]).join('');

/** Issues a new one-time password for the restaurant owner. It is returned once and never stored in plain text. */
export const POST = route<Ctx>(async (_request, { params }) => {
  requireAdmin();
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: params.slug } });
  if (!restaurant) throw new HttpError(404, 'Restaurant not found.');
  const owner = await prisma.staffUser.findFirst({ where: { restaurantId: restaurant.id, role: 'owner' } });
  if (!owner) throw new HttpError(404, 'This restaurant has no owner account.');

  const password = generatePassword();
  await prisma.staffUser.update({ where: { id: owner.id }, data: { passwordHash: await bcrypt.hash(password, 12) } });
  return json({ ownerEmail: owner.email, ownerName: owner.fullName, password });
});
