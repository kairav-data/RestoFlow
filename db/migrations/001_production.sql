-- Production additions on top of db/schema.sql. Idempotent: safe to run more than once.

-- Half plate: a dish may also be sold as a half portion at a lower price.
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS half_price_minor integer;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'menu_items_half_price_check') THEN
    ALTER TABLE menu_items ADD CONSTRAINT menu_items_half_price_check
      CHECK (half_price_minor IS NULL OR (half_price_minor > 0 AND half_price_minor < price_minor));
  END IF;
END $$;

-- Which plate size was ordered (the snapshot name and unit price already reflect it).
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS portion text;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_portion_check') THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_portion_check
      CHECK (portion IS NULL OR portion IN ('half', 'full'));
  END IF;
END $$;

-- Restaurant profile fields collected at onboarding.
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS operating_hours text;

-- One-time passcodes for guest sign-in. Only a hash of the code is stored.
CREATE TABLE IF NOT EXISTS otp_codes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone        text NOT NULL,
  code_hash    text NOT NULL,
  attempts     smallint NOT NULL DEFAULT 0,
  expires_at   timestamptz NOT NULL,
  consumed_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
DO $$
BEGIN
  -- Migration 004 renames this column to "identifier", so only index it while the old name still exists.
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'otp_codes' AND column_name = 'phone') THEN
    CREATE INDEX IF NOT EXISTS otp_codes_phone_idx ON otp_codes (phone, created_at DESC);
  END IF;
END $$;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Staff login lookups are by slug + email; payments are looked up per order.
CREATE INDEX IF NOT EXISTS payments_order_status_idx ON payments (restaurant_id, status, created_at DESC);
