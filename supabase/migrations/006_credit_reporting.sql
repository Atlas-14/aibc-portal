-- Add EIN and credit reporting fields to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ein text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_address text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS credit_reporting_enrolled_at timestamptz;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS credit_limit integer DEFAULT 1200;
