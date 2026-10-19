import 'server-only';
import crypto from 'crypto';
import { prisma } from '../db';

const SETTING_KEY = 'google_api_key';

interface Stored {
  iv: string;
  tag: string;
  data: string;
}

function encryptionKey(): Buffer | null {
  const secret = process.env.SETTINGS_ENCRYPTION_SECRET || '';
  return secret ? crypto.scryptSync(secret, 'restoflow-ai-settings', 32) : null;
}

/** Encrypted-at-rest storage (in the database, so it survives redeploys and works on serverless hosts) for the admin-managed Google API key. */
export async function saveGoogleKey(apiKey: string): Promise<void> {
  const key = encryptionKey();
  if (!key) throw new Error('SETTINGS_ENCRYPTION_SECRET is not set on the server.');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final()]);
  const stored: Stored = {
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: data.toString('base64'),
  };
  const value = JSON.stringify(stored);
  await prisma.platformSetting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, value },
    update: { value },
  });
}

export async function readGoogleKey(): Promise<{ apiKey: string; updatedAt: string } | null> {
  const key = encryptionKey();
  if (!key) return null;
  try {
    const row = await prisma.platformSetting.findUnique({ where: { key: SETTING_KEY } });
    if (!row) return null;
    const stored = JSON.parse(row.value) as Stored;
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(stored.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(stored.tag, 'base64'));
    const apiKey = Buffer.concat([decipher.update(Buffer.from(stored.data, 'base64')), decipher.final()]).toString('utf8');
    return { apiKey, updatedAt: row.updatedAt.toISOString() };
  } catch {
    return null;
  }
}

export async function deleteGoogleKey(): Promise<void> {
  await prisma.platformSetting.deleteMany({ where: { key: SETTING_KEY } });
}
