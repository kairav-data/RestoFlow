-- Optional nutrition facts per dish (per full plate): servingSize, calories, protein, carbs, fat, fiber, sugar, sodium.
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS nutrition jsonb;

-- A short, human-friendly guest ID (e.g. RFC-100001) that ties a guest to everything they order.
CREATE SEQUENCE IF NOT EXISTS customer_code_seq START 100001;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_code text NOT NULL DEFAULT ('RFC-' || nextval('customer_code_seq'));
CREATE UNIQUE INDEX IF NOT EXISTS customers_customer_code_key ON customers (customer_code);

-- One row per dish a guest ordered, written when the order is placed. Answers "what did they eat, and when".
CREATE TABLE IF NOT EXISTS customer_dish_history (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       uuid NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  customer_code     text NOT NULL,
  restaurant_id     uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  branch_id         uuid NOT NULL,
  session_id        uuid,
  order_id          uuid NOT NULL,
  order_item_id     uuid NOT NULL,
  order_number      integer NOT NULL,
  table_name        text,
  menu_item_id      uuid NOT NULL,
  dish_name         text NOT NULL,
  portion           text CHECK (portion IS NULL OR portion IN ('half', 'full')),
  quantity          smallint NOT NULL CHECK (quantity > 0),
  unit_price_minor  integer NOT NULL CHECK (unit_price_minor >= 0),
  line_total_minor  integer NOT NULL CHECK (line_total_minor >= 0),
  ordered_at        timestamptz NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_item_id)
);
CREATE INDEX IF NOT EXISTS customer_dish_history_guest_idx ON customer_dish_history (restaurant_id, customer_id, ordered_at DESC);
CREATE INDEX IF NOT EXISTS customer_dish_history_code_idx ON customer_dish_history (customer_code);
CREATE INDEX IF NOT EXISTS customer_dish_history_dish_idx ON customer_dish_history (restaurant_id, menu_item_id);
ALTER TABLE customer_dish_history ENABLE ROW LEVEL SECURITY;

-- Fill history for orders that were placed before this table existed.
INSERT INTO customer_dish_history
  (customer_id, customer_code, restaurant_id, branch_id, session_id, order_id, order_item_id, order_number,
   table_name, menu_item_id, dish_name, portion, quantity, unit_price_minor, line_total_minor, ordered_at)
SELECT o.customer_id, c.customer_code, o.restaurant_id, o.branch_id, o.session_id, o.id, i.id, o.order_number,
       t.name, i.menu_item_id, i.name_snapshot, i.portion, i.quantity, i.unit_price_minor, i.line_total_minor, o.created_at
FROM order_items i
JOIN orders o ON o.id = i.order_id AND o.created_at = i.created_at
JOIN customers c ON c.id = o.customer_id
LEFT JOIN dining_tables t ON t.id = o.table_id
WHERE o.customer_id IS NOT NULL
ON CONFLICT (order_item_id) DO NOTHING;
