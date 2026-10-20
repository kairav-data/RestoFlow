-- Guests now sign in with an email address (one-time code sent by email), so a mobile number is optional.
ALTER TABLE customers ALTER COLUMN phone DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS customers_email_key ON customers (email);

-- One-time codes are keyed by the address they were sent to (was "phone").
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'otp_codes' AND column_name = 'phone') THEN
    ALTER TABLE otp_codes RENAME COLUMN phone TO identifier;
  END IF;
END $$;
DROP INDEX IF EXISTS otp_codes_phone_idx;
CREATE INDEX IF NOT EXISTS otp_codes_identifier_idx ON otp_codes (identifier, created_at DESC);
