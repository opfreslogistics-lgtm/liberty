-- ============================================
-- CREATE DOCUMENTS STORAGE BUCKET
-- ============================================
-- Run this script in Supabase SQL Editor
-- This creates the storage bucket for ID card uploads during signup
-- ============================================

-- ============================================
-- STEP 1: CREATE DOCUMENTS STORAGE BUCKET
-- ============================================
-- Create the documents bucket (private - authenticated users only)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: CREATE STORAGE POLICIES
-- ============================================

-- Users can upload their own ID card documents
DROP POLICY IF EXISTS "Users can upload own ID documents" ON storage.objects;
CREATE POLICY "Users can upload own ID documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view their own ID card documents
DROP POLICY IF EXISTS "Users can view own ID documents" ON storage.objects;
CREATE POLICY "Users can view own ID documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own ID card documents
DROP POLICY IF EXISTS "Users can update own ID documents" ON storage.objects;
CREATE POLICY "Users can update own ID documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own ID card documents
DROP POLICY IF EXISTS "Users can delete own ID documents" ON storage.objects;
CREATE POLICY "Users can delete own ID documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can view all ID card documents
DROP POLICY IF EXISTS "Admins can view all ID documents" ON storage.objects;
CREATE POLICY "Admins can view all ID documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      -- Use is_admin function if it exists, otherwise fallback to direct check
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'superadmin')
      )
    )
  );

-- Admins can update all ID card documents
DROP POLICY IF EXISTS "Admins can update all ID documents" ON storage.objects;
CREATE POLICY "Admins can update all ID documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- Admins can delete all ID card documents
DROP POLICY IF EXISTS "Admins can delete all ID documents" ON storage.objects;
CREATE POLICY "Admins can delete all ID documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this query to verify the bucket was created:
-- SELECT * FROM storage.buckets WHERE id = 'documents';

-- Run this query to verify policies were created:
-- SELECT policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'objects' 
-- AND schemaname = 'storage'
-- AND policyname LIKE '%ID documents%';

-- ============================================
-- COMPLETE!
-- ============================================
-- The 'documents' storage bucket has been created and configured.
-- Users can now upload ID card images during signup (Step 2).
-- Files will be stored in the path: {user_id}/id-cards/{type}_{timestamp}.{ext}


