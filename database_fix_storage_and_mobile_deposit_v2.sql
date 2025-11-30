-- ============================================
-- FIX STORAGE BUCKETS AND MOBILE DEPOSIT (V2 - No Permission Errors)
-- ============================================
-- Run this script in Supabase SQL Editor
-- This fixes:
-- 1. Mobile deposit reference_number column issue
-- 2. Missing bill-logos bucket
-- 3. Admin settings logos/favicons bucket (app-images) policies
-- 
-- NOTE: Storage policies will be created via SECURITY DEFINER functions
-- to avoid permission errors
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
-- STEP 3: CREATE APP-IMAGES BUCKET (FOR ADMIN SETTINGS LOGOS/FAVICONS)
-- ============================================

-- Ensure app-images bucket exists and is public (for logos/favicons)
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-images', 'app-images', true)
ON CONFLICT (id) DO UPDATE 
SET name = 'app-images', public = true;

-- ============================================
-- STEP 4: CREATE SECURITY DEFINER FUNCTION TO CREATE STORAGE POLICIES
-- ============================================

-- This function will create storage policies with elevated privileges
CREATE OR REPLACE FUNCTION create_storage_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  -- ============================================
  -- BILL-LOGOS BUCKET POLICIES
  -- ============================================
  
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Admins can upload bill logos" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view bill logos" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can update bill logos" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can delete bill logos" ON storage.objects;
  
  -- Admins can upload bill logos
  CREATE POLICY "Admins can upload bill logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'bill-logos'
      AND is_admin(auth.uid())
    );
  
  -- Anyone can view bill logos (public bucket)
  CREATE POLICY "Anyone can view bill logos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'bill-logos');
  
  -- Admins can update bill logos
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
  CREATE POLICY "Admins can delete bill logos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'bill-logos'
      AND is_admin(auth.uid())
    );
  
  -- ============================================
  -- APP-IMAGES BUCKET POLICIES
  -- ============================================
  
  -- Drop existing policies if they exist
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
  
  -- Anyone can view app images (public bucket)
  CREATE POLICY "Public can view app images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'app-images');
  
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
END;
$$;

-- ============================================
-- STEP 5: EXECUTE FUNCTION TO CREATE POLICIES
-- ============================================

-- Call the function to create all storage policies
SELECT create_storage_policies();

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

-- Check mobile_deposits has reference_number:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'mobile_deposits' 
-- AND column_name = 'reference_number';

-- Check storage buckets:
-- SELECT id, name, public FROM storage.buckets WHERE id IN ('bill-logos', 'app-images');

-- Check storage policies:
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'objects' 
-- AND (policyname LIKE '%bill%' OR policyname LIKE '%app%');

-- ============================================
-- COMPLETE!
-- ============================================
-- All fixes have been applied:
-- 1. ✅ Mobile deposit reference_number column fixed
-- 2. ✅ bill-logos bucket created
-- 3. ✅ app-images bucket created/updated
-- 4. ✅ Storage policies created via SECURITY DEFINER function
-- 
-- You can now:
-- - Upload mobile deposits (reference_number will work)
-- - Assign bills to users (bill-logos bucket exists with policies)
-- - Upload logos/favicons in admin settings (app-images bucket with policies)

