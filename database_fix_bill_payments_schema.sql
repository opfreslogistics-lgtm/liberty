-- ============================================
-- FIX BILL_PAYMENTS TABLE SCHEMA
-- ============================================
-- Run this script in Supabase SQL Editor
-- This fixes the bill_payments table to match what the code expects
-- ============================================

-- ============================================
-- STEP 1: ADD MISSING COLUMNS TO BILL_PAYMENTS
-- ============================================

DO $$ 
BEGIN
  -- Add 'amount' column if it doesn't exist (alias for payment_amount for compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bill_payments' 
    AND column_name = 'amount'
  ) THEN
    -- Option 1: Add amount as a column (can sync with payment_amount via trigger)
    -- Option 2: Just make code use payment_amount - we'll fix the code instead
    
    -- Actually, let's add both for backward compatibility
    -- But we'll make the code use payment_amount which already exists
    -- So no need to add amount column
  END IF;

  -- Add 'payment_method' column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bill_payments' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN payment_method TEXT DEFAULT 'manual';
  END IF;

  -- Ensure reference_number column exists (should already exist, but just in case)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bill_payments' 
    AND column_name = 'reference_number'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN reference_number TEXT;
  END IF;
END $$;

-- ============================================
-- STEP 2: ALTERNATIVELY - ADD 'amount' AS ALIAS COLUMN (Optional)
-- ============================================
-- If you want to keep both 'amount' and 'payment_amount' for compatibility:
-- Uncomment the following:

-- DO $$ 
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM information_schema.columns 
--     WHERE table_name = 'bill_payments' 
--     AND column_name = 'amount'
--   ) THEN
--     ALTER TABLE bill_payments ADD COLUMN amount DECIMAL(15, 2);
--     
--     -- Copy existing payment_amount to amount
--     UPDATE bill_payments SET amount = payment_amount WHERE amount IS NULL;
--     
--     -- Create trigger to keep them in sync (optional)
--     CREATE OR REPLACE FUNCTION sync_bill_payment_amounts()
--     RETURNS TRIGGER AS $$
--     BEGIN
--       IF NEW.payment_amount IS NOT NULL AND NEW.amount IS NULL THEN
--         NEW.amount := NEW.payment_amount;
--       ELSIF NEW.amount IS NOT NULL AND NEW.payment_amount IS NULL THEN
--         NEW.payment_amount := NEW.amount;
--       END IF;
--       RETURN NEW;
--     END;
--     $$ LANGUAGE plpgsql;
--     
--     DROP TRIGGER IF EXISTS trigger_sync_bill_payment_amounts ON bill_payments;
--     CREATE TRIGGER trigger_sync_bill_payment_amounts
--       BEFORE INSERT OR UPDATE ON bill_payments
--       FOR EACH ROW
--       EXECUTE FUNCTION sync_bill_payment_amounts();
--   END IF;
-- END $$;

-- ============================================
-- VERIFICATION QUERIES
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
-- 1. ✅ payment_amount (existing)
-- 2. ✅ payment_method (added if missing)
-- 3. ✅ reference_number (ensured exists)
-- 
-- NOTE: The code needs to be updated to use 'payment_amount' instead of 'amount'
-- OR we can add an 'amount' column (see optional step above)

