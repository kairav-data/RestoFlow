-- =====================================================================
-- RestoFlow database schema (PostgreSQL 15+, Supabase compatible)
--
-- Design goals: thousands of restaurants (tenants), millions of guests.
--   * Shared-schema multi-tenancy: every restaurant-owned row carries restaurant_id.
--   * Tenant isolation enforced by the database: composite foreign keys
--     (restaurant_id, x_id) make it impossible for a row to reference another
--     restaurant's branch, table, dish or session.
--   * Guests are a GLOBAL identity (one phone = one customer); per-restaurant CRM
--     data lives in restaurant_customers.
--   * High-volume, time-ordered tables (orders, order_items, payments, feedback,
--     dish_ratings, analytics_events) are RANGE-partitioned by month.
--   * Money is stored as integer minor units (paise), never floats.
--   * Passwords are stored only as bcrypt hashes (never plain text).
--   * Row Level Security is ON with no policies: the Supabase anon/authenticated
--     API roles see nothing. The app connects server-side as the postgres role.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS extensions;   -- already present on Supabase
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
CREATE TYPE restaurant_status AS ENUM ('pending', 'active', 'suspended', 'closed');
CREATE TYPE staff_role        AS ENUM ('owner', 'manager', 'staff', 'kitchen');
CREATE TYPE account_status    AS ENUM ('active', 'disabled');
CREATE TYPE session_status    AS ENUM ('active', 'closed');
CREATE TYPE order_status      AS ENUM ('new', 'preparing', 'ready', 'served', 'cancelled');
CREATE TYPE order_type        AS ENUM ('dine_in', 'takeaway', 'qr_online');
CREATE TYPE payment_status    AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method    AS ENUM ('upi', 'card', 'cash', 'wallet');
CREATE TYPE discount_type     AS ENUM ('percent', 'flat');

-- ---------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================================
-- TENANTS
-- =====================================================================
CREATE TABLE restaurants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL,                       -- public id used in /portal/<slug> and /r/<slug>
  name          text NOT NULL,
  tagline       text,
  cuisine       text,
  status        restaurant_status NOT NULL DEFAULT 'active',
  currency      char(3) NOT NULL DEFAULT 'INR',
  timezone      text NOT NULL DEFAULT 'Asia/Kolkata',
  logo_url      text,
  cover_url     text,
  phone         text,
  rating_avg    numeric(3,2) NOT NULL DEFAULT 0,     -- denormalised, refreshed by rollup job
  rating_count  integer NOT NULL DEFAULT 0,
  settings      jsonb NOT NULL DEFAULT '{}'::jsonb,  -- branding, tax %, service charge %, feature flags
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT restaurants_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
CREATE UNIQUE INDEX restaurants_slug_key ON restaurants (slug);
CREATE TRIGGER restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE branches (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  name           text NOT NULL,
  address        text,
  city           text,
  phone          text,
  opens_at       time,
  closes_at      time,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, id),                         -- target for tenant-safe composite FKs
  UNIQUE (restaurant_id, name)
);
CREATE TRIGGER branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Restaurant owners, managers and staff. Hashes are bcrypt ($2b$...).
CREATE TABLE staff_users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  email          text NOT NULL,
  password_hash  text NOT NULL,
  full_name      text NOT NULL,
  role           staff_role NOT NULL,
  status         account_status NOT NULL DEFAULT 'active',
  branch_id      uuid,                                -- NULL = access to all branches
  last_login_at  timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_branch_fk FOREIGN KEY (restaurant_id, branch_id)
    REFERENCES branches (restaurant_id, id) ON DELETE SET NULL (branch_id),
  CONSTRAINT staff_hash_is_bcrypt CHECK (password_hash ~ '^\$2[aby]\$')
);
CREATE UNIQUE INDEX staff_users_email_key ON staff_users (lower(email));  -- one login per email platform-wide
CREATE INDEX staff_users_restaurant_idx ON staff_users (restaurant_id, role);
CREATE TRIGGER staff_users_updated_at BEFORE UPDATE ON staff_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE dining_tables (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  branch_id      uuid NOT NULL,
  name           text NOT NULL,                       -- printed on the QR card, e.g. "T12", "Terrace 3"
  capacity       smallint NOT NULL CHECK (capacity BETWEEN 1 AND 40),
  qr_token       text NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),  -- rotate to invalidate printed QR
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tables_branch_fk FOREIGN KEY (restaurant_id, branch_id)
    REFERENCES branches (restaurant_id, id) ON DELETE CASCADE,
  UNIQUE (restaurant_id, id),
  UNIQUE (branch_id, name),
  UNIQUE (qr_token)
);
CREATE TRIGGER dining_tables_updated_at BEFORE UPDATE ON dining_tables
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- MENU
-- =====================================================================
CREATE TABLE menu_categories (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  slug           text NOT NULL,
  name           text NOT NULL,
  image_url      text,
  sort_order     smallint NOT NULL DEFAULT 0,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, id),
  UNIQUE (restaurant_id, slug)
);
CREATE TRIGGER menu_categories_updated_at BEFORE UPDATE ON menu_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE menu_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id    uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  category_id      uuid NOT NULL,
  slug             text NOT NULL,
  name             text NOT NULL,
  description      text,
  price_minor      integer NOT NULL CHECK (price_minor >= 0),
  is_vegetarian    boolean NOT NULL,
  spice_level      smallint NOT NULL DEFAULT 0 CHECK (spice_level BETWEEN 0 AND 3),
  calories         integer,
  prep_minutes     smallint,
  image_url        text,
  tags             text[] NOT NULL DEFAULT '{}',      -- chef_special, best_seller, gluten_free ...
  allergens        text[] NOT NULL DEFAULT '{}',
  is_available     boolean NOT NULL DEFAULT true,
  rating_avg       numeric(3,2) NOT NULL DEFAULT 0,   -- refreshed by rollup job
  rating_count     integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT menu_items_category_fk FOREIGN KEY (restaurant_id, category_id)
    REFERENCES menu_categories (restaurant_id, id),
  UNIQUE (restaurant_id, id),
  UNIQUE (restaurant_id, slug)
);
CREATE INDEX menu_items_category_idx ON menu_items (restaurant_id, category_id) WHERE is_available;
CREATE INDEX menu_items_name_trgm ON menu_items USING gin (name extensions.gin_trgm_ops);
CREATE TRIGGER menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE promotions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  name           text NOT NULL,
  code           text,
  discount_type  discount_type NOT NULL,
  discount_value integer NOT NULL CHECK (discount_value > 0),   -- percent, or minor units for flat
  min_order_minor integer NOT NULL DEFAULT 0,
  starts_at      timestamptz NOT NULL,
  ends_at        timestamptz NOT NULL,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  UNIQUE (restaurant_id, id)
);
CREATE UNIQUE INDEX promotions_code_key ON promotions (restaurant_id, lower(code)) WHERE code IS NOT NULL;
CREATE TRIGGER promotions_updated_at BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- GUESTS
-- =====================================================================
-- Global identity: one row per person across all restaurants (millions).
CREATE TABLE customers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone              text NOT NULL,                   -- E.164, e.g. +919876543210
  phone_verified_at  timestamptz,
  name               text NOT NULL,
  email              text,
  password_hash      text,                            -- bcrypt; NULL for OTP-only guests
  dietary            text[] NOT NULL DEFAULT '{}',
  allergies          text,
  marketing_opt_in   boolean NOT NULL DEFAULT false,
  status             account_status NOT NULL DEFAULT 'active',
  last_login_at      timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customers_phone_format CHECK (phone ~ '^\+[1-9][0-9]{7,14}$'),
  CONSTRAINT customers_hash_is_bcrypt CHECK (password_hash IS NULL OR password_hash ~ '^\$2[aby]\$')
);
CREATE UNIQUE INDEX customers_phone_key ON customers (phone);
CREATE UNIQUE INDEX customers_email_key ON customers (lower(email)) WHERE email IS NOT NULL;
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Per-restaurant CRM view of a guest. This is the table owners query ("my customers").
CREATE TABLE restaurant_customers (
  restaurant_id      uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  customer_id        uuid NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  first_visit_at     timestamptz NOT NULL,
  last_visit_at      timestamptz NOT NULL,
  visit_count        integer NOT NULL DEFAULT 1,
  total_spent_minor  bigint NOT NULL DEFAULT 0,
  tags               text[] NOT NULL DEFAULT '{}',
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (restaurant_id, customer_id)
);
CREATE INDEX restaurant_customers_recent_idx ON restaurant_customers (restaurant_id, last_visit_at DESC);
CREATE INDEX restaurant_customers_spend_idx  ON restaurant_customers (restaurant_id, total_spent_minor DESC);
CREATE INDEX restaurant_customers_customer_idx ON restaurant_customers (customer_id);
CREATE TRIGGER restaurant_customers_updated_at BEFORE UPDATE ON restaurant_customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- One row per QR scan / dining visit. Short-lived: archive closed sessions after N months.
CREATE TABLE guest_sessions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  branch_id      uuid NOT NULL,
  table_id       uuid,
  customer_id    uuid REFERENCES customers (id) ON DELETE SET NULL,   -- NULL until the guest logs in
  party_size     smallint CHECK (party_size BETWEEN 1 AND 40),
  status         session_status NOT NULL DEFAULT 'active',
  started_at     timestamptz NOT NULL DEFAULT now(),
  ended_at       timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sessions_branch_fk FOREIGN KEY (restaurant_id, branch_id)
    REFERENCES branches (restaurant_id, id),
  CONSTRAINT sessions_table_fk FOREIGN KEY (restaurant_id, table_id)
    REFERENCES dining_tables (restaurant_id, id),
  UNIQUE (restaurant_id, id)
);
CREATE INDEX guest_sessions_restaurant_started_idx ON guest_sessions (restaurant_id, started_at DESC);
CREATE INDEX guest_sessions_customer_idx ON guest_sessions (customer_id, started_at DESC);
CREATE INDEX guest_sessions_active_idx ON guest_sessions (restaurant_id, table_id) WHERE status = 'active';

-- =====================================================================
-- ORDERS (partitioned by month on created_at)
-- Primary keys include created_at because PostgreSQL requires the partition
-- key in every unique constraint. Children carry the parent's created_at so
-- they land in the same partition and keep a real foreign key.
-- =====================================================================
CREATE TABLE orders (
  id                    uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id         uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  branch_id             uuid NOT NULL,
  table_id              uuid,
  session_id            uuid,
  customer_id           uuid REFERENCES customers (id) ON DELETE SET NULL,
  promotion_id          uuid,
  order_number          integer NOT NULL,             -- human ticket number, allocated per branch per day by the app
  order_type            order_type NOT NULL DEFAULT 'dine_in',
  status                order_status NOT NULL DEFAULT 'new',
  subtotal_minor        integer NOT NULL CHECK (subtotal_minor >= 0),
  tax_minor             integer NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  service_charge_minor  integer NOT NULL DEFAULT 0 CHECK (service_charge_minor >= 0),
  discount_minor        integer NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  total_minor           integer NOT NULL CHECK (total_minor >= 0),
  notes                 text,
  is_parcel             boolean NOT NULL DEFAULT false, -- packed to take away (see migration 006)
  guest_name            text CHECK (guest_name IS NULL OR char_length(guest_name) <= 60),
  placed_by_staff_id    uuid REFERENCES staff_users (id) ON DELETE SET NULL, -- NULL for guest QR orders
  ready_at              timestamptz,
  served_at             timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at),
  CONSTRAINT orders_branch_fk FOREIGN KEY (restaurant_id, branch_id)
    REFERENCES branches (restaurant_id, id),
  CONSTRAINT orders_table_fk FOREIGN KEY (restaurant_id, table_id)
    REFERENCES dining_tables (restaurant_id, id),
  CONSTRAINT orders_session_fk FOREIGN KEY (restaurant_id, session_id)
    REFERENCES guest_sessions (restaurant_id, id),
  CONSTRAINT orders_promotion_fk FOREIGN KEY (restaurant_id, promotion_id)
    REFERENCES promotions (restaurant_id, id),
  CONSTRAINT orders_total_matches CHECK (
    total_minor = subtotal_minor + tax_minor + service_charge_minor - discount_minor)
) PARTITION BY RANGE (created_at);

CREATE INDEX orders_restaurant_created_idx ON orders (restaurant_id, created_at DESC);
CREATE INDEX orders_branch_created_idx     ON orders (restaurant_id, branch_id, created_at DESC);
CREATE INDEX orders_customer_created_idx   ON orders (customer_id, created_at DESC);
-- Kitchen / live-orders screen only ever reads open tickets.
CREATE INDEX orders_open_idx ON orders (restaurant_id, branch_id, created_at)
  WHERE status IN ('new', 'preparing', 'ready');
CREATE INDEX orders_table_idx ON orders (restaurant_id, table_id, created_at DESC);
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE order_items (
  id                uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id          uuid NOT NULL,
  restaurant_id     uuid NOT NULL,
  menu_item_id      uuid NOT NULL,
  name_snapshot     text NOT NULL,                    -- dish name/price at time of order
  unit_price_minor  integer NOT NULL CHECK (unit_price_minor >= 0),
  quantity          smallint NOT NULL CHECK (quantity > 0),
  line_total_minor  integer NOT NULL CHECK (line_total_minor >= 0),
  notes             text,
  created_at        timestamptz NOT NULL,             -- equals the parent order's created_at
  PRIMARY KEY (id, created_at),
  CONSTRAINT order_items_order_fk FOREIGN KEY (order_id, created_at)
    REFERENCES orders (id, created_at) ON DELETE CASCADE,
  CONSTRAINT order_items_menu_fk FOREIGN KEY (restaurant_id, menu_item_id)
    REFERENCES menu_items (restaurant_id, id),
  CONSTRAINT order_items_line_total CHECK (line_total_minor = unit_price_minor * quantity)
) PARTITION BY RANGE (created_at);

CREATE INDEX order_items_order_idx ON order_items (order_id, created_at);
-- Top-dish and menu-performance analytics.
CREATE INDEX order_items_dish_idx ON order_items (restaurant_id, menu_item_id, created_at DESC);

CREATE TABLE payments (
  id                uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id     uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  order_id          uuid NOT NULL,
  order_created_at  timestamptz NOT NULL,
  method            payment_method NOT NULL,
  status            payment_status NOT NULL DEFAULT 'pending',
  amount_minor      integer NOT NULL CHECK (amount_minor >= 0),
  provider_ref      text,                             -- gateway reference only, never card data
  paid_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at),
  CONSTRAINT payments_order_fk FOREIGN KEY (order_id, order_created_at)
    REFERENCES orders (id, created_at) ON DELETE CASCADE
) PARTITION BY RANGE (created_at);

CREATE INDEX payments_order_idx ON payments (order_id, order_created_at);
CREATE INDEX payments_restaurant_created_idx ON payments (restaurant_id, created_at DESC);
CREATE UNIQUE INDEX payments_provider_ref_key ON payments (provider_ref, created_at) WHERE provider_ref IS NOT NULL;
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- FEEDBACK (partitioned by month)
-- =====================================================================
CREATE TABLE feedback (
  id                uuid NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id     uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  branch_id         uuid NOT NULL,
  table_id          uuid,
  customer_id       uuid REFERENCES customers (id) ON DELETE SET NULL,
  order_id          uuid,
  order_created_at  timestamptz,
  overall_rating    smallint NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  service_rating    smallint NOT NULL CHECK (service_rating BETWEEN 1 AND 5),
  ambience_rating   smallint NOT NULL CHECK (ambience_rating BETWEEN 1 AND 5),
  value_rating      smallint NOT NULL CHECK (value_rating BETWEEN 1 AND 5),
  would_recommend   boolean NOT NULL,
  topics            text[] NOT NULL DEFAULT '{}',
  suggestion        text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at),
  CONSTRAINT feedback_branch_fk FOREIGN KEY (restaurant_id, branch_id)
    REFERENCES branches (restaurant_id, id),
  CONSTRAINT feedback_table_fk FOREIGN KEY (restaurant_id, table_id)
    REFERENCES dining_tables (restaurant_id, id),
  CONSTRAINT feedback_order_fk FOREIGN KEY (order_id, order_created_at)
    REFERENCES orders (id, created_at) ON DELETE SET NULL (order_id, order_created_at),
  CONSTRAINT feedback_order_pair CHECK ((order_id IS NULL) = (order_created_at IS NULL))
) PARTITION BY RANGE (created_at);

CREATE INDEX feedback_restaurant_created_idx ON feedback (restaurant_id, created_at DESC);
CREATE INDEX feedback_customer_idx ON feedback (customer_id, created_at DESC);
CREATE INDEX feedback_low_rating_idx ON feedback (restaurant_id, created_at DESC) WHERE overall_rating <= 2;

CREATE TABLE dish_ratings (
  id            uuid NOT NULL DEFAULT gen_random_uuid(),
  feedback_id   uuid NOT NULL,
  restaurant_id uuid NOT NULL,
  menu_item_id  uuid NOT NULL,
  rating        smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  note          text,
  created_at    timestamptz NOT NULL,                 -- equals the parent feedback's created_at
  PRIMARY KEY (id, created_at),
  CONSTRAINT dish_ratings_feedback_fk FOREIGN KEY (feedback_id, created_at)
    REFERENCES feedback (id, created_at) ON DELETE CASCADE,
  CONSTRAINT dish_ratings_menu_fk FOREIGN KEY (restaurant_id, menu_item_id)
    REFERENCES menu_items (restaurant_id, id)
) PARTITION BY RANGE (created_at);

CREATE INDEX dish_ratings_feedback_idx ON dish_ratings (feedback_id, created_at);
CREATE INDEX dish_ratings_dish_idx ON dish_ratings (restaurant_id, menu_item_id, created_at DESC);

-- =====================================================================
-- ANALYTICS
-- =====================================================================
-- Raw behaviour events (qr_scan, dish_view, add_to_cart ...). Very high volume,
-- so no foreign keys; BRIN keeps the time index tiny.
CREATE TABLE analytics_events (
  id             bigint GENERATED ALWAYS AS IDENTITY,
  restaurant_id  uuid NOT NULL,
  branch_id      uuid,
  session_id     uuid,
  customer_id    uuid,
  event_type     text NOT NULL,
  properties     jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

CREATE INDEX analytics_events_restaurant_type_idx ON analytics_events (restaurant_id, event_type, occurred_at DESC);
CREATE INDEX analytics_events_time_brin ON analytics_events USING brin (occurred_at);

-- Pre-aggregated daily numbers: dashboards read this, never the raw order tables.
CREATE TABLE restaurant_daily_stats (
  restaurant_id    uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  branch_id        uuid NOT NULL,
  stat_date        date NOT NULL,
  orders_count     integer NOT NULL DEFAULT 0,
  revenue_minor    bigint NOT NULL DEFAULT 0,
  unique_customers integer NOT NULL DEFAULT 0,
  new_customers    integer NOT NULL DEFAULT 0,
  feedback_count   integer NOT NULL DEFAULT 0,
  rating_avg       numeric(3,2),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (restaurant_id, branch_id, stat_date),
  CONSTRAINT daily_stats_branch_fk FOREIGN KEY (restaurant_id, branch_id)
    REFERENCES branches (restaurant_id, id) ON DELETE CASCADE
);
CREATE INDEX restaurant_daily_stats_date_idx ON restaurant_daily_stats (restaurant_id, stat_date DESC);

-- =====================================================================
-- PARTITION MANAGEMENT
-- Creates one partition per month starting at start_month. Safe to re-run.
-- Schedule monthly (pg_cron: SELECT ensure_partitions(6)) so there are always
-- future partitions; rows outside any range go to the *_default partition.
-- =====================================================================
CREATE OR REPLACE FUNCTION create_monthly_partitions(parent_table text, start_month date, months integer)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  from_d date;
  to_d   date;
  i      integer;
BEGIN
  FOR i IN 0 .. months - 1 LOOP
    from_d := (date_trunc('month', start_month) + make_interval(months => i))::date;
    to_d   := (from_d + interval '1 month')::date;
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
      parent_table || '_' || to_char(from_d, 'YYYY_MM'),
      parent_table,
      (from_d::timestamp AT TIME ZONE 'UTC'),
      (to_d::timestamp   AT TIME ZONE 'UTC'));
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION ensure_partitions(months_ahead integer DEFAULT 6)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  t text;
  start_m date := date_trunc('month', now() AT TIME ZONE 'UTC')::date;
BEGIN
  FOREACH t IN ARRAY ARRAY['orders', 'order_items', 'payments', 'feedback', 'dish_ratings', 'analytics_events'] LOOP
    PERFORM create_monthly_partitions(t, start_m, months_ahead + 1);
  END LOOP;
END;
$$;

CREATE TABLE orders_default           PARTITION OF orders           DEFAULT;
CREATE TABLE order_items_default      PARTITION OF order_items      DEFAULT;
CREATE TABLE payments_default         PARTITION OF payments         DEFAULT;
CREATE TABLE feedback_default         PARTITION OF feedback         DEFAULT;
CREATE TABLE dish_ratings_default     PARTITION OF dish_ratings     DEFAULT;
CREATE TABLE analytics_events_default PARTITION OF analytics_events DEFAULT;

-- Initial window: Jan 2026 through Dec 2027. Seeding adds any months it needs.
SELECT create_monthly_partitions(t, DATE '2026-01-01', 24)
FROM unnest(ARRAY['orders', 'order_items', 'payments', 'feedback', 'dish_ratings', 'analytics_events']) AS t;

-- =====================================================================
-- SECURITY: RLS on, no policies => API roles (anon / authenticated) read nothing.
-- The application uses a server-side connection that bypasses RLS and must always
-- filter by the restaurant_id taken from the verified session, never from the client.
-- =====================================================================
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT c.relname
           FROM pg_class c
           JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.relname);
  END LOOP;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated';
  END IF;
END;
$$;
