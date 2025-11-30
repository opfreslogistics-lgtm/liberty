-- ============================================
-- FIX CRYPTO TRANSACTIONS TABLE COLUMNS
-- ============================================
-- Run this script in Supabase SQL Editor
-- Adds missing columns that the frontend code expects: amount, btc_amount, btc_price
-- Also makes account_id nullable since crypto transactions don't require a specific account
-- ============================================

-- ============================================
-- STEP 1: MAKE account_id AND OLD COLUMNS NULLABLE
-- ============================================

-- Drop NOT NULL constraint on account_id if it exists
ALTER TABLE crypto_transactions 
ALTER COLUMN account_id DROP NOT NULL;

-- Make old columns nullable (they will be populated from new columns via trigger or sync)
DO $$
BEGIN
  -- Make amount_usd nullable if it has NOT NULL constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'amount_usd'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE crypto_transactions ALTER COLUMN amount_usd DROP NOT NULL;
  END IF;

  -- Make amount_crypto nullable if it has NOT NULL constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'amount_crypto'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE crypto_transactions ALTER COLUMN amount_crypto DROP NOT NULL;
  END IF;

  -- Make crypto_price nullable if it has NOT NULL constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'crypto_price'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE crypto_transactions ALTER COLUMN crypto_price DROP NOT NULL;
  END IF;
END $$;

-- ============================================
-- STEP 2: ADD MISSING COLUMNS (amount, btc_amount, btc_price)
-- ============================================

DO $$ 
BEGIN
  -- Add 'amount' column (USD amount) if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'amount'
  ) THEN
    ALTER TABLE crypto_transactions ADD COLUMN amount DECIMAL(15, 2);
    
    -- Migrate data from amount_usd to amount if amount_usd exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'crypto_transactions' 
      AND column_name = 'amount_usd'
    ) THEN
      UPDATE crypto_transactions 
      SET amount = amount_usd 
      WHERE amount IS NULL AND amount_usd IS NOT NULL;
    END IF;
  END IF;

  -- Add 'btc_amount' column if it doesn't exist (migrate from amount_crypto)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'btc_amount'
  ) THEN
    ALTER TABLE crypto_transactions ADD COLUMN btc_amount DECIMAL(18, 8);
    
    -- Migrate data from amount_crypto to btc_amount if amount_crypto exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'crypto_transactions' 
      AND column_name = 'amount_crypto'
    ) THEN
      UPDATE crypto_transactions 
      SET btc_amount = amount_crypto 
      WHERE btc_amount IS NULL AND amount_crypto IS NOT NULL;
    END IF;
  END IF;

  -- Add 'btc_price' column if it doesn't exist (migrate from crypto_price)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'btc_price'
  ) THEN
    ALTER TABLE crypto_transactions ADD COLUMN btc_price DECIMAL(15, 2);
    
    -- Migrate data from crypto_price to btc_price if crypto_price exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'crypto_transactions' 
      AND column_name = 'crypto_price'
    ) THEN
      UPDATE crypto_transactions 
      SET btc_price = crypto_price 
      WHERE btc_price IS NULL AND crypto_price IS NOT NULL;
    END IF;
  END IF;
END $$;

-- ============================================
-- STEP 3: CREATE TRIGGER TO SYNC COLUMNS
-- ============================================
-- This trigger will automatically sync amount -> amount_usd, btc_amount -> amount_crypto, btc_price -> crypto_price

-- Create function to sync columns
CREATE OR REPLACE FUNCTION sync_crypto_transaction_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync amount to amount_usd
  IF NEW.amount IS NOT NULL AND (NEW.amount_usd IS NULL OR NEW.amount_usd != NEW.amount) THEN
    NEW.amount_usd := NEW.amount;
  END IF;
  
  -- Sync amount_usd to amount
  IF NEW.amount_usd IS NOT NULL AND (NEW.amount IS NULL OR NEW.amount != NEW.amount_usd) THEN
    NEW.amount := NEW.amount_usd;
  END IF;
  
  -- Sync btc_amount to amount_crypto
  IF NEW.btc_amount IS NOT NULL AND (NEW.amount_crypto IS NULL OR NEW.amount_crypto != NEW.btc_amount) THEN
    NEW.amount_crypto := NEW.btc_amount;
  END IF;
  
  -- Sync amount_crypto to btc_amount
  IF NEW.amount_crypto IS NOT NULL AND (NEW.btc_amount IS NULL OR NEW.btc_amount != NEW.amount_crypto) THEN
    NEW.btc_amount := NEW.amount_crypto;
  END IF;
  
  -- Sync btc_price to crypto_price
  IF NEW.btc_price IS NOT NULL AND (NEW.crypto_price IS NULL OR NEW.crypto_price != NEW.btc_price) THEN
    NEW.crypto_price := NEW.btc_price;
  END IF;
  
  -- Sync crypto_price to btc_price
  IF NEW.crypto_price IS NOT NULL AND (NEW.btc_price IS NULL OR NEW.btc_price != NEW.crypto_price) THEN
    NEW.btc_price := NEW.crypto_price;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_sync_crypto_transaction_columns ON crypto_transactions;
CREATE TRIGGER trigger_sync_crypto_transaction_columns
  BEFORE INSERT OR UPDATE ON crypto_transactions
  FOR EACH ROW
  EXECUTE FUNCTION sync_crypto_transaction_columns();

-- ============================================
-- STEP 4: ADD updated_at COLUMN
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

-- Check columns:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'crypto_transactions' 
-- AND column_name IN ('amount', 'btc_amount', 'btc_price', 'account_id')
-- ORDER BY column_name;

-- ============================================
-- COMPLETE!
-- ============================================
-- The crypto_transactions table now has:
-- - amount (DECIMAL) - for USD amount (new column name)
-- - amount_usd (DECIMAL) - for USD amount (old column name, now nullable)
-- - btc_amount (DECIMAL) - for BTC amount (new column name)
-- - amount_crypto (DECIMAL) - for BTC amount (old column name, now nullable)
-- - btc_price (DECIMAL) - for BTC price (new column name)
-- - crypto_price (DECIMAL) - for BTC price (old column name, now nullable)
-- - account_id is now nullable (not required)
-- - updated_at (TIMESTAMP) - automatically updated on record changes
--
-- A trigger automatically syncs values between old and new column names.
-- Another trigger automatically updates updated_at on every UPDATE.
-- The frontend code populates both sets of columns for compatibility.
--
-- Crypto buy/sell transactions and admin crypto management should now work correctly!

