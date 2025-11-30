-- ============================================
-- FIX BILL_PAYMENTS TABLE - ADD MISSING COLUMNS
-- ============================================
-- Run this script in Supabase SQL Editor
-- This adds the payment_method column that the code expects
-- ============================================

-- ============================================
-- ADD MISSING COLUMNS
-- ============================================

DO $$ 
BEGIN
  -- Add 'payment_method' column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bill_payments' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN payment_method TEXT DEFAULT 'manual';
  END IF;

  -- Ensure reference_number exists (should already be there, but check anyway)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bill_payments' 
    AND column_name = 'reference_number'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN reference_number TEXT;
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Check bill_payments columns:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'bill_payments' 
-- ORDER BY ordinal_position;

-- ============================================
-- COMPLETE!
-- ============================================
-- The bill_payments table now has:
-- 1. ✅ payment_amount (already exists - code now uses this)
-- 2. ✅ payment_method (added if missing)
-- 3. ✅ reference_number (ensured exists)
-- 
-- The code has been updated to use 'payment_amount' instead of 'amount'

