CREATE TABLE IF NOT EXISTS trade_line_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  stripe_subscription_id text,
  tier text CHECK (tier IN ('5k','10k','25k','50k')),
  status text DEFAULT 'pending_agreement' CHECK (status IN ('pending_agreement','active','suspended','cancelled')),
  credit_limit integer,
  monthly_fee integer,
  agreement_signed_at timestamptz,
  agreement_file_path text,
  activated_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE trade_line_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view own tradelines" ON trade_line_subscriptions FOR SELECT USING (
  client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
);
CREATE POLICY "Service role full access" ON trade_line_subscriptions USING (true) WITH CHECK (true);
