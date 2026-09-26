-- ================================================================
-- PROFILE PICTURE (AVATAR) UPLOAD — RUN ONCE
-- Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- Creates the public `avatars` storage bucket and the RLS policies
-- that let a signed-in user upload/replace only their own picture.
-- Files are stored as:  avatars/<user-id>/avatar-<timestamp>.<ext>
-- The <user-id> folder is what the policies check, so one user can
-- never overwrite another user's picture.
-- ================================================================


-- ─── 1. THE BUCKET ─────────────────────────────────────────────
-- Safe to re-run. public = TRUE so the image can be displayed
-- without a signed URL.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;


-- ─── 2. READ: anyone can view an avatar ────────────────────────
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');


-- ─── 3. UPLOAD: only into your own <user-id> folder ────────────
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- ─── 4. UPDATE: only your own avatar ───────────────────────────
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- ─── 5. DELETE: only your own avatar ───────────────────────────
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- ─── 6. MAKE SURE profiles.avatar_url EXISTS ───────────────────
-- (It already exists in your database — this is just a safety net.)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;


-- ════════════════════════════════════════════════════════════════
-- VERIFY — run these after the setup above
-- ════════════════════════════════════════════════════════════════

-- V1. Bucket created and public?  -> avatars | t
SELECT id, public FROM storage.buckets WHERE id = 'avatars';

-- V2. Four policies installed?  -> should list 4 rows
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE '%avatar%'
ORDER BY policyname;

-- V3. Column present?  -> avatar_url
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'avatar_url';

-- V4. Who already has a picture?
SELECT id, full_name, email, avatar_url FROM profiles
WHERE avatar_url IS NOT NULL AND avatar_url <> '';
