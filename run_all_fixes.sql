-- ================================================================
-- CORE COLLECTIVE — ALL DATABASE FIXES
-- Run this ONCE in Supabase SQL Editor to fix all issues
-- ================================================================

-- ─── FIX 1: Add missing columns to supplier_products ─────────────
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS whatsapp          TEXT;
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS stock_status      TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock','limited','out_of_stock'));
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS specifications    JSONB DEFAULT '{}';
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS pricing_tiers     JSONB DEFAULT '[]';

-- ─── FIX 2: Add missing reviewed_at columns ──────────────────────
ALTER TABLE buy_requests       ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE supplier_products  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE supplier_inquiries ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE discount_messages  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- ─── FIX 3: Rebuild quotes table (UUID → BIGSERIAL) ─────────────

-- Backup existing data
CREATE TABLE IF NOT EXISTS quotes_backup AS SELECT * FROM quotes;

-- Drop old table
DROP TABLE IF EXISTS quotes CASCADE;

-- Recreate with BIGSERIAL id
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

-- Add FK constraints
ALTER TABLE quotes ADD CONSTRAINT fk_quotes_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
ALTER TABLE quotes ADD CONSTRAINT fk_quotes_buyer FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- supplier_profiles may not exist yet
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supplier_profiles') THEN
    EXECUTE 'ALTER TABLE quotes ADD CONSTRAINT fk_quotes_supplier FOREIGN KEY (supplier_id) REFERENCES supplier_profiles(id) ON DELETE SET NULL';
  END IF;
END $$;

-- Restore data from backup
INSERT INTO quotes (product_id, supplier_id, buyer_id, buyer_name, business_name, phone, email, quantity, message, status, admin_note, created_at)
SELECT product_id, supplier_id, buyer_id, buyer_name, business_name, phone, email, quantity, message, status, admin_note, created_at
FROM quotes_backup;

-- Drop backup
DROP TABLE IF EXISTS quotes_backup;

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Restore RLS policies
DROP POLICY IF EXISTS "Buyers can view own quotes" ON quotes;
CREATE POLICY "Buyers can view own quotes" ON quotes
  FOR SELECT USING (buyer_id = auth.uid());
DROP POLICY IF EXISTS "Suppliers can view assigned quotes" ON quotes;
CREATE POLICY "Suppliers can view assigned quotes" ON quotes
  FOR SELECT USING (supplier_id IN (SELECT id FROM supplier_profiles WHERE user_id = auth.uid()));

-- ─── FINAL: Refresh PostgREST schema cache ───────────────────────
NOTIFY pgrst, 'reload schema';

-- ─── VERIFICATION ────────────────────────────────────────────────
SELECT 'supplier_products pricing_tiers' AS check_col,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='supplier_products' AND column_name='pricing_tiers')
         THEN 'EXISTS' ELSE 'MISSING' END AS status
UNION ALL
SELECT 'buy_requests reviewed_at',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='buy_requests' AND column_name='reviewed_at')
         THEN 'EXISTS' ELSE 'MISSING' END
UNION ALL
SELECT 'quotes id type',
       data_type FROM information_schema.columns WHERE table_name='quotes' AND column_name='id';
