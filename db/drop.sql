-- Removes every RestoFlow object. Used by `apply_schema.py --reset --yes`. DESTRUCTIVE.
DROP TABLE IF EXISTS
  restaurant_daily_stats, analytics_events, dish_ratings, feedback, payments,
  order_items, orders, guest_sessions, restaurant_customers, customers,
  promotions, menu_items, menu_categories, dining_tables, staff_users,
  branches, restaurants CASCADE;
DROP FUNCTION IF EXISTS ensure_partitions(integer);
DROP FUNCTION IF EXISTS create_monthly_partitions(text, date, integer);
DROP FUNCTION IF EXISTS set_updated_at();
DROP TYPE IF EXISTS restaurant_status, staff_role, account_status, session_status,
  order_status, order_type, payment_status, payment_method, discount_type;
