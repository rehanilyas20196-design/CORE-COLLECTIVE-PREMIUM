-- ================================================================
-- ADMIN PANEL + SUPPLIER PRODUCT FLOW — COMPLETE QUERY FILE
-- Run in Supabase SQL Editor: https://supabase.com/dashboard
--
-- ★ YOU CAN RUN THIS WHOLE FILE AS-IS — NO ERRORS. ★
-- Only PART A (setup) and read-only SELECT checks are active.
-- The INSERT/UPDATE templates (PART B, D, E, F) are COMMENTED OUT
-- because you must fill in your own values first. To use one:
--   1. Copy that PART's block into the editor
--   2. Remove the leading "--" on each line
--   3. Replace every [FILL: ...] or id = 1 with your real value
--   4. Run just that block
--
-- FLOW SUMMARY
--   Supplier adds product (dashboard form, or PART B)
--     -> row in supplier_products with status='pending'
--     -> appears in Admin Panel -> "Pending Products"
--   Admin confirms (Approve button, or PART D)
--     -> copied into products with is_active=TRUE, status='active'
--     -> LIVE on /products under the CATEGORY THE SUPPLIER SELECTED
-- ================================================================


-- ════════════════════════════════════════════════════════════════
-- PART A — ONE-TIME SETUP  (ACTIVE — run once; safe to re-run)
-- ════════════════════════════════════════════════════════════════

-- A1. products: every column the approve/website flow needs.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category        TEXT,
  ADD COLUMN IF NOT EXISTS images          TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS whatsapp        TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS stock_status    TEXT DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS specifications  JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pricing_tiers   JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS views           INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moq             INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit            TEXT DEFAULT 'Pcs',
  ADD COLUMN IF NOT EXISTS supplier_name   TEXT,
  ADD COLUMN IF NOT EXISTS is_verified     BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_active       BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS status          TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS rating          NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count    INTEGER DEFAULT 0;

UPDATE products SET is_active      = TRUE       WHERE is_active      IS NULL;
UPDATE products SET status         = 'active'   WHERE status         IS NULL;
UPDATE products SET stock_status   = 'in_stock' WHERE stock_status   IS NULL;
UPDATE products SET specifications = '{}'       WHERE specifications IS NULL;
UPDATE products SET pricing_tiers  = '[]'       WHERE pricing_tiers  IS NULL;
UPDATE products SET views          = 0          WHERE views          IS NULL;

-- A2. supplier_products: every column the supplier form saves.
ALTER TABLE supplier_products
  ADD COLUMN IF NOT EXISTS images          TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS whatsapp        TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS stock_status    TEXT DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS specifications  JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pricing_tiers   JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS admin_notes     TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at     TIMESTAMPTZ;

-- A3. RLS — works BOTH ways: the backend (service key) bypasses RLS, and
--     the frontend (logged-in supplier session) is allowed directly below.
--     auth.uid() = the logged-in user's id from their Supabase session.
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Suppliers can submit own products" ON supplier_products;
CREATE POLICY "Suppliers can submit own products" ON supplier_products
  FOR INSERT WITH CHECK (auth.uid() = supplier_id);

DROP POLICY IF EXISTS "Suppliers can view own submissions" ON supplier_products;
CREATE POLICY "Suppliers can view own submissions" ON supplier_products
  FOR SELECT USING (
    auth.uid() = supplier_id
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Suppliers manage own submissions" ON supplier_products;
CREATE POLICY "Suppliers manage own submissions" ON supplier_products
  FOR UPDATE USING (auth.uid() = supplier_id);

DROP POLICY IF EXISTS "Suppliers delete own submissions" ON supplier_products;
CREATE POLICY "Suppliers delete own submissions" ON supplier_products
  FOR DELETE USING (auth.uid() = supplier_id);

DROP POLICY IF EXISTS "Admins manage all submissions" ON supplier_products;
CREATE POLICY "Admins manage all submissions" ON supplier_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admin needs to read the users list directly from profiles
-- (Admin Panel -> Users tab reads it with the admin's own session).
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- A4. Indexes for the category filter + admin lists.
CREATE INDEX IF NOT EXISTS products_listing_idx
  ON products (is_active, status, category);

CREATE INDEX IF NOT EXISTS supplier_products_supplier_idx
  ON supplier_products (supplier_id, status);

-- products: public website reads need status='active' AND is_active=TRUE.
-- Admin writes to products (approve) happen with the admin's own session.
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active' AND is_active = TRUE);

DROP POLICY IF EXISTS "Admins can add approved products" ON products;
CREATE POLICY "Admins can add approved products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- ════════════════════════════════════════════════════════════════
-- PART B — SUPPLIER ADDS A PRODUCT -> lands in ADMIN PANEL
--          (TEMPLATE — comment, fill, then run)
--          Normally the supplier uses his dashboard form instead.
--          Category must be EXACTLY one of:
--          Electronics / Clothing / Furniture / Tools / Sports /
--          Pet Supplies / Modern Tech
-- ════════════════════════════════════════════════════════════════

-- INSERT INTO supplier_products (
--   supplier_id, supplier_email, supplier_name,
--   name, description, category,
--   image_url, images,
--   price, price_min, price_max,
--   stock, moq, unit,
--   whatsapp, stock_status,
--   specifications, pricing_tiers,
--   status
-- ) VALUES (
--   (SELECT id FROM profiles WHERE email = '[FILL: supplier login email]'),
--   '[FILL: supplier email]',
--   '[FILL: supplier name]',
--   '[FILL: product name]',
--   '[FILL: description]',
--   '[FILL: category]',
--   '[FILL: main image link]',
--   ARRAY['[FILL: main image link]', '[FILL: image 2]', '[FILL: image 3]'],
--   [FILL: price], [FILL: min price or NULL], [FILL: max price or NULL],
--   [FILL: stock], 1, 'Pcs',
--   '[FILL: whatsapp or '']', 'in_stock',
--   '{}'::jsonb, '[]'::jsonb,
--   'pending'   -- <- this makes it appear in the ADMIN PANEL
-- );


-- ════════════════════════════════════════════════════════════════
-- PART C — ADMIN: SEE PENDING PRODUCTS  (ACTIVE — read-only)
-- ════════════════════════════════════════════════════════════════

SELECT id, name, category, image_url, images, price, price_min, price_max,
       stock, moq, unit, whatsapp, stock_status, specifications, pricing_tiers,
       supplier_name, supplier_email, created_at
FROM supplier_products
WHERE status = 'pending'
ORDER BY created_at DESC;

SELECT status, COUNT(*) FROM supplier_products GROUP BY status;


-- ════════════════════════════════════════════════════════════════
-- PART D — ADMIN CONFIRMS -> product goes LIVE in the supplier's
--          selected category  (TEMPLATE — fill id, then run)
--          Replace id = 1 with the pending product's id from PART C.
--          (This is the SQL equivalent of clicking "Approve".)
-- ════════════════════════════════════════════════════════════════

-- BEGIN;
--
-- INSERT INTO products (
--   name, description, category,
--   image_url, images,
--   price, price_min, price_max,
--   stock, moq, unit,
--   whatsapp, stock_status,
--   specifications, pricing_tiers,
--   supplier_name,
--   is_verified, is_active, status,
--   rating, review_count
-- )
-- SELECT
--   name, description, category,
--   image_url, images,
--   price, price_min, price_max,
--   stock, moq, unit,
--   COALESCE(whatsapp, ''), COALESCE(stock_status, 'in_stock'),
--   COALESCE(specifications, '{}'::jsonb), COALESCE(pricing_tiers, '[]'::jsonb),
--   COALESCE(supplier_name, 'Supplier'),
--   TRUE, TRUE, 'active',
--   0, 0
-- FROM supplier_products
-- WHERE id = 1              -- <<< REPLACE with the pending product's id
--   AND status = 'pending';
--
-- UPDATE supplier_products
-- SET status = 'approved', reviewed_at = NOW()
-- WHERE id = 1 AND status = 'pending';   -- <<< REPLACE id too
--
-- INSERT INTO notifications (user_id, type, title, message, data)
-- SELECT supplier_id, 'success', 'Product Approved',
--        'Your product "' || name || '" has been approved and is now live on the marketplace!',
--        jsonb_build_object('supplier_product_id', id)
-- FROM supplier_products
-- WHERE id = 1;             -- <<< REPLACE id too
--
-- COMMIT;


-- ════════════════════════════════════════════════════════════════
-- PART E — ADMIN REJECTS  (TEMPLATE — fill id + reason, then run)
-- ════════════════════════════════════════════════════════════════

-- UPDATE supplier_products
-- SET status = 'rejected', reviewed_at = NOW(), admin_notes = '[FILL: reason]'
-- WHERE id = 1 AND status = 'pending';   -- <<< REPLACE id
--
-- INSERT INTO notifications (user_id, type, title, message, data)
-- SELECT supplier_id, 'error', 'Product Rejected',
--        'Your product "' || name || '" has been rejected. Reason: [FILL: reason]',
--        jsonb_build_object('supplier_product_id', id)
-- FROM supplier_products
-- WHERE id = 1;             -- <<< REPLACE id


-- ════════════════════════════════════════════════════════════════
-- PART F — ADMIN ADDS A PRODUCT DIRECTLY TO THE WEBSITE
--          (TEMPLATE — fill your own values, then run. No approval
--           needed; goes live immediately.)
-- ════════════════════════════════════════════════════════════════

-- INSERT INTO products (
--   name, description, category,
--   image_url, images,
--   price, price_min, price_max,
--   stock, moq, unit,
--   whatsapp, stock_status,
--   specifications, pricing_tiers,
--   supplier_name,
--   is_verified, is_active, status,
--   rating, review_count
-- ) VALUES (
--   '[FILL: product name]',
--   '[FILL: description]',
--   '[FILL: category]',              -- Electronics / Clothing / Furniture /
--                                    -- Tools / Sports / Pet Supplies / Modern Tech
--   '[FILL: main image link]',
--   ARRAY['[FILL: main image link]', '[FILL: image 2]', '[FILL: image 3]'],
--   [FILL: price],                   -- e.g. 999.00
--   [FILL: min price or NULL],
--   [FILL: max price or NULL],
--   [FILL: stock],                   -- e.g. 50
--   1,                               -- MOQ
--   'Pcs',                           -- Pcs / Kg / Ltr / Meter / Box / Set
--   '[FILL: whatsapp or '']',
--   'in_stock',                      -- in_stock / limited / out_of_stock
--   '{}'::jsonb,                     -- or '{"Color": "Red"}'::jsonb
--   '[]'::jsonb,                     -- or '[{"min_qty": 10, "price": 899}]'::jsonb
--   'Admin',
--   TRUE, TRUE, 'active',
--   0, 0
-- );
--
-- Minimal version — only essentials:
-- INSERT INTO products (name, category, image_url, images, price, stock, moq, unit, supplier_name, is_verified, is_active, status)
-- VALUES (
--   '[FILL: product name]',
--   '[FILL: category]',
--   '[FILL: main image link]',
--   ARRAY['[FILL: main image link]', '[FILL: image 2]', '[FILL: image 3]'],
--   [FILL: price],
--   [FILL: stock],
--   1,
--   'Pcs',
--   'Admin',
--   TRUE, TRUE, 'active'
-- );
--
-- Admin deletes a product from the website:
-- DELETE FROM products WHERE id = 123;


-- ════════════════════════════════════════════════════════════════
-- PART G — VERIFY  (ACTIVE — read-only)
-- ════════════════════════════════════════════════════════════════

-- G1. Live products per category (what the website shows):
SELECT category, COUNT(*) AS visible_products
FROM products
WHERE is_active = TRUE AND status = 'active' AND category IS NOT NULL
GROUP BY category
ORDER BY visible_products DESC;

-- G2. Newest live products with images:
SELECT id, name, category, image_url, images, is_active, status
FROM products
WHERE is_active = TRUE AND status = 'active'
ORDER BY created_at DESC
LIMIT 20;

-- G3. Policies installed? (supplier_products: 3 rows, products: 1 row)
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('products', 'supplier_products')
ORDER BY tablename, policyname;

-- G4. Columns on BOTH tables? (each name should appear twice)
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_name IN ('products', 'supplier_products')
  AND column_name IN ('category','image_url','images','price','price_min',
                      'price_max','stock','moq','unit','whatsapp','stock_status',
                      'specifications','pricing_tiers')
ORDER BY column_name, table_name;
