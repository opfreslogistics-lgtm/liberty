-- ============================================
-- FIX KYC DOCUMENTS STORAGE RLS POLICIES
-- ============================================
-- Run this script in Supabase SQL Editor
-- Fixes RLS policies for kyc-documents bucket
-- File structure: {folder}/{user_id}/filename.ext
-- Examples: id-documents/{user_id}/file.jpg, selfies/{user_id}/file.jpg
-- ============================================

-- ============================================
-- STEP 1: ENSURE KYC-DOCUMENTS BUCKET EXISTS
-- ============================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: FIX KYC DOCUMENTS STORAGE RLS POLICIES
-- ============================================
-- File path structure: {folder}/{user_id}/filename.ext
-- We need to check the SECOND folder (index [2]) for user_id
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all KYC documents" ON storage.objects;

-- Users can upload their own KYC documents
-- File path structure: {folder}/{user_id}/filename.ext (e.g., "id-documents/{user_id}/file.jpg")
-- We need to check the SECOND folder [2] for user_id (first folder is the category like "id-documents")
CREATE POLICY "Users can upload own KYC documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'kyc-documents' 
    AND (
      -- Check second folder (user_id) - for structure: folder/user_id/filename
      (storage.foldername(name))[2] = auth.uid()::text
      -- OR first folder (fallback for direct user_id/filename structure)
      OR (storage.foldername(name))[1] = auth.uid()::text
      -- OR allow if user is admin
      OR is_admin(auth.uid())
    )
  );

-- Users can view their own KYC documents
CREATE POLICY "Users can view own KYC documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'kyc-documents' 
    AND (
      (storage.foldername(name))[2] = auth.uid()::text
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR is_admin(auth.uid())
    )
  );

-- Users can update their own KYC documents
CREATE POLICY "Users can update own KYC documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'kyc-documents' 
    AND (
      (storage.foldername(name))[2] = auth.uid()::text
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR is_admin(auth.uid())
    )
  )
  WITH CHECK (
    bucket_id = 'kyc-documents' 
    AND (
      (storage.foldername(name))[2] = auth.uid()::text
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR is_admin(auth.uid())
    )
  );

-- Users can delete their own KYC documents
CREATE POLICY "Users can delete own KYC documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'kyc-documents' 
    AND (
      (storage.foldername(name))[2] = auth.uid()::text
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR is_admin(auth.uid())
    )
  );

-- Admins can view all KYC documents
CREATE POLICY "Admins can view all KYC documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND is_admin(auth.uid())
  );

-- Admins can manage all KYC documents
CREATE POLICY "Admins can manage all KYC documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND is_admin(auth.uid())
  )
  WITH CHECK (
    bucket_id = 'kyc-documents'
    AND is_admin(auth.uid())
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'kyc-documents';

-- Check policies:
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'objects' 
-- AND policyname LIKE '%KYC%'
-- ORDER BY policyname;

-- ============================================
-- COMPLETE!
-- ============================================
-- KYC documents storage policies have been fixed:
-- 1. ✅ Users can upload to {folder}/{user_id}/filename.ext structure
-- 2. ✅ Users can view/update/delete their own documents
-- 3. ✅ Admins can view/manage all documents
-- 4. ✅ Policies check both folder[1] and folder[2] for user_id compatibility
-- 
-- Users can now upload KYC documents without RLS violations!

