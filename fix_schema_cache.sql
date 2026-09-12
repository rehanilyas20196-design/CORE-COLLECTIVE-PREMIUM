-- ================================================================
-- CORE COLLECTIVE — FIX SCHEMA CACHE (missing reviewed_at columns)
-- Run ALL of this in Supabase SQL Editor
-- ================================================================

-- ─── 1. ADD MISSING reviewed_at COLUMNS ──────────────────────────

ALTER TABLE buy_requests
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE supplier_products
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE supplier_inquiries
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE discount_messages
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- ─── 2. REFRESH POSTGREST SCHEMA CACHE ───────────────────────────
-- This forces Supabase's PostgREST to re-detect the new columns
-- so the API doesn't return schema cache errors.

NOTIFY pgrst, 'reload schema';

-- Alternative if the above doesn't work — select from the table
-- to verify the columns now exist:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'buy_requests'
  AND column_name = 'reviewed_at';
