-- ================================================================
-- SUPPLIER 3-IMAGE FLOW — SUPABASE MIGRATION
-- Run in Supabase SQL Editor: https://supabase.com/dashboard
--
-- Safe to run multiple times (idempotent). Nothing is deleted.
--
-- Flow this supports:
--   1. Supplier submits product (main image + 2 extra)  -> supplier_products
--   2. Admin approves                                   -> copied into products
--      with images[], is_active = true, status = 'active'
--   3. Products page + product detail gallery show the images
--      (gallery = image_url first, then images[] minus duplicates, max 4)
-- ================================================================

-- ─── 1. products.is_active ──────────────────────────────────────
-- Products listing and homepage category filters use .eq('is_active', true),
-- and approved supplier products are inserted with is_active = true.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Backfill: every existing product should stay visible.
UPDATE products
SET is_active = TRUE
WHERE is_active IS NULL;

-- ─── 2. products: columns the approval copy writes ──────────────
-- backend/src/supplier-products/supplier-products.service.ts inserts all of
-- these into `products` when a supplier product is approved. If any column is
-- missing, the whole insert fails and the images never reach the products page.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS whatsapp        TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS stock_status    TEXT DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS specifications  JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pricing_tiers   JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS views           INTEGER DEFAULT 0;

-- Backfill (only touches rows where the value is missing/NULL).
UPDATE products SET stock_status = 'in_stock' WHERE stock_status IS NULL;
UPDATE products SET specifications = '{}'  WHERE specifications IS NULL;
UPDATE products SET pricing_tiers  = '[]'  WHERE pricing_tiers  IS NULL;
UPDATE products SET views = 0              WHERE views IS NULL;

-- ─── 3. supplier_products: columns the supplier form saves ──────
-- Supplier dashboard posts image_url + images[] (up to 3) plus the fields below.
-- images TEXT[] is what the "My Products" thumbnails and the approval copy read.
ALTER TABLE supplier_products
  ADD COLUMN IF NOT EXISTS images          TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS whatsapp        TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS stock_status    TEXT DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS specifications  JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pricing_tiers   JSONB DEFAULT '[]';

-- Approval flow timestamps/notes (already created by earlier migrations,
-- kept here so this file works on a fresh database too).
ALTER TABLE supplier_products
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- ─── 4. Visibility policy for products ──────────────────────────
-- The anon key reads `products` directly (product page, listings, related).
-- Keep hidden products hidden even if status is still 'active':
-- visible only when status = 'active' AND is_active = true.
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active' AND is_active = TRUE);

-- ─── 5. Verify (optional) ────────────────────────────────────────
-- Columns that must exist after running this file:
--   SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'products'
--     AND column_name IN ('is_active','images','whatsapp','stock_status',
--                         'specifications','pricing_tiers','views')
--   ORDER BY column_name;
--
--   SELECT column_name, data_type
--   FROM information_schema.columns
--   WHERE table_name = 'supplier_products'
--     AND column_name IN ('images','whatsapp','stock_status',
--                         'specifications','pricing_tiers','admin_notes','reviewed_at')
--   ORDER BY column_name;
--
-- Approved supplier products now visible on the products page (with images):
--   SELECT id, name, image_url, images, is_active, status
--   FROM products
--   WHERE is_active = TRUE AND status = 'active'
--   ORDER BY created_at DESC
--   LIMIT 20;
--
-- Pending supplier submissions waiting for approval:
--   SELECT id, name, image_url, images, status, created_at
--   FROM supplier_products
--   WHERE status = 'pending'
--   ORDER BY created_at DESC;
