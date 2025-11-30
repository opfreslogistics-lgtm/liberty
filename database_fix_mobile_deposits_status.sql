-- ============================================
-- FIX MOBILE DEPOSITS STATUS CONSTRAINT
-- ============================================
-- Run this script in Supabase SQL Editor
-- This fixes the status CHECK constraint to allow 'credited' and 'cancelled'
-- ============================================

-- ============================================
-- STEP 1: DROP EXISTING CONSTRAINT
-- ============================================

-- Drop the existing check constraint
ALTER TABLE mobile_deposits 
DROP CONSTRAINT IF EXISTS mobile_deposits_status_check;

-- ============================================
-- STEP 2: CREATE NEW CONSTRAINT WITH ALL STATUS VALUES
-- ============================================

-- Create new constraint that includes all status values used by the code
ALTER TABLE mobile_deposits 
ADD CONSTRAINT mobile_deposits_status_check 
CHECK (status IN (
  'pending', 
  'processing', 
  'approved', 
  'rejected', 
  'completed',
  'credited',  -- Used when admin approves and credits the account
  'cancelled'   -- Used when admin cancels the deposit
));

-- ============================================
-- STEP 3: UPDATE EXISTING RECORDS IF NEEDED (OPTIONAL)
-- ============================================

-- If there are any records with 'approved' status, you might want to update them to 'credited'
-- Uncomment the following if you want to migrate existing data:
-- UPDATE mobile_deposits 
-- SET status = 'credited' 
-- WHERE status = 'approved';

-- If there are any records with 'rejected' status, you might want to update them to 'cancelled'
-- Uncomment the following if you want to migrate existing data:
-- UPDATE mobile_deposits 
-- SET status = 'cancelled' 
-- WHERE status = 'rejected';

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Check the constraint:
-- SELECT 
--   conname AS constraint_name,
--   pg_get_constraintdef(oid) AS constraint_definition
-- FROM pg_constraint
-- WHERE conrelid = 'mobile_deposits'::regclass
-- AND conname = 'mobile_deposits_status_check';

-- Check current status values in the table:
-- SELECT status, COUNT(*) 
-- FROM mobile_deposits 
-- GROUP BY status;

-- ============================================
-- COMPLETE!
-- ============================================
-- The mobile_deposits status constraint has been updated to allow:
-- - 'pending' (initial status)
-- - 'processing' (being processed)
-- - 'approved' (approved but not yet credited)
-- - 'rejected' (rejected)
-- - 'completed' (completed)
-- - 'credited' (approved and credited to account) ✅ NEW
-- - 'cancelled' (cancelled by admin) ✅ NEW
-- 
-- Admin can now approve (sets status to 'credited') and cancel (sets status to 'cancelled') mobile deposits!

