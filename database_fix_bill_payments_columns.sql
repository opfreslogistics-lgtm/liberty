-- ============================================
-- FIX BILL_PAYMENTS TABLE - ADD MISSING COLUMNS
-- ============================================
-- Run this script in Supabase SQL Editor
-- This adds the columns that the code expects
-- ============================================

-- ============================================
-- STEP 1: ADD MISSING COLUMNS
-- ============================================

DO $$ 
BEGIN
  -- Add 'amount' column (code uses this, but schema has payment_amount)
  -- We'll add it as a separate column that can be synced
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bill_payments' 
    AND column_name = 'amount'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN amount DECIMAL(15, 2);
    
    -- Copy existing payment_amount values to amount
    UPDATE bill_payments SET amount = payment_amount WHERE amount IS NULL;
  END IF;

  -- Add 'payment_method' column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bill_payments' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN payment_method TEXT DEFAULT 'manual';
  END IF;

  -- Ensure reference_number exists (should already be there)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bill_payments' 
    AND column_name = 'reference_number'
  ) THEN
    ALTER TABLE bill_payments ADD COLUMN reference_number TEXT;
  END IF;
END $$;

-- ============================================
-- STEP 2: CREATE TRIGGER TO SYNC amount AND payment_amount
-- ============================================

-- Create function to sync amount and payment_amount
CREATE OR REPLACE FUNCTION sync_bill_payment_amount_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If amount is set but payment_amount is null, copy it
  IF NEW.amount IS NOT NULL AND NEW.payment_amount IS NULL THEN
    NEW.payment_amount := NEW.amount;
  -- If payment_amount is set but amount is null, copy it
  ELSIF NEW.payment_amount IS NOT NULL AND NEW.amount IS NULL THEN
    NEW.amount := NEW.payment_amount;
  -- If both are set but different, prefer payment_amount (the canonical field)
  ELSIF NEW.amount IS NOT NULL AND NEW.payment_amount IS NOT NULL AND NEW.amount != NEW.payment_amount THEN
    NEW.amount := NEW.payment_amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync fields before insert/update
DROP TRIGGER IF EXISTS trigger_sync_bill_payment_amounts ON bill_payments;
CREATE TRIGGER trigger_sync_bill_payment_amounts
  BEFORE INSERT OR UPDATE ON bill_payments
  FOR EACH ROW
  EXECUTE FUNCTION sync_bill_payment_amount_fields();

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
-- 1. ✅ payment_amount (existing canonical field)
-- 2. ✅ amount (added - synced with payment_amount)
-- 3. ✅ payment_method (added if missing)
-- 4. ✅ reference_number (ensured exists)
-- 
-- A trigger keeps 'amount' and 'payment_amount' in sync automatically.
-- The code can now use either field and they'll stay synchronized!

