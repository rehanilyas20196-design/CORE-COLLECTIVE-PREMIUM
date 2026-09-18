-- ================================================================
-- CORE COLLECTIVE — FIX cart_items SCHEMA (qty / product_data)
-- Run ONCE in Supabase SQL Editor, then reload the site.
-- -----------------------------------------------------------------
-- Fixes: "Could not find the 'qty' column of 'cart_items' in the
-- schema cache" (500 on /api/cart/* and checkout).
-- ================================================================

-- 1) The app uses `qty`, but the live table has `quantity` instead.
--    Rename it (existing cart rows keep their values), or create it.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'quantity'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'qty'
  ) THEN
    ALTER TABLE cart_items RENAME COLUMN quantity TO qty;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'qty'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN qty INTEGER DEFAULT 1;
  END IF;
END $$;

-- Backfill any missing qty values (never NULL).
UPDATE cart_items SET qty = COALESCE(qty, 1);

-- 2) The frontend spreads `product_data` when loading the cart.
ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS product_data JSONB DEFAULT '{}';

-- 3) Refresh PostgREST's schema cache so the API sees the new columns
--    immediately (avoids "schema cache" errors without waiting).
NOTIFY pgrst, 'reload schema';

-- 4) Optional verification.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cart_items'
ORDER BY ordinal_position;