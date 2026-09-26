-- ================================================================
-- ADMIN PANEL + SUPPLIER PRODUCT FLOW — COMPLETE QUERY FILE
-- Run in Supabase SQL Editor: https://supabase.com/dashboard
--
-- ★ RUN THIS WHOLE FILE AS-IS — NO ERRORS, FIXES THE RECURSION BUG ★
--
-- v2 CHANGES (why your last run gave 500 "infinite recursion"):
--   Policies on `profiles` that queried `profiles` (and supplier_products
--   policies that queried `profiles`) created a policy-calling-itself loop.
--   The fix is the standard Supabase pattern: a SECURITY DEFINER function
--   is_admin() — its inner query BYPASSES RLS, so no recursion is possible.
--   Every policy below now calls is_admin() instead of querying profiles.
--
-- HOW TO USE THE TEMPLATES (PARTS B, D, E, F):
--   They are COMMENTED OUT. Copy a block, remove the leading "--",
--   replace [FILL: ...] / id = 1 with real values, run just that block.
--
-- FLOW
--   Supplier submits (form or PART B) -> supplier_products, status='pending'
--     -> Admin Panel "Pending Products" shows it (direct Supabase read)
--   Admin approves (button or PART D) -> copied into products,
--     is_active=TRUE, status='active' -> LIVE on /products under the
--     CATEGORY THE SUPPLIER SELECTED
-- ================================================================


-- ════════════════════════════════════════════════════════════════
-- PART A — ONE-TIME SETUP  (ACTIVE — run once; safe to re-run)
-- ════════════════════════════════════════════════════════════════

-- A0. THE RECURSION FIX — admin check that bypasses RLS.
--     SECURITY DEFINER = runs as table owner, so its SELECT on profiles
--     does NOT re-trigger profile policies. No recursion possible.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

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

-- A3. RLS — all policies use is_admin(); NONE of them query profiles
--     directly, so the recursion bug cannot come back.
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Suppliers can submit own products" ON supplier_products;
CREATE POLICY "Suppliers can submit own products" ON supplier_products
  FOR INSERT WITH CHECK (auth.uid() = supplier_id);

DROP POLICY IF EXISTS "Suppliers can view own submissions" ON supplier_products;
CREATE POLICY "Suppliers can view own submissions" ON supplier_products
  FOR SELECT USING (auth.uid() = supplier_id OR is_admin());

DROP POLICY IF EXISTS "Suppliers manage own submissions" ON supplier_products;
CREATE POLICY "Suppliers manage own submissions" ON supplier_products
  FOR UPDATE USING (auth.uid() = supplier_id);

DROP POLICY IF EXISTS "Suppliers delete own submissions" ON supplier_products;
CREATE POLICY "Suppliers delete own submissions" ON supplier_products
  FOR DELETE USING (auth.uid() = supplier_id);

DROP POLICY IF EXISTS "Admins manage submissions" ON supplier_products;
DROP POLICY IF EXISTS "Admins manage all submissions" ON supplier_products;
CREATE POLICY "Admins manage all submissions" ON supplier_products
  FOR ALL USING (is_admin());

-- products: public reads + admin writes (via is_admin()).
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active' AND is_active = TRUE);

DROP POLICY IF EXISTS "Admins can add approved products" ON products;
CREATE POLICY "Admins can add approved products" ON products
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (is_admin());

-- profiles: admins can read the users list (Users tab reads it directly).
-- is_admin() bypasses RLS on profiles, so this does NOT recurse.
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

-- notifications: users manage their own; ADMIN can insert notifications for
-- any user (Send to Specific User / broadcast) and see/delete all of them.
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own notifications" ON notifications;
CREATE POLICY "Users see own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can send notifications" ON notifications;
CREATE POLICY "Admins can send notifications" ON notifications
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;
CREATE POLICY "Admins can delete notifications" ON notifications
  FOR DELETE USING (is_admin());

-- A4. Indexes for the category filter + admin lists.
CREATE INDEX IF NOT EXISTS products_listing_idx
  ON products (is_active, status, category);

CREATE INDEX IF NOT EXISTS supplier_products_supplier_idx
  ON supplier_products (supplier_id, status);

-- A5. One-time: promote yourself to admin (edit the email if needed).
UPDATE profiles SET role = 'admin' WHERE email = 'hinata4020196@gmail.com';


-- ════════════════════════════════════════════════════════════════
-- PART B — SUPPLIER ADDS A PRODUCT -> lands in ADMIN PANEL
--          (TEMPLATE — uncomment, fill, run. The dashboard form does
--           this automatically; you rarely need this by hand.)
--          Category must be EXACTLY one of: Electronics / Clothing /
--          Furniture / Tools / Sports / Pet Supplies / Modern Tech
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
--          selected category  (TEMPLATE — replace id = 1, then run)
--          This is the SQL equivalent of clicking "Approve".
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
-- PART E — ADMIN REJECTS  (TEMPLATE — replace id + reason, then run)
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
-- Admin deletes a product from the website:
-- DELETE FROM products WHERE id = 123;


-- ════════════════════════════════════════════════════════════════
-- PART G — VERIFY  (ACTIVE — read-only)
-- ════════════════════════════════════════════════════════════════

-- G1. Am I admin? (Must return t with YOUR session, or run as-is in editor.)
SELECT is_admin() AS you_are_admin;

-- G2. Live products per category (what the website shows):
SELECT category, COUNT(*) AS visible_products
FROM products
WHERE is_active = TRUE AND status = 'active' AND category IS NOT NULL
GROUP BY category
ORDER BY visible_products DESC;

-- G3. Newest live products with images:
SELECT id, name, category, image_url, images, is_active, status
FROM products
WHERE is_active = TRUE AND status = 'active'
ORDER BY created_at DESC
LIMIT 20;

-- G4. Policies installed? Should list: supplier_products x5,
--     products x3, profiles x1 (+ any base-migration policies).
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('products', 'supplier_products', 'profiles')
ORDER BY tablename, policyname;


-- ════════════════════════════════════════════════════════════════
-- PART H — REPAIR: approved products with MISSING images  (ACTIVE)
--           Fixes products that were approved BEFORE the images copy
--           existed (old backend): copies image_url + images from the
--           supplier's original submission, matched by product name.
--           Only fills EMPTY values — never overwrites existing ones.
-- ════════════════════════════════════════════════════════════════

-- H1. Show what's actually stored on the newest live products:
--     if images = {} here, that product was approved without its images.
SELECT id, name, image_url, images, created_at
FROM products
WHERE is_active = TRUE AND status = 'active'
ORDER BY created_at DESC
LIMIT 10;

-- H2. AUTO-REPAIR — fill missing images from the supplier's submission.
UPDATE products p
SET image_url = sp.image_url,
    images    = sp.images
FROM (
  SELECT DISTINCT ON (name) name, image_url, images
  FROM supplier_products
  WHERE status = 'approved'
    AND (array_length(images, 1) > 0 OR COALESCE(image_url, '') <> '')
  ORDER BY name, created_at DESC        -- latest submission per name
) sp
WHERE p.name = sp.name
  AND (p.images IS NULL OR p.images = '{}')   -- only when website copy is empty
  AND (COALESCE(p.image_url, '') = '');

-- H3. Find DEAD image links (browsers show a placeholder for these).
--     Every URL below must return 200. Any 404/403 row = broken link:
--     re-upload the image and paste the DIRECT image link (ends in .jpg/.png/.webp).
SELECT p.id, p.name, img
FROM products p
CROSS JOIN LATERAL unnest(COALESCE(NULLIF(p.images, '{}'), ARRAY[p.image_url])) AS img
WHERE p.is_active = TRUE
  AND img IS NOT NULL AND img <> '';
-- Then open each URL in a browser tab. Replace dead ones directly:
-- UPDATE products SET images = ARRAY['https://NEW-LINK.jpg'] WHERE id = 123;
-- UPDATE products SET image_url = 'https://NEW-LINK.jpg' WHERE id = 123;
