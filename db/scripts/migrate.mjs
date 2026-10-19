// Applies db/migrations/*.sql in order using the app's DATABASE_URL.
//   node db/scripts/migrate.mjs            apply migrations
//   node db/scripts/migrate.mjs --wipe     ALSO delete every row in every table (keeps the schema)
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const here = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

function statements(sql) {
  // Split on semicolons that end a line, keeping DO $$ ... $$ blocks intact.
  const out = [];
  let buf = '';
  let inDollar = false;
  for (const line of sql.split('\n')) {
    if (line.trim().startsWith('--')) continue;
    buf += line + '\n';
    if ((line.match(/\$\$/g) || []).length % 2 === 1) inDollar = !inDollar;
    if (!inDollar && line.trim().endsWith(';')) {
      out.push(buf.trim());
      buf = '';
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

try {
  const dir = join(here, '..', 'migrations');
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    for (const stmt of statements(readFileSync(join(dir, file), 'utf8'))) await prisma.$executeRawUnsafe(stmt);
    console.log('applied', file);
  }
  if (process.argv.includes('--wipe')) {
    await prisma.$executeRawUnsafe(
      'TRUNCATE restaurants, customers, otp_codes, analytics_events, restaurant_daily_stats RESTART IDENTITY CASCADE',
    );
    console.log('wiped all data');
  }
  const counts = await prisma.$queryRawUnsafe(
    'select (select count(*) from restaurants)::int restaurants, (select count(*) from customers)::int customers, (select count(*) from orders)::int orders',
  );
  console.log(counts[0]);
} finally {
  await prisma.$disconnect();
}
