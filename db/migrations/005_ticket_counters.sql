-- Daily order ticket numbers per branch. One atomic upsert allocates the next number, so placing an order
-- needs no advisory lock and no separate "find the highest number" query.
CREATE TABLE IF NOT EXISTS order_ticket_counters (
  branch_id    uuid NOT NULL REFERENCES branches (id) ON DELETE CASCADE,
  day          date NOT NULL,
  last_number  integer NOT NULL,
  PRIMARY KEY (branch_id, day)
);
ALTER TABLE order_ticket_counters ENABLE ROW LEVEL SECURITY;
