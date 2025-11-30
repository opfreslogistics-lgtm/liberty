-- ============================================
-- FIX KYC ID EXPIRY DATE COLUMN
-- ============================================
-- Run this script in Supabase SQL Editor
-- Adds the missing id_expiry_date column to kyc_verifications table
-- ============================================

-- ============================================
-- STEP 1: ADD id_expiry_date COLUMN TO KYC_VERIFICATIONS
-- ============================================

DO $$ 
BEGIN
  -- Add id_expiry_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_verifications' 
    AND column_name = 'id_expiry_date'
  ) THEN
    ALTER TABLE kyc_verifications ADD COLUMN id_expiry_date DATE;
    COMMENT ON COLUMN kyc_verifications.id_expiry_date IS 'Expiration date of the ID document (passport, driver license, etc.)';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if column exists:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'kyc_verifications' 
-- AND column_name = 'id_expiry_date';

-- ============================================
-- COMPLETE!
-- ============================================
-- The id_expiry_date column has been added to kyc_verifications table.
-- Users can now submit KYC forms with ID expiry date without errors!

