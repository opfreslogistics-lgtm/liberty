-- ============================================
-- ADD updated_at COLUMN TO crypto_transactions
-- ============================================
-- Run this script in Supabase SQL Editor
-- Adds the missing updated_at column to crypto_transactions table
-- ============================================

-- ============================================
-- STEP 1: ADD updated_at COLUMN
-- ============================================

DO $$ 
BEGIN
  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE crypto_transactions 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    -- Set updated_at to created_at for existing records
    UPDATE crypto_transactions 
    SET updated_at = created_at 
    WHERE updated_at IS NULL AND created_at IS NOT NULL;
    
    -- If created_at doesn't exist, set updated_at to current time
    UPDATE crypto_transactions 
    SET updated_at = NOW() 
    WHERE updated_at IS NULL;
    
    COMMENT ON COLUMN crypto_transactions.updated_at IS 'Timestamp when the transaction was last updated';
  END IF;
END $$;

-- ============================================
-- STEP 2: CREATE TRIGGER TO AUTO-UPDATE updated_at
-- ============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_crypto_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_crypto_transactions_updated_at ON crypto_transactions;
CREATE TRIGGER trigger_update_crypto_transactions_updated_at
  BEFORE UPDATE ON crypto_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_crypto_transactions_updated_at();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if column exists:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'crypto_transactions' 
-- AND column_name = 'updated_at';

-- Check trigger:
-- SELECT trigger_name, event_manipulation, event_object_table 
-- FROM information_schema.triggers 
-- WHERE event_object_table = 'crypto_transactions' 
-- AND trigger_name = 'trigger_update_crypto_transactions_updated_at';

-- ============================================
-- COMPLETE!
-- ============================================
-- The crypto_transactions table now has:
-- - updated_at column (TIMESTAMP WITH TIME ZONE)
-- - Auto-update trigger that sets updated_at to NOW() on every UPDATE
-- - Existing records have updated_at set to their created_at value
--
-- Admin crypto management page should now work without errors!

