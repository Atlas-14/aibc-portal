-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  business_name text,
  plan text DEFAULT 'essentials' CHECK (plan IN ('essentials', 'plus', 'pro')),
  mailbox_id text,
  credit_addon boolean DEFAULT false,
  unit_owner boolean DEFAULT false,
  unit_number text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- Admin can see all
CREATE POLICY "Service role full access to clients" ON clients USING (true) WITH CHECK (true);

-- Admin documents table (docs uploaded TO clients by AIBC)
CREATE TABLE IF NOT EXISTS admin_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  category text DEFAULT 'general',
  notes text,
  uploaded_by text DEFAULT 'atlas',
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE admin_documents ENABLE ROW LEVEL SECURITY;
-- Clients can view their own admin docs
CREATE POLICY "Clients view own admin docs" ON admin_documents FOR SELECT USING (
  client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
);
-- Service role full access
CREATE POLICY "Service role full access to admin_docs" ON admin_documents USING (true) WITH CHECK (true);

-- Client submissions (docs submitted BY clients TO AIBC)
CREATE TABLE IF NOT EXISTS client_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  category text DEFAULT 'compliance',
  status text DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'needs_resubmission')),
  admin_notes text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text
);

ALTER TABLE client_submissions ENABLE ROW LEVEL SECURITY;
-- Clients can view and insert their own submissions
CREATE POLICY "Clients view own submissions" ON client_submissions FOR SELECT USING (
  client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
);
CREATE POLICY "Clients insert own submissions" ON client_submissions FOR INSERT WITH CHECK (
  client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
);
-- Service role full access
CREATE POLICY "Service role full access to submissions" ON client_submissions USING (true) WITH CHECK (true);

-- Storage buckets (run these in Supabase dashboard storage section)
-- Bucket: admin-documents (for AIBC → client uploads)
-- Bucket: client-submissions (for client → AIBC uploads)
