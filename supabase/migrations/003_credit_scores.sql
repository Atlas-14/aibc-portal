CREATE TABLE IF NOT EXISTS business_credit_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  dnb_paydex integer,
  dnb_score_date date,
  experian_score integer,
  experian_score_date date,
  equifax_score integer,
  equifax_score_date date,
  notes text,
  updated_by text DEFAULT 'atlas-admin',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE business_credit_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view own scores" ON business_credit_scores FOR SELECT USING (
  client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
);
CREATE POLICY "Service role full access" ON business_credit_scores USING (true) WITH CHECK (true);
