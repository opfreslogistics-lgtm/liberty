-- ============================================
-- FIX BILLS TABLE RLS POLICIES FOR ADMIN ACCESS
-- ============================================
-- Run this script in Supabase SQL Editor
-- This adds admin policies so admins can assign bills to users
-- ============================================

-- ============================================
-- STEP 1: ADD ADMIN POLICIES FOR BILLS TABLE
-- ============================================

-- Admins can view all bills
DROP POLICY IF EXISTS "Admins can view all bills" ON bills;
CREATE POLICY "Admins can view all bills"
  ON bills FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can insert bills for any user (assign bills)
DROP POLICY IF EXISTS "Admins can insert bills" ON bills;
CREATE POLICY "Admins can insert bills"
  ON bills FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Admins can update any bills
DROP POLICY IF EXISTS "Admins can update all bills" ON bills;
CREATE POLICY "Admins can update all bills"
  ON bills FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Admins can delete any bills
DROP POLICY IF EXISTS "Admins can delete all bills" ON bills;
CREATE POLICY "Admins can delete all bills"
  ON bills FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check bills policies:
-- SELECT 
--   policyname,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies 
-- WHERE tablename = 'bills'
-- ORDER BY policyname;

-- Test if admin can insert (should return true if admin):
-- SELECT is_admin(auth.uid());

-- ============================================
-- COMPLETE!
-- ============================================
-- Admin policies have been added for the bills table:
-- 1. ✅ Admins can view all bills
-- 2. ✅ Admins can insert bills (assign bills to users)
-- 3. ✅ Admins can update any bills
-- 4. ✅ Admins can delete any bills
-- 
-- Users can still manage their own bills (existing policy remains)
-- Admins can now assign bills to any user without RLS violations!

