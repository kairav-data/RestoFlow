// Sets up and updates the database using the app's DATABASE_URL.
//   node db/scripts/migrate.mjs            create the base schema if the database is empty, then apply db/migrations/*.sql
//   node db/scripts/migrate.mjs --wipe     ALSO delete every row in every table (keeps the schema)
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const here = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

/** Removes a trailing "-- comment" when the dash-dash is not inside a quoted string. */
function stripTrailingComment(line) {
  const at = line.indexOf('--');
  if (at < 0) return line;
  const before = line.slice(0, at);
  return (before.match(/'/g) || []).length % 2 === 0 ? before : line;
}

function statements(sql) {
  // Split on semicolons that end a line, keeping DO $$ ... $$ blocks and function bodies intact.
  const out = [];
  let buf = '';
  let inDollar = false;
  for (const raw of sql.split('\n')) {
    if (raw.trim().startsWith('--')) continue;
    const line = stripTrailingComment(raw);
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

async function run(file, label) {
  for (const stmt of statements(readFileSync(file, 'utf8'))) {
    try {
      await prisma.$executeRawUnsafe(stmt);
    } catch (err) {
      console.error(`\nFailed in ${label} on:\n${stmt.slice(0, 300)}\n`);
      throw err;
    }
  }
  console.log('applied', label);
}

try {
  const base = await prisma.$queryRawUnsafe(
    "select count(*)::int as n from information_schema.tables where table_schema = 'public' and table_name = 'restaurants'",
  );
  if (base[0].n === 0) await run(join(here, '..', 'schema.sql'), 'schema.sql (base schema)');
  else console.log('base schema already present');

  const dir = join(here, '..', 'migrations');
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) await run(join(dir, file), file);

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
