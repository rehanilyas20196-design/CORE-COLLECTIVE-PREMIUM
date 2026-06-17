-- ================================================================
-- CORE COLLECTIVE — FIX QUOTES TABLE: UUID → BIGSERIAL
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. Backup existing data (preserves all rows)
CREATE TABLE IF NOT EXISTS quotes_backup AS SELECT * FROM quotes;

-- 2. Drop the old table (CASCADE drops any FK references TO quotes)
DROP TABLE IF EXISTS quotes CASCADE;

-- 3. Recreate with BIGSERIAL id to match the actual numeric IDs
CREATE TABLE quotes (
  id              BIGSERIAL PRIMARY KEY,
  product_id      BIGINT,
  supplier_id     UUID,
  buyer_id        UUID,
  buyer_name      TEXT,
  business_name   TEXT,
  phone           TEXT,
  email           TEXT,
  quantity        INTEGER,
  message         TEXT,
  status          TEXT DEFAULT 'new' CHECK (status IN ('new','read','replied','closed')),
  admin_note      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK constraints (as separate statements to avoid errors if referenced tables are missing)
ALTER TABLE quotes ADD CONSTRAINT fk_quotes_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE quotes ADD CONSTRAINT fk_quotes_buyer FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- supplier_profiles may not exist yet, so add FK conditionally
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supplier_profiles') THEN
    EXECUTE 'ALTER TABLE quotes ADD CONSTRAINT fk_quotes_supplier FOREIGN KEY (supplier_id) REFERENCES supplier_profiles(id) ON DELETE SET NULL';
  END IF;
END $$;

-- 4. Restore data from backup
INSERT INTO quotes (product_id, supplier_id, buyer_id, buyer_name, business_name, phone, email, quantity, message, status, admin_note, created_at)
SELECT product_id, supplier_id, buyer_id, buyer_name, business_name, phone, email, quantity, message, status, admin_note, created_at
FROM quotes_backup;

-- 5. Drop the backup table
DROP TABLE IF EXISTS quotes_backup;

-- 6. Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- 7. Restore RLS policies
DROP POLICY IF EXISTS "Buyers can view own quotes" ON quotes;
CREATE POLICY "Buyers can view own quotes" ON quotes
  FOR SELECT USING (buyer_id = auth.uid());
DROP POLICY IF EXISTS "Suppliers can view assigned quotes" ON quotes;
CREATE POLICY "Suppliers can view assigned quotes" ON quotes
  FOR SELECT USING (supplier_id IN (SELECT id FROM supplier_profiles WHERE user_id = auth.uid()));

-- 8. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 9. Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'quotes' AND column_name = 'id';
