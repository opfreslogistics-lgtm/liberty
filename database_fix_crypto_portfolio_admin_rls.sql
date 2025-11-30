-- ============================================
-- FIX CRYPTO_PORTFOLIO ADMIN RLS POLICIES
-- ============================================
-- Run this script in Supabase SQL Editor
-- Adds admin permissions to insert, update, and delete crypto_portfolio records
-- ============================================

-- ============================================
-- STEP 1: ENABLE RLS (if not already enabled)
-- ============================================

ALTER TABLE crypto_portfolio ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: ADD ADMIN POLICIES FOR CRYPTO_PORTFOLIO
-- ============================================

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all crypto portfolios" ON crypto_portfolio;
DROP POLICY IF EXISTS "Admins can insert crypto portfolios" ON crypto_portfolio;
DROP POLICY IF EXISTS "Admins can update crypto portfolios" ON crypto_portfolio;
DROP POLICY IF EXISTS "Admins can delete crypto portfolios" ON crypto_portfolio;

-- Admin can view all crypto portfolios
CREATE POLICY "Admins can view all crypto portfolios"
  ON crypto_portfolio FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admin can insert crypto portfolios for any user
CREATE POLICY "Admins can insert crypto portfolios"
  ON crypto_portfolio FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Admin can update crypto portfolios for any user
CREATE POLICY "Admins can update crypto portfolios"
  ON crypto_portfolio FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Admin can delete crypto portfolios
CREATE POLICY "Admins can delete crypto portfolios"
  ON crypto_portfolio FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check policies:
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'crypto_portfolio'
-- ORDER BY policyname;

-- ============================================
-- COMPLETE!
-- ============================================
-- Admins now have full CRUD permissions on crypto_portfolio:
-- ✅ SELECT - View all portfolios
-- ✅ INSERT - Create portfolios for any user
-- ✅ UPDATE - Update portfolios for any user
-- ✅ DELETE - Delete portfolios
--
-- Admin crypto transaction approval should now work without RLS violations!

