-- Orders placed by staff for guests without a phone, and parcel (packed to take away) orders.
--   is_parcel           the kitchen packs this order; can be set on any order, QR or staff-placed
--   guest_name          optional name staff type in for a walk-in guest with no account
--   placed_by_staff_id  the staff member who entered the order (NULL for guest QR orders)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_parcel boolean NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS placed_by_staff_id uuid REFERENCES staff_users (id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_guest_name_len') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_guest_name_len CHECK (guest_name IS NULL OR char_length(guest_name) <= 60);
  END IF;
END $$;
