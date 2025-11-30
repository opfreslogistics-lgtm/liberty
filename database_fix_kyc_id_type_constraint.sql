-- ============================================
-- FIX KYC ID TYPE CONSTRAINT
-- ============================================
-- Run this script in Supabase SQL Editor
-- Updates the id_type constraint to accept both 'driver_license' and 'drivers_license'
-- for backwards compatibility
-- ============================================

-- ============================================
-- STEP 1: UPDATE EXISTING RECORDS (if any use 'drivers_license')
-- ============================================

-- Update any existing records that use 'drivers_license' to 'driver_license'
UPDATE kyc_verifications
SET id_type = 'driver_license'
WHERE id_type = 'drivers_license';

-- ============================================
-- STEP 2: DROP OLD CONSTRAINT
-- ============================================

-- Drop the existing constraint
ALTER TABLE kyc_verifications 
DROP CONSTRAINT IF EXISTS kyc_verifications_id_type_check;

-- ============================================
-- STEP 3: CREATE NEW CONSTRAINT (accepts both forms)
-- ============================================

-- Create new constraint that accepts both 'driver_license' and 'drivers_license'
ALTER TABLE kyc_verifications
ADD CONSTRAINT kyc_verifications_id_type_check 
CHECK (id_type IN ('passport', 'driver_license', 'drivers_license', 'national_id', 'other'));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check constraint:
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'kyc_verifications'::regclass 
-- AND conname = 'kyc_verifications_id_type_check';

-- Check existing id_type values:
-- SELECT id_type, COUNT(*) 
-- FROM kyc_verifications 
-- GROUP BY id_type;

-- ============================================
-- COMPLETE!
-- ============================================
-- The id_type constraint now accepts:
-- - 'passport'
-- - 'driver_license' (preferred)
-- - 'drivers_license' (for backwards compatibility)
-- - 'national_id'
-- - 'other'
--
-- All existing 'drivers_license' records have been updated to 'driver_license'.
-- The form will now work correctly with the database!

