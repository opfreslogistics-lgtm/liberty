-- ============================================
-- ADD WIRE TRANSACTION CODES AND PINS TO USER_PROFILES
-- ============================================
-- Run this script in Supabase SQL Editor
-- Adds missing columns for IMF code, COT code, TAN code, and Wire Transaction PIN
-- ============================================

-- ============================================
-- STEP 1: ADD WIRE TRANSACTION CODES COLUMNS
-- ============================================

DO $$ 
BEGIN
  -- Add IMF Code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'imf_code'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN imf_code TEXT;
    COMMENT ON COLUMN user_profiles.imf_code IS 'International Monetary Fund code for wire transfers';
  END IF;

  -- Add IMF Code Enabled flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'imf_code_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN imf_code_enabled BOOLEAN DEFAULT false;
    COMMENT ON COLUMN user_profiles.imf_code_enabled IS 'Whether IMF code is required for transactions';
  END IF;

  -- Add COT Code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'cot_code'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN cot_code TEXT;
    COMMENT ON COLUMN user_profiles.cot_code IS 'Category of Transaction code for wire transfers';
  END IF;

  -- Add COT Code Enabled flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'cot_code_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN cot_code_enabled BOOLEAN DEFAULT false;
    COMMENT ON COLUMN user_profiles.cot_code_enabled IS 'Whether COT code is required for transactions';
  END IF;

  -- Add TAN Code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'tan_code'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN tan_code TEXT;
    COMMENT ON COLUMN user_profiles.tan_code IS 'Transaction Authentication Number code for wire transfers';
  END IF;

  -- Add TAN Code Enabled flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'tan_code_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN tan_code_enabled BOOLEAN DEFAULT false;
    COMMENT ON COLUMN user_profiles.tan_code_enabled IS 'Whether TAN code is required for transactions';
  END IF;

  -- Add Wire Transaction PIN column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'wire_transaction_pin'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN wire_transaction_pin TEXT;
    COMMENT ON COLUMN user_profiles.wire_transaction_pin IS 'PIN code required for wire transactions (4-6 digits)';
  END IF;

  -- Add Wire Transaction PIN Enabled flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'wire_transaction_pin_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN wire_transaction_pin_enabled BOOLEAN DEFAULT false;
    COMMENT ON COLUMN user_profiles.wire_transaction_pin_enabled IS 'Whether Wire Transaction PIN is required for wire transfers';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if columns exist:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_profiles' 
-- AND column_name IN ('imf_code', 'imf_code_enabled', 'cot_code', 'cot_code_enabled', 'tan_code', 'tan_code_enabled', 'wire_transaction_pin', 'wire_transaction_pin_enabled')
-- ORDER BY column_name;

-- ============================================
-- COMPLETE!
-- ============================================
-- The user_profiles table now has all the required columns for:
-- ✅ IMF Code (imf_code, imf_code_enabled)
-- ✅ COT Code (cot_code, cot_code_enabled)
-- ✅ TAN Code (tan_code, tan_code_enabled)
-- ✅ Wire Transaction PIN (wire_transaction_pin, wire_transaction_pin_enabled)
--
-- Admins can now save these codes and PINs for users without errors!

