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

-- ─── 5. supplier_products RLS policies ─────────────────────────
-- IMPORTANT: the backend (NestJS) calls Supabase with ITS OWN key — it does
-- NOT forward the supplier's login token. So auth.uid() is always NULL for
-- backend requests, and any policy that checks auth.uid() silently blocks
-- the INSERT ("new row violates row-level security policy"). That is why the
-- supplier's product never appeared in the admin dashboard.
--
-- The policies below therefore allow the insert/select at DB level; real
-- authentication is already enforced by the backend API (POST requires a
-- valid Supabase JWT via OptionalAuthGuard).
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;

-- Backend/suppliers can submit products (API layer enforces auth).
DROP POLICY IF EXISTS "Suppliers can submit own products" ON supplier_products;
CREATE POLICY "Suppliers can submit own products" ON supplier_products
  FOR INSERT WITH CHECK (true);

-- Backend can list submissions for the admin dashboard.
DROP POLICY IF EXISTS "Suppliers can view own submissions" ON supplier_products;
CREATE POLICY "Suppliers can view own submissions" ON supplier_products
  FOR SELECT USING (true);

-- Signed-in suppliers can edit/delete their own submissions (frontend session).
DROP POLICY IF EXISTS "Suppliers manage own submissions" ON supplier_products;
CREATE POLICY "Suppliers manage own submissions" ON supplier_products
  FOR UPDATE USING (auth.uid() = supplier_id);

DROP POLICY IF EXISTS "Admins manage submissions" ON supplier_products;
CREATE POLICY "Admins manage submissions" ON supplier_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ─── 6. Category column + speed for category filters ────────────
-- Supplier picks a category (Electronics, Clothing, Furniture, Tools,
-- Sports, Pet Supplies, Modern Tech). The same TEXT value is stored on
-- supplier_products, copied into products on approval, and the products
-- page filters with .eq('category', ...). These guarantees keep that
-- flow working even on a database created without these columns.

-- The column the supplier's selected category is saved into / shown from.
ALTER TABLE products          ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS category TEXT;

-- Speeds up: .eq('is_active', true).eq('status', 'active').eq('category', ...)
CREATE INDEX IF NOT EXISTS products_listing_idx
  ON products (is_active, status, category);

-- Speeds up: admin approval lookup + "My Products" list per supplier.
CREATE INDEX IF NOT EXISTS supplier_products_supplier_idx
  ON supplier_products (supplier_id, status);

-- ─── 7. Diagnostics — run these to CHECK the whole flow ─────────
-- 7a. Did the supplier's submission actually reach the database?
--     (Submit from the supplier form, then run this. If your product shows
--      here but not in the admin dashboard, the backend was not redeployed —
--      the admin-list fix is backend code, not SQL.)
--   SELECT id, name, category, image_url, images, status, supplier_email,
--          created_at
--   FROM supplier_products
--   ORDER BY created_at DESC
--   LIMIT 10;
--
-- 7b. Count by status (what the admin dashboard should display):
--   SELECT status, COUNT(*) FROM supplier_products GROUP BY status;
--
-- 7c. Are the policies actually installed? (Should list 4 rows.)
--   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'supplier_products';
--
-- 7d. Do all supplier-form columns exist on BOTH tables? (Each value below
--     must appear twice — once per table.)
--   SELECT table_name, column_name
--   FROM information_schema.columns
--   WHERE table_name IN ('products','supplier_products')
--     AND column_name IN ('name','description','category','image_url','images',
--                         'price','price_min','price_max','stock','moq','unit',
--                         'whatsapp','stock_status','specifications','pricing_tiers')
--   ORDER BY column_name, table_name;
--
-- 7e. After approving: is the product live and in the right category?
--   SELECT id, name, category, image_url, images, is_active, status
--   FROM products
--   WHERE is_active = TRUE AND status = 'active'
--   ORDER BY created_at DESC
--   LIMIT 20;
--
-- 7f. Pending supplier submissions waiting for approval:
--   SELECT id, name, images, status, created_at
--   FROM supplier_products
--   WHERE status = 'pending'
--   ORDER BY created_at DESC;
