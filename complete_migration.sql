-- ================================================================
-- CORE COLLECTIVE — COMPLETE SUPABASE MIGRATION
-- Run ALL of this in Supabase SQL Editor
-- ================================================================

-- ─── PROFILES TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  full_name  TEXT,
  phone      TEXT DEFAULT '',
  role       TEXT DEFAULT 'buyer' CHECK (role IN ('buyer','supplier','admin')),
  status     TEXT DEFAULT 'active' CHECK (status IN ('pending','active','rejected','suspended')),
  city       TEXT DEFAULT '',
  country    TEXT DEFAULT 'Pakistan',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PRODUCTS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             BIGSERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  description    TEXT,
  category       TEXT,
  image_url      TEXT,
  images         TEXT[] DEFAULT '{}',
  price          NUMERIC(10,2),
  price_min      NUMERIC(10,2),
  price_max      NUMERIC(10,2),
  stock          INTEGER DEFAULT 0,
  moq            INTEGER DEFAULT 1,
  unit           TEXT DEFAULT 'Pcs',
  supplier_name  TEXT,
  rating         NUMERIC(3,2) DEFAULT 0,
  review_count   INTEGER DEFAULT 0,
  is_verified    BOOLEAN DEFAULT FALSE,
  is_featured    BOOLEAN DEFAULT FALSE,
  status         TEXT DEFAULT 'active',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORDERS TABLE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID REFERENCES profiles(id),
  user_email        TEXT,
  full_name         TEXT,
  phone_number      TEXT,
  province          TEXT,
  city              TEXT,
  area              TEXT,
  building_street   TEXT,
  colony_suburb     TEXT,
  address           TEXT,
  label             TEXT DEFAULT 'HOME',
  total_amount      NUMERIC(12,2),
  payment_method    TEXT,
  payment_screenshot TEXT,
  items             JSONB DEFAULT '[]',
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','delivered')),
  tracking_status   TEXT DEFAULT 'pending',
  tracking_history  JSONB DEFAULT '[]',
  admin_notes       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATIONS TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT DEFAULT 'info' CHECK (type IN ('info','success','error','pending')),
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  data       JSONB DEFAULT '{}',
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SUPPLIER INQUIRIES TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS supplier_inquiries (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id),
  user_email   TEXT,
  user_name    TEXT,
  item_name    TEXT NOT NULL,
  details      TEXT,
  quantity     INTEGER NOT NULL,
  unit         TEXT DEFAULT 'Pcs',
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes  TEXT,
  supplier_ref TEXT,
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DISCOUNT MESSAGES TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS discount_messages (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id),
  user_email  TEXT,
  user_name   TEXT,
  message     TEXT NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_reply TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CART TABLE ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id   BIGINT REFERENCES products(id) ON DELETE CASCADE,
  qty          INTEGER DEFAULT 1,
  product_data JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ─── FAVORITES TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id   BIGINT REFERENCES products(id) ON DELETE CASCADE,
  product_data JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ─── REVIEWS TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          BIGSERIAL PRIMARY KEY,
  product_id  BIGINT REFERENCES products(id),
  user_id     UUID REFERENCES profiles(id),
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DEALS TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT,
  description TEXT,
  image_url   TEXT,
  price       NUMERIC(10,2),
  old_price   NUMERIC(10,2),
  discount    INTEGER,
  link        TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RECOMMENDED ITEMS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommended_items (
  id          BIGSERIAL PRIMARY KEY,
  product_id  BIGINT REFERENCES products(id),
  title       TEXT,
  description TEXT,
  image_url   TEXT,
  price       NUMERIC(10,2),
  link        TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MESSAGES TABLE (chatbot) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sender     TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CONTACT MESSAGES TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT,
  email      TEXT,
  subject    TEXT,
  message    TEXT,
  status     TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SUPPLIER PRODUCTS TABLE (products awaiting admin approval) ─
CREATE TABLE IF NOT EXISTS supplier_products (
  id             BIGSERIAL PRIMARY KEY,
  supplier_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_email TEXT,
  supplier_name  TEXT,
  name           TEXT NOT NULL,
  description    TEXT,
  category       TEXT,
  image_url      TEXT,
  images         TEXT[] DEFAULT '{}',
  price          NUMERIC(10,2),
  price_min      NUMERIC(10,2),
  price_max      NUMERIC(10,2),
  stock          INTEGER DEFAULT 0,
  moq            INTEGER DEFAULT 1,
  unit           TEXT DEFAULT 'Pcs',
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes    TEXT,
  reviewed_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on supplier_products
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;

-- ─── BUY REQUESTS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS buy_requests (
  id             BIGSERIAL PRIMARY KEY,
  product_id     BIGINT REFERENCES products(id) ON DELETE CASCADE,
  product_name   TEXT,
  product_image  TEXT,
  user_id        UUID REFERENCES profiles(id),
  user_email     TEXT,
  user_name      TEXT,
  phone          TEXT,
  quantity       INTEGER DEFAULT 1,
  message        TEXT,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes    TEXT,
  reviewed_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NEWSLETTER TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter (
  id         BIGSERIAL PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────────
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

-- ─── STORAGE BUCKETS ────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('Background', 'Background', TRUE) ON CONFLICT (id) DO NOTHING;
