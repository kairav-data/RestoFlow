-- Platform-wide settings (e.g. the admin-managed AI key, stored encrypted). Replaces a local file so it works on serverless hosts.
CREATE TABLE IF NOT EXISTS platform_settings (
  key         text PRIMARY KEY,
  value       text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
