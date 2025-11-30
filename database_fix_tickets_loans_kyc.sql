-- ============================================
-- FIX SUPPORT TICKETS, LOANS, AND KYC ISSUES
-- ============================================
-- Run this script in Supabase SQL Editor
-- Fixes:
-- 1. Missing admin_id and is_internal columns in support_ticket_responses
-- 2. Missing annual_income and other fields in loans table
-- 3. KYC RLS policy fixes using is_admin() function
-- ============================================
-- NOTE: This script assumes the is_admin() function already exists
-- If you get an error about is_admin() not existing, run database_complete_setup.sql first
-- ============================================

-- ============================================
-- STEP 1: ADD MISSING COLUMNS TO SUPPORT_TICKET_RESPONSES
-- ============================================

DO $$ 
BEGIN
  -- Add admin_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'support_ticket_responses' 
    AND column_name = 'admin_id'
  ) THEN
    ALTER TABLE support_ticket_responses ADD COLUMN admin_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_support_ticket_responses_admin_id ON support_ticket_responses(admin_id);
  END IF;

  -- Add is_internal column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'support_ticket_responses' 
    AND column_name = 'is_internal'
  ) THEN
    ALTER TABLE support_ticket_responses ADD COLUMN is_internal BOOLEAN DEFAULT false;
  END IF;
END $$;

-- ============================================
-- STEP 2: UPDATE SUPPORT_TICKET_RESPONSES RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own ticket responses" ON support_ticket_responses;
DROP POLICY IF EXISTS "Users can insert own ticket responses" ON support_ticket_responses;
DROP POLICY IF EXISTS "Admins can view all ticket responses" ON support_ticket_responses;
DROP POLICY IF EXISTS "Admins can insert ticket responses" ON support_ticket_responses;
DROP POLICY IF EXISTS "Admins can update all ticket responses" ON support_ticket_responses;

-- Users can view responses to their own tickets
CREATE POLICY "Users can view own ticket responses"
  ON support_ticket_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = support_ticket_responses.ticket_id
      AND st.user_id = auth.uid()
    )
    OR (user_id IS NOT NULL AND user_id = auth.uid())
    OR is_admin(auth.uid())
  );

-- Users can insert their own responses
-- Allow users to respond if user_id matches, or if admin_id matches (for admins), or if user is admin
CREATE POLICY "Users can insert own ticket responses"
  ON support_ticket_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if user is responding (user_id matches)
    (user_id IS NOT NULL AND user_id = auth.uid())
    -- OR if admin is responding (admin_id matches)
    OR (admin_id IS NOT NULL AND admin_id = auth.uid())
    -- OR if user has admin privileges (can respond to any ticket)
    OR is_admin(auth.uid())
  );

-- Admins can view all ticket responses
CREATE POLICY "Admins can view all ticket responses"
  ON support_ticket_responses FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can insert responses for any ticket
CREATE POLICY "Admins can insert ticket responses"
  ON support_ticket_responses FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Admins can update all ticket responses
CREATE POLICY "Admins can update all ticket responses"
  ON support_ticket_responses FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- STEP 3: ADD MISSING COLUMNS TO LOANS TABLE
-- ============================================

DO $$ 
BEGIN
  -- Add annual_income column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'annual_income'
  ) THEN
    ALTER TABLE loans ADD COLUMN annual_income DECIMAL(15, 2);
  END IF;

  -- Add monthly_income column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'monthly_income'
  ) THEN
    ALTER TABLE loans ADD COLUMN monthly_income DECIMAL(15, 2);
  END IF;

  -- Add requested_amount column (for pending loans)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'requested_amount'
  ) THEN
    ALTER TABLE loans ADD COLUMN requested_amount DECIMAL(15, 2);
  END IF;

  -- Add employment_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'employment_status'
  ) THEN
    ALTER TABLE loans ADD COLUMN employment_status TEXT;
  END IF;

  -- Add date_of_birth column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE loans ADD COLUMN date_of_birth DATE;
  END IF;

  -- Add gender column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'gender'
  ) THEN
    ALTER TABLE loans ADD COLUMN gender TEXT;
  END IF;

  -- Add phone_number column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE loans ADD COLUMN phone_number TEXT;
  END IF;

  -- Add home_address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'home_address'
  ) THEN
    ALTER TABLE loans ADD COLUMN home_address TEXT;
  END IF;

  -- Add city column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'city'
  ) THEN
    ALTER TABLE loans ADD COLUMN city TEXT;
  END IF;

  -- Add state column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'state'
  ) THEN
    ALTER TABLE loans ADD COLUMN state TEXT;
  END IF;

  -- Add country column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'country'
  ) THEN
    ALTER TABLE loans ADD COLUMN country TEXT;
  END IF;

  -- Add id_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'id_type'
  ) THEN
    ALTER TABLE loans ADD COLUMN id_type TEXT;
  END IF;

  -- Add id_number column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'id_number'
  ) THEN
    ALTER TABLE loans ADD COLUMN id_number TEXT;
  END IF;

  -- Add ssn_tax_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'ssn_tax_id'
  ) THEN
    ALTER TABLE loans ADD COLUMN ssn_tax_id TEXT;
  END IF;

  -- Add employer_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'employer_name'
  ) THEN
    ALTER TABLE loans ADD COLUMN employer_name TEXT;
  END IF;

  -- Add job_title column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'job_title'
  ) THEN
    ALTER TABLE loans ADD COLUMN job_title TEXT;
  END IF;

  -- Add employment_start_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'employment_start_date'
  ) THEN
    ALTER TABLE loans ADD COLUMN employment_start_date DATE;
  END IF;

  -- Add employer_address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'employer_address'
  ) THEN
    ALTER TABLE loans ADD COLUMN employer_address TEXT;
  END IF;

  -- Add employer_phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'employer_phone'
  ) THEN
    ALTER TABLE loans ADD COLUMN employer_phone TEXT;
  END IF;

  -- Add monthly_expenses column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'monthly_expenses'
  ) THEN
    ALTER TABLE loans ADD COLUMN monthly_expenses DECIMAL(15, 2);
  END IF;

  -- Add existing_loans column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'existing_loans'
  ) THEN
    ALTER TABLE loans ADD COLUMN existing_loans DECIMAL(15, 2);
  END IF;

  -- Add other_assets column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'other_assets'
  ) THEN
    ALTER TABLE loans ADD COLUMN other_assets DECIMAL(15, 2);
  END IF;

  -- Add preferred_repayment_method column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'preferred_repayment_method'
  ) THEN
    ALTER TABLE loans ADD COLUMN preferred_repayment_method TEXT;
  END IF;

  -- Add collateral column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'collateral'
  ) THEN
    ALTER TABLE loans ADD COLUMN collateral TEXT;
  END IF;

  -- Add terms_accepted column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'terms_accepted'
  ) THEN
    ALTER TABLE loans ADD COLUMN terms_accepted BOOLEAN DEFAULT false;
  END IF;

  -- Add credit_check_accepted column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'credit_check_accepted'
  ) THEN
    ALTER TABLE loans ADD COLUMN credit_check_accepted BOOLEAN DEFAULT false;
  END IF;

  -- Add repayment_policy_accepted column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'repayment_policy_accepted'
  ) THEN
    ALTER TABLE loans ADD COLUMN repayment_policy_accepted BOOLEAN DEFAULT false;
  END IF;

  -- Add digital_signature column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'digital_signature'
  ) THEN
    ALTER TABLE loans ADD COLUMN digital_signature TEXT;
  END IF;

  -- Add otp_verified column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'otp_verified'
  ) THEN
    ALTER TABLE loans ADD COLUMN otp_verified BOOLEAN DEFAULT false;
  END IF;

  -- Add reference_number column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'reference_number'
  ) THEN
    ALTER TABLE loans ADD COLUMN reference_number TEXT;
    CREATE INDEX IF NOT EXISTS idx_loans_reference_number ON loans(reference_number);
  END IF;

  -- Add purpose column (if different from loan_purpose)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'purpose'
  ) THEN
    ALTER TABLE loans ADD COLUMN purpose TEXT;
  END IF;

  -- Add disbursed_at column for loan disbursement tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'disbursed_at'
  ) THEN
    ALTER TABLE loans ADD COLUMN disbursed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add admin_id column for tracking which admin processed the loan
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'admin_id'
  ) THEN
    ALTER TABLE loans ADD COLUMN admin_id UUID REFERENCES user_profiles(id);
    CREATE INDEX IF NOT EXISTS idx_loans_admin_id ON loans(admin_id);
  END IF;
END $$;

-- ============================================
-- STEP 3.5: ADD MISSING COLUMN TO KYC_VERIFICATIONS TABLE
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
-- STEP 4: FIX KYC RLS POLICIES (USE is_admin() FUNCTION)
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own KYC" ON kyc_verifications;
DROP POLICY IF EXISTS "Users can insert own KYC" ON kyc_verifications;
DROP POLICY IF EXISTS "Users can update own KYC" ON kyc_verifications;
DROP POLICY IF EXISTS "Admins can view all KYC" ON kyc_verifications;
DROP POLICY IF EXISTS "Admins can update all KYC" ON kyc_verifications;

-- Users can view their own KYC
CREATE POLICY "Users can view own KYC"
  ON kyc_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = kyc_verifications.user_id OR is_admin(auth.uid()));

-- Users can insert their own KYC
CREATE POLICY "Users can insert own KYC"
  ON kyc_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

-- Users can update their own KYC (only if pending or resubmit)
CREATE POLICY "Users can update own KYC"
  ON kyc_verifications FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = kyc_verifications.user_id AND (kyc_verifications.status = 'pending' OR kyc_verifications.status = 'resubmit'))
    OR is_admin(auth.uid())
  )
  WITH CHECK (
    (auth.uid() = user_id AND (status = 'pending' OR status = 'resubmit'))
    OR is_admin(auth.uid())
  );

-- Admins can view all KYC
CREATE POLICY "Admins can view all KYC"
  ON kyc_verifications FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can update all KYC
CREATE POLICY "Admins can update all KYC"
  ON kyc_verifications FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check support_ticket_responses columns:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'support_ticket_responses'
-- ORDER BY ordinal_position;

-- Check loans columns:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'loans'
-- ORDER BY ordinal_position;

-- Check kyc_verifications policies:
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'kyc_verifications'
-- ORDER BY policyname;

-- ============================================
-- COMPLETE!
-- ============================================
-- All fixes applied:
-- 1. ✅ support_ticket_responses - Added admin_id and is_internal columns
-- 2. ✅ support_ticket_responses - Updated RLS policies to use is_admin()
-- 3. ✅ loans - Added all missing columns (annual_income, monthly_income, etc.)
-- 4. ✅ kyc_verifications - Added id_expiry_date column
-- 5. ✅ kyc_verifications - Fixed RLS policies to use is_admin() function
-- 
-- All forms should now work without errors!

