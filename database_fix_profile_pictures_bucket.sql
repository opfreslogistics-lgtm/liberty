-- ============================================
-- FIX PROFILE PICTURES BUCKET
-- ============================================
-- Run this script in Supabase SQL Editor
-- Creates the profile-pictures bucket and RLS policies
-- ============================================

-- ============================================
-- STEP 1: CREATE PROFILE PICTURES BUCKET
-- ============================================
-- Note: If you get permission errors, you may need to create the bucket manually
-- in Supabase Dashboard > Storage > Create Bucket
-- Name: profile-pictures
-- Public: Yes

-- Try to create the bucket if it doesn't exist
DO $$
BEGIN
  -- Check if bucket exists
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'profile-pictures'
  ) THEN
    -- Create the bucket
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('profile-pictures', 'profile-pictures', true);
  ELSE
    -- Update bucket to ensure it's public
    UPDATE storage.buckets 
    SET public = true 
    WHERE id = 'profile-pictures';
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges to create bucket. Please create it manually in Supabase Dashboard > Storage > Create Bucket (name: profile-pictures, public: yes)';
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating bucket: %', SQLERRM;
END $$;

-- ============================================
-- STEP 2: CREATE STORAGE POLICIES FOR PROFILE PICTURES
-- ============================================

-- Users can upload their own profile pictures
DROP POLICY IF EXISTS "Users can upload own profile pictures" ON storage.objects;
CREATE POLICY "Users can upload own profile pictures"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can view profile pictures (public bucket)
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
CREATE POLICY "Anyone can view profile pictures"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'profile-pictures');

-- Also allow public (unauthenticated) access for viewing
DROP POLICY IF EXISTS "Public can view profile pictures" ON storage.objects;
CREATE POLICY "Public can view profile pictures"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-pictures');

-- Users can update their own profile pictures
DROP POLICY IF EXISTS "Users can update own profile pictures" ON storage.objects;
CREATE POLICY "Users can update own profile pictures"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own profile pictures
DROP POLICY IF EXISTS "Users can delete own profile pictures" ON storage.objects;
CREATE POLICY "Users can delete own profile pictures"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can manage all profile pictures
DROP POLICY IF EXISTS "Admins can manage all profile pictures" ON storage.objects;
CREATE POLICY "Admins can manage all profile pictures"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'profile-pictures'
    AND is_admin(auth.uid())
  )
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND is_admin(auth.uid())
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'profile-pictures';

-- Check policies:
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'objects' 
-- AND policyname LIKE '%profile%'
-- ORDER BY policyname;

-- ============================================
-- COMPLETE!
-- ============================================
-- The profile-pictures bucket has been created with:
-- 1. ✅ Public bucket (anyone can view)
-- 2. ✅ Users can upload to their own folder ({user_id}/profile.{ext})
-- 3. ✅ Users can update/delete their own pictures
-- 4. ✅ Admins can manage all profile pictures
-- 
-- Users can now upload profile pictures from the settings page!

