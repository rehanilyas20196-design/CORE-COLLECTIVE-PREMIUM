-- ================================================================
-- CORE COLLECTIVE — SUPABASE MIGRATION
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ================================================================

-- ─── PART 1: CREATE MISSING TABLES ───────────────────────────────

-- SUPPLIER PROFILES
CREATE TABLE IF NOT EXISTS supplier_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  business_name   TEXT NOT NULL,
  business_type   TEXT,
  registration_no TEXT,
  website         TEXT,
  whatsapp        TEXT,
  description     TEXT,
  logo_url        TEXT,
  banner_url      TEXT,
  location        TEXT,
  city            TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  rating          NUMERIC(3,2) DEFAULT 0,
  total_products  INTEGER DEFAULT 0,
  total_sales     INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','rejected','suspended')),
  rejection_note  TEXT,
  approved_at     TIMESTAMPTZ,
  approved_by     UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  icon          TEXT,
  cover_image   TEXT,
  parent_id     UUID REFERENCES categories(id),
  product_count INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- QUOTES (buyer requests quote from supplier)
CREATE TABLE IF NOT EXISTS quotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      BIGINT REFERENCES products(id),
  supplier_id     UUID REFERENCES supplier_profiles(id),
  buyer_id        UUID REFERENCES profiles(id),
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

-- WISHLIST
CREATE TABLE IF NOT EXISTS wishlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  BIGINT REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- NEWSLETTER
CREATE TABLE IF NOT EXISTS newsletter (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES (chatbot history)
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sender      TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ─── PART 2: ALTER EXISTING TABLES (add missing columns) ───────

-- PROFILES — add role, status, city, country, avatar_url
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role          TEXT DEFAULT 'buyer' CHECK (role IN ('buyer','supplier','admin'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','rejected','suspended'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country       TEXT DEFAULT 'Pakistan';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url    TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone         TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT NOW();

-- PRODUCTS — add slug, images array, price ranges, moq, tiers, specs, etc.
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug            TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images          TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_min       NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_max       NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS moq             INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pricing_tiers   JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications  JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_status    TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock','limited','out_of_stock'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS whatsapp        TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured     BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_verified     BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status          TEXT DEFAULT 'active' CHECK (status IN ('pending','active','rejected','suspended'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS rejection_note  TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS approved_at     TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS approved_by     UUID REFERENCES profiles(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id     UUID REFERENCES supplier_profiles(id) ON DELETE CASCADE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id     UUID REFERENCES categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS views           INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at      TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW();

-- ORDERS — full schema
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_id          UUID REFERENCES profiles(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount      NUMERIC(12,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address  JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method    TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status    TEXT DEFAULT 'unpaid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes             TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at        TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at        TIMESTAMPTZ DEFAULT NOW();

-- ORDER ITEMS
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS order_id     BIGINT REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id   BIGINT REFERENCES products(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS supplier_id  UUID REFERENCES supplier_profiles(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity     INTEGER NOT NULL;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price   NUMERIC(10,2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price  NUMERIC(10,2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ DEFAULT NOW();

-- REVIEWS
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS product_id   BIGINT REFERENCES products(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS buyer_id     UUID REFERENCES profiles(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating       INTEGER CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment      TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved  BOOLEAN DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ DEFAULT NOW();

-- NOTIFICATIONS
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id  UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title    TEXT NOT NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message  TEXT NOT NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type     TEXT DEFAULT 'info' CHECK (type IN ('info','success','warning','error','order','product','account'));
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read  BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link     TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- CONTACT MESSAGES
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS name     TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS email    TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS subject  TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS message  TEXT;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS status   TEXT DEFAULT 'new';
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- DEALS
ALTER TABLE deals ADD COLUMN IF NOT EXISTS title       TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS image_url   TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS price       NUMERIC(10,2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS old_price   NUMERIC(10,2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS discount    INTEGER;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS link        TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_active   BOOLEAN DEFAULT TRUE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ DEFAULT NOW();

-- RECOMMENDED ITEMS
ALTER TABLE recommended_items ADD COLUMN IF NOT EXISTS product_id  BIGINT REFERENCES products(id);
ALTER TABLE recommended_items ADD COLUMN IF NOT EXISTS title       TEXT;
ALTER TABLE recommended_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE recommended_items ADD COLUMN IF NOT EXISTS image_url   TEXT;
ALTER TABLE recommended_items ADD COLUMN IF NOT EXISTS price       NUMERIC(10,2);
ALTER TABLE recommended_items ADD COLUMN IF NOT EXISTS link        TEXT;
ALTER TABLE recommended_items ADD COLUMN IF NOT EXISTS is_active   BOOLEAN DEFAULT TRUE;
ALTER TABLE recommended_items ADD COLUMN IF NOT EXISTS sort_order  INTEGER DEFAULT 0;
ALTER TABLE recommended_items ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ DEFAULT NOW();

-- SUPPLIER PRODUCTS — add contact, stock status, specs, pricing tiers
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS whatsapp          TEXT;
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS stock_status      TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock','limited','out_of_stock'));
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS specifications    JSONB DEFAULT '{}';
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS pricing_tiers     JSONB DEFAULT '[]';


-- ─── PART 3: AUTO-CREATE PROFILE ON SIGNUP ───────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ─── PART 4: ROW LEVEL SECURITY ─────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist           ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Public can insert own profile" ON profiles;
CREATE POLICY "Public can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Supplier Profiles
DROP POLICY IF EXISTS "Public can view active suppliers" ON supplier_profiles;
CREATE POLICY "Public can view active suppliers" ON supplier_profiles
  FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Suppliers can manage own profile" ON supplier_profiles;
CREATE POLICY "Suppliers can manage own profile" ON supplier_profiles
  FOR ALL USING (user_id = auth.uid());

-- Products
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Suppliers can manage own products" ON products;
CREATE POLICY "Suppliers can manage own products" ON products
  FOR ALL USING (supplier_id IN (SELECT id FROM supplier_profiles WHERE user_id = auth.uid()));

-- Categories
DROP POLICY IF EXISTS "Public can view categories" ON categories;
CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (is_active = TRUE);

-- Orders
DROP POLICY IF EXISTS "Buyers can view own orders" ON orders;
CREATE POLICY "Buyers can view own orders" ON orders
  FOR SELECT USING (buyer_id = auth.uid());

-- Notifications
DROP POLICY IF EXISTS "Users see own notifications" ON notifications;
CREATE POLICY "Users see own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Wishlist
DROP POLICY IF EXISTS "Users manage own wishlist" ON wishlist;
CREATE POLICY "Users manage own wishlist" ON wishlist
  FOR ALL USING (user_id = auth.uid());

-- Messages
DROP POLICY IF EXISTS "Users manage own messages" ON messages;
CREATE POLICY "Users manage own messages" ON messages
  FOR ALL USING (user_id = auth.uid());

-- Reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
CREATE POLICY "Public can view approved reviews" ON reviews
  FOR SELECT USING (is_approved = TRUE);

-- Quotes
DROP POLICY IF EXISTS "Buyers can view own quotes" ON quotes;
CREATE POLICY "Buyers can view own quotes" ON quotes
  FOR SELECT USING (buyer_id = auth.uid());
DROP POLICY IF EXISTS "Suppliers can view assigned quotes" ON quotes;
CREATE POLICY "Suppliers can view assigned quotes" ON quotes
  FOR SELECT USING (supplier_id IN (SELECT id FROM supplier_profiles WHERE user_id = auth.uid()));


-- ─── PART 5: STORAGE BUCKETS ─────────────────────────────────────

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('supplier-logos', 'supplier-logos', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', TRUE) ON CONFLICT (id) DO NOTHING;

-- Allow public read on all buckets
DROP POLICY IF EXISTS "Public can view storage objects" ON storage.objects;
CREATE POLICY "Public can view storage objects" ON storage.objects
  FOR SELECT USING (bucket_id IN ('product-images', 'supplier-logos', 'avatars', 'banners'));

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('product-images', 'supplier-logos', 'avatars', 'banners')
    AND auth.role() = 'authenticated'
  );

-- Allow users to delete their own uploads
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
CREATE POLICY "Users can delete own uploads" ON storage.objects
  FOR DELETE USING (auth.uid() = owner);


-- ─── PART 6: SEED CATEGORIES (optional — for dev) ───────────────

INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Electronics', 'electronics', '💻', 1),
  ('Clothing', 'clothing', '👕', 2),
  ('Home & Living', 'home-living', '🏠', 3),
  ('Sports & Outdoors', 'sports-outdoors', '⚽', 4),
  ('Pet Supplies', 'pet-supplies', '🐾', 5),
  ('Tools & Hardware', 'tools-hardware', '🔧', 6),
  ('Beauty & Personal Care', 'beauty-personal-care', '💄', 7),
  ('Food & Beverage', 'food-beverage', '🍕', 8)
ON CONFLICT (slug) DO NOTHING;
