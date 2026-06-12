-- ================================================================
-- CONTACT MESSAGES TABLE — run in Supabase SQL Editor
-- ================================================================

-- Create the contact_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS contact_messages (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  subject       TEXT NOT NULL,
  message       TEXT NOT NULL,
  admin_reply   TEXT,
  replied_at    TIMESTAMPTZ,
  status        TEXT DEFAULT 'new' CHECK (status IN ('new','read','replied','pending')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if table already exists (safe to run alongside CREATE IF NOT EXISTS)
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS admin_reply TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS phone TEXT;

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anon inserts (contact form is public)
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Only authenticated users (admin) can view/update/delete
DROP POLICY IF EXISTS "Authenticated users can view contact messages" ON contact_messages;
CREATE POLICY "Authenticated users can view contact messages" ON contact_messages
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON contact_messages;
CREATE POLICY "Authenticated users can update contact messages" ON contact_messages
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete contact messages" ON contact_messages;
CREATE POLICY "Authenticated users can delete contact messages" ON contact_messages
  FOR DELETE USING (auth.role() = 'authenticated');
