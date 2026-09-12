-- ================================================================
-- CORE COLLECTIVE — DATABASE UPDATE
-- Run ALL of this in Supabase SQL Editor
-- ================================================================

-- ─── 1. ADD NEW COLUMNS TO supplier_products ─────────────────────
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS whatsapp          TEXT;
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS stock_status      TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock','limited','out_of_stock'));
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS specifications    JSONB DEFAULT '{}';
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS pricing_tiers     JSONB DEFAULT '[]';

-- ─── 2. FIX TRIGGER — make it tolerant so auth signup doesn't fail ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, status, city)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    'active',
    COALESCE(NEW.raw_user_meta_data->>'city', '')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user skipped for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
