# RestoFlow database

PostgreSQL (Supabase). `db/schema.sql` is the source of truth; `prisma/schema.prisma` is a typed-client mirror.

## Run it

```bash
# 1. put DATABASE_URL in .env (URL-encode special characters: @ -> %40)
# 2. create the tables once (schema.sql is the source of truth)
#    - Supabase: paste db/schema.sql into the SQL editor, or run it with any Postgres client
# 3. apply the production additions (idempotent, safe to repeat)
npm run db:migrate
npx prisma generate
```

There is no demo data. Restaurants are created by the platform admin at `/admin`; their owners, menus, tables,
guests and orders are created through the app. To empty a database that holds test data (keeps the schema):
`node db/scripts/migrate.mjs --wipe`.

If the connection times out, the direct host `db.<ref>.supabase.co` is IPv6-only on your network:
copy the **Session pooler** string from Supabase → Connect into `DATABASE_URL` instead.

## Design decisions

| Concern | Decision |
|---|---|
| Multi-tenancy | One shared schema, `restaurant_id` on every tenant-owned row, indexes lead with it. Scales to thousands of tenants without per-tenant schemas. |
| Tenant isolation in the DB | Composite FKs such as `(restaurant_id, branch_id) → branches(restaurant_id, id)`. A row cannot point at another restaurant's branch, table, dish, promotion or session, even if app code is wrong. |
| Guests | `customers` is a global identity (unique E.164 phone). Per-restaurant CRM (visits, spend, tags) is `restaurant_customers (restaurant_id, customer_id)`, which is what owners query. |
| Volume | `orders`, `order_items`, `payments`, `feedback`, `dish_ratings`, `analytics_events` are RANGE-partitioned by month. Child rows carry the parent's `created_at`, so they sit in the same partition and keep real FKs. Old months can be detached or archived instantly. |
| Hot paths | Partial index for open kitchen tickets; `(restaurant_id, created_at DESC)` on orders and feedback; `(restaurant_id, menu_item_id, created_at)` for top-dish analytics; BRIN on event time; trigram index for menu search. |
| Dashboards | Read `restaurant_daily_stats` (pre-aggregated per branch per day), never the raw order tables. Refresh from a nightly or incremental job. |
| Money | Integer minor units (paise); `CHECK` constraints keep `total = subtotal + tax + service − discount` and `line = price × qty`. |
| Passwords | `staff_users.password_hash` and `customers.password_hash` hold bcrypt only (CHECK enforces the `$2b$` format). Hash in the app with bcrypt/argon2, never store or log plain text. Guests normally sign in by phone OTP, so `password_hash` is nullable. |
| API exposure | RLS is enabled on every table with no policies and `anon`/`authenticated` privileges are revoked, so Supabase's public REST API returns nothing. The server connects as `postgres` (bypasses RLS) and must take `restaurant_id` from the verified session, never from the request. |
| QR | `dining_tables.qr_token` is random and rotatable; the printed URL carries the table name (`/r/<slug>/t/<name>`). |

## Operating at scale

- **Partitions:** `SELECT ensure_partitions(6);` creates the next 6 months. Schedule it monthly with `pg_cron`. Rows outside any range fall into `*_default`; check it stays empty.
- **Connections:** use the Supabase pooler (transaction mode, port 6543) from serverless/Next.js and set `?pgbouncer=true&connection_limit=1` for Prisma.
- **Growth path:** `restaurant_customers` can be HASH-partitioned by `restaurant_id` beyond ~200M rows; add read replicas for analytics; move `analytics_events` to a columnar store if it outgrows Postgres. `guest_sessions` is short-lived: archive closed sessions after a few months.
- **Retention:** detach and archive partitions older than your retention window rather than `DELETE`.

