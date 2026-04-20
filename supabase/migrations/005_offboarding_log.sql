CREATE TABLE IF NOT EXISTS offboarding_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid,
  client_email text,
  client_name text,
  plan text,
  mailbox_id text,
  stripe_subscription_id text,
  actions_taken jsonb DEFAULT '[]',
  offboarded_by text DEFAULT 'atlas-admin',
  offboarded_at timestamptz DEFAULT now(),
  notes text
);

ALTER TABLE offboarding_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to offboarding_log"
ON offboarding_log
USING (true)
WITH CHECK (true);
