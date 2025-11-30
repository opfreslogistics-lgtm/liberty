-- ============================================
-- FIX ADMIN CARD ACTIONS - RLS POLICIES
-- ============================================
-- Run this script in Supabase SQL Editor
-- This allows admins to credit/debit cards without RLS violations
-- ============================================

-- ============================================
-- STEP 1: ADD ADMIN POLICIES FOR CARD_TRANSACTIONS
-- ============================================

-- Admins can view all card transactions
DROP POLICY IF EXISTS "Admins can view all card transactions" ON card_transactions;
CREATE POLICY "Admins can view all card transactions"
  ON card_transactions FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can insert card transactions (for any user's card)
DROP POLICY IF EXISTS "Admins can insert card transactions" ON card_transactions;
CREATE POLICY "Admins can insert card transactions"
  ON card_transactions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Admins can update card transactions
DROP POLICY IF EXISTS "Admins can update all card transactions" ON card_transactions;
CREATE POLICY "Admins can update all card transactions"
  ON card_transactions FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Admins can delete card transactions
DROP POLICY IF EXISTS "Admins can delete all card transactions" ON card_transactions;
CREATE POLICY "Admins can delete all card transactions"
  ON card_transactions FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================
-- STEP 2: ENSURE ACCOUNTS POLICIES ALLOW ADMIN UPDATES
-- ============================================
-- (These should already exist, but we'll ensure they're there)

-- Admins can update all accounts (for balance updates)
DROP POLICY IF EXISTS "Admins can update all accounts" ON accounts;
CREATE POLICY "Admins can update all accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- STEP 3: ENSURE TRANSACTIONS POLICIES ALLOW ADMIN INSERTS
-- ============================================
-- (These should already exist, but we'll ensure they're there)

-- Admins can insert transactions (for any user)
DROP POLICY IF EXISTS "Admins can insert transactions" ON transactions;
CREATE POLICY "Admins can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Admins can update transactions
DROP POLICY IF EXISTS "Admins can update all transactions" ON transactions;
CREATE POLICY "Admins can update all transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check card_transactions policies:
-- SELECT 
--   policyname,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies 
-- WHERE tablename = 'card_transactions'
-- ORDER BY policyname;

-- Check accounts policies:
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'accounts'
-- ORDER BY policyname;

-- Check transactions policies:
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'transactions'
-- ORDER BY policyname;

-- ============================================
-- COMPLETE!
-- ============================================
-- Admin policies have been added for:
-- 1. ✅ card_transactions - Admins can view/insert/update/delete
-- 2. ✅ accounts - Admins can update (for balance changes)
-- 3. ✅ transactions - Admins can insert/update
-- 
-- Admins can now:
-- - Credit/debit cards without RLS violations
-- - Insert card transactions for any user
-- - Update account balances
-- - Insert transactions for any user
-- 
-- All admin card actions will work correctly!

