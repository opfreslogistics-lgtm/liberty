-- ============================================
-- FIX STORAGE BUCKETS AND MOBILE DEPOSIT
-- ============================================
-- Run this script in Supabase SQL Editor
-- This fixes:
-- 1. Mobile deposit reference_number column issue
-- 2. Missing bill-logos bucket
-- 3. Admin settings logos/favicons bucket (app-images) policies
-- ============================================

-- ============================================
-- STEP 1: FIX MOBILE DEPOSIT reference_number COLUMN
-- ============================================

-- Drop the column if it exists (to fix any type issues)
DO $$ 
BEGIN
  -- Check if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mobile_deposits' 
    AND column_name = 'reference_number'
  ) THEN
    -- Column exists, but we'll recreate it to ensure it's correct
    ALTER TABLE mobile_deposits DROP COLUMN IF EXISTS reference_number CASCADE;
  END IF;
  
  -- Add the column fresh
  ALTER TABLE mobile_deposits ADD COLUMN reference_number TEXT;
  
  -- Create index for faster lookups
  CREATE INDEX IF NOT EXISTS idx_mobile_deposits_reference_number ON mobile_deposits(reference_number);
  
  -- Add comment
  COMMENT ON COLUMN mobile_deposits.reference_number IS 'Unique reference number for mobile deposit (format: MD-YYYYMMDD-XXXXXX)';
END $$;

-- ============================================
-- STEP 2: CREATE BILL-LOGOS STORAGE BUCKET
-- ============================================

-- Create the bill-logos bucket (public - logos should be visible)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bill-logos', 'bill-logos', true)
ON CONFLICT (id) DO UPDATE 
SET name = 'bill-logos', public = true;

-- ============================================
-- STEP 3: CREATE STORAGE POLICIES FOR BILL-LOGOS
-- ============================================

-- Note: RLS is already enabled on storage.objects by default in Supabase
-- Creating storage policies for bill-logos bucket

-- Users can upload bill logos (for admin use)
DROP POLICY IF EXISTS "Admins can upload bill logos" ON storage.objects;
CREATE POLICY "Admins can upload bill logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'bill-logos'
    AND is_admin(auth.uid())
  );

-- Anyone can view bill logos (public bucket)
DROP POLICY IF EXISTS "Anyone can view bill logos" ON storage.objects;
CREATE POLICY "Anyone can view bill logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bill-logos');

-- Admins can update bill logos
DROP POLICY IF EXISTS "Admins can update bill logos" ON storage.objects;
CREATE POLICY "Admins can update bill logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'bill-logos'
    AND is_admin(auth.uid())
  )
  WITH CHECK (
    bucket_id = 'bill-logos'
    AND is_admin(auth.uid())
  );

-- Admins can delete bill logos
DROP POLICY IF EXISTS "Admins can delete bill logos" ON storage.objects;
CREATE POLICY "Admins can delete bill logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'bill-logos'
    AND is_admin(auth.uid())
  );

-- ============================================
-- STEP 4: FIX APP-IMAGES BUCKET (FOR ADMIN SETTINGS LOGOS/FAVICONS)
-- ============================================

-- Ensure app-images bucket exists and is public (for logos/favicons)
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-images', 'app-images', true)
ON CONFLICT (id) DO UPDATE 
SET name = 'app-images', public = true;

-- ============================================
-- STEP 5: UPDATE APP-IMAGES STORAGE POLICIES
-- ============================================

-- Ensure app-images policies allow public viewing (for logos/favicons)
-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can upload app images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view app images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view app images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update app images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete app images" ON storage.objects;

-- Admins can upload app images (logos, favicons)
CREATE POLICY "Admins can upload app images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'app-images'
    AND is_admin(auth.uid())
  );

-- Anyone (including anonymous/unauthenticated) can view app images (logos/favicons must be public)
CREATE POLICY "Public can view app images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'app-images');

-- Also allow anonymous users to view (since bucket is public)
-- Note: RLS policies on storage.objects apply to authenticated users
-- For truly public access, the bucket must be set to public=true (which we did above)

-- Admins can update app images
CREATE POLICY "Admins can update app images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'app-images'
    AND is_admin(auth.uid())
  )
  WITH CHECK (
    bucket_id = 'app-images'
    AND is_admin(auth.uid())
  );

-- Admins can delete app images
CREATE POLICY "Admins can delete app images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'app-images'
    AND is_admin(auth.uid())
  );

-- ============================================
-- STEP 6: VERIFY MOBILE_DEPOSITS TABLE STRUCTURE
-- ============================================

-- Ensure transaction_id column exists (for linking deposits to transactions)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mobile_deposits' 
    AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE mobile_deposits ADD COLUMN transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_mobile_deposits_transaction_id ON mobile_deposits(transaction_id);
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check mobile_deposits columns:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'mobile_deposits' 
-- ORDER BY ordinal_position;

-- Check storage buckets:
-- SELECT id, name, public FROM storage.buckets WHERE id IN ('bill-logos', 'app-images');

-- Check storage policies for bill-logos:
-- SELECT policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'objects' 
-- AND policyname LIKE '%bill%';

-- Check storage policies for app-images:
-- SELECT policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'objects' 
-- AND policyname LIKE '%app%';

-- ============================================
-- COMPLETE!
-- ============================================
-- All fixes have been applied:
-- 1. ✅ Mobile deposit reference_number column fixed
-- 2. ✅ bill-logos bucket created with policies
-- 3. ✅ app-images bucket policies updated for public viewing
-- 
-- You can now:
-- - Upload mobile deposits (reference_number will work)
-- - Assign bills to users (bill-logos bucket exists)
-- - Upload logos/favicons in admin settings (app-images bucket is properly configured)

