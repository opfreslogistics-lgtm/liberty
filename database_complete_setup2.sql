-- ============================================
-- ADMIN-SIDE DATABASE SETUP (Part 2)
-- ============================================
-- Run this AFTER running database_complete_setup.sql
-- This adds missing tables and fields needed for admin pages
-- ============================================

-- ============================================
-- STEP 1: CREATE KYC_VERIFICATIONS TABLE
-- ============================================
-- This table is used by admin KYC page and admin dashboard

CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review', 'resubmit')),
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  nationality TEXT,
  country_of_residence TEXT,
  
  -- Address Information
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'United States',
  
  -- Contact Information
  phone_number TEXT NOT NULL,
  
  -- Identification
  id_type TEXT NOT NULL CHECK (id_type IN ('passport', 'driver_license', 'national_id', 'other')),
  id_number TEXT NOT NULL,
  id_front_url TEXT NOT NULL,
  id_back_url TEXT,
  
  -- Additional Documents
  proof_of_address_url TEXT,
  selfie_url TEXT,
  
  -- Admin Processing
  verified_by UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for kyc_verifications
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_created_at ON kyc_verifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_verified_by ON kyc_verifications(verified_by);

-- ============================================
-- STEP 2: UPDATE CRYPTO_TRANSACTIONS TABLE
-- ============================================
-- Add missing fields for admin crypto page

-- Add admin-related fields if they don't exist
DO $$ 
BEGIN
  -- Add admin_id field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'admin_id'
  ) THEN
    ALTER TABLE crypto_transactions ADD COLUMN admin_id UUID REFERENCES user_profiles(id);
  END IF;

  -- Add admin_notes field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE crypto_transactions ADD COLUMN admin_notes TEXT;
  END IF;

  -- Add processed_at field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'processed_at'
  ) THEN
    ALTER TABLE crypto_transactions ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add btc_amount field if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'btc_amount'
  ) THEN
    ALTER TABLE crypto_transactions ADD COLUMN btc_amount DECIMAL(18, 8) DEFAULT 0.00000000;
  END IF;

  -- Add btc_price field if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'btc_price'
  ) THEN
    ALTER TABLE crypto_transactions ADD COLUMN btc_price DECIMAL(15, 2);
  END IF;

  -- Add status column if it doesn't exist FIRST (before adding constraint)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE crypto_transactions ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;

  -- Update transaction_type constraint to include crypto_fund
  ALTER TABLE crypto_transactions DROP CONSTRAINT IF EXISTS crypto_transactions_transaction_type_check;
  ALTER TABLE crypto_transactions 
    ADD CONSTRAINT crypto_transactions_transaction_type_check 
    CHECK (transaction_type IN ('buy', 'sell', 'crypto_fund', 'btc_buy', 'btc_sell'));

  -- Update status constraint to include cancelled (now that column exists)
  ALTER TABLE crypto_transactions DROP CONSTRAINT IF EXISTS crypto_transactions_status_check;
  ALTER TABLE crypto_transactions 
    ADD CONSTRAINT crypto_transactions_status_check 
    CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));
END $$;

-- Create indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_admin_id ON crypto_transactions(admin_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_status ON crypto_transactions(status);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_transaction_type ON crypto_transactions(transaction_type);

-- ============================================
-- STEP 3: UPDATE USER_PROFILES TABLE
-- ============================================
-- Add any missing fields that admin pages might need

DO $$ 
BEGIN
  -- Add profile_picture_url if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'profile_picture_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN profile_picture_url TEXT;
  END IF;

  -- Add otp_enabled if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'otp_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN otp_enabled BOOLEAN DEFAULT false;
  END IF;

  -- Add frozen_at if missing (for freeze tracking)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'frozen_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN frozen_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add tier field if missing (for user tiers)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'tier'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'kyc_verified', 'premium', 'business'));
  END IF;
END $$;

-- Create index for tier
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON user_profiles(tier);

-- ============================================
-- STEP 4: UPDATE LOANS TABLE
-- ============================================
-- Add loan_amount field if missing (used in admin dashboard)

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'loan_amount'
  ) THEN
    ALTER TABLE loans ADD COLUMN loan_amount DECIMAL(15, 2);
    -- Update existing records
    UPDATE loans SET loan_amount = amount WHERE loan_amount IS NULL;
  END IF;
END $$;

-- ============================================
-- STEP 5: ENABLE RLS ON KYC_VERIFICATIONS
-- ============================================

ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own KYC" ON kyc_verifications;
DROP POLICY IF EXISTS "Users can insert own KYC" ON kyc_verifications;
DROP POLICY IF EXISTS "Users can update own KYC" ON kyc_verifications;
DROP POLICY IF EXISTS "Admins can view all KYC" ON kyc_verifications;
DROP POLICY IF EXISTS "Admins can update all KYC" ON kyc_verifications;

-- User policies
CREATE POLICY "Users can view own KYC"
  ON kyc_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC"
  ON kyc_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC"
  ON kyc_verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all KYC"
  ON kyc_verifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update all KYC"
  ON kyc_verifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================
-- STEP 6: ADD ADMIN RLS POLICIES FOR CRYPTO_TRANSACTIONS
-- ============================================

-- Allow admins to update crypto transactions
DROP POLICY IF EXISTS "Admins can update crypto transactions" ON crypto_transactions;
CREATE POLICY "Admins can update crypto transactions"
  ON crypto_transactions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- Allow admins to view all crypto transactions (if not already exists)
DROP POLICY IF EXISTS "Admins can view all crypto transactions" ON crypto_transactions;
CREATE POLICY "Admins can view all crypto transactions"
  ON crypto_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
    OR auth.uid() = user_id
  );

-- ============================================
-- STEP 7: CREATE TRIGGER FOR KYC_VERIFICATIONS UPDATED_AT
-- ============================================

DROP TRIGGER IF EXISTS update_kyc_verifications_updated_at ON kyc_verifications;
CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 8: CREATE FUNCTION TO AUTO-UPDATE USER KYC STATUS
-- ============================================
-- When KYC is approved, update user_profiles.kyc_status

CREATE OR REPLACE FUNCTION update_user_kyc_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When KYC is approved, update user profile
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE user_profiles
    SET kyc_status = 'approved',
        tier = CASE 
          WHEN tier = 'basic' THEN 'kyc_verified'
          ELSE tier
        END
    WHERE id = NEW.user_id;
  END IF;

  -- When KYC is rejected, update user profile
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    UPDATE user_profiles
    SET kyc_status = 'rejected'
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_user_kyc_status ON kyc_verifications;
CREATE TRIGGER trigger_update_user_kyc_status
  AFTER UPDATE OF status ON kyc_verifications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_user_kyc_status();

-- ============================================
-- STEP 9: CREATE STORAGE BUCKETS FOR ADMIN
-- ============================================
-- These buckets may already exist, so we use IF NOT EXISTS logic

-- KYC Documents Bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Loan Documents Bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('loan-documents', 'loan-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 10: CREATE STORAGE POLICIES
-- ============================================

-- KYC Documents Storage Policies
DROP POLICY IF EXISTS "Users can upload own KYC documents" ON storage.objects;
CREATE POLICY "Users can upload own KYC documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'kyc-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view own KYC documents" ON storage.objects;
CREATE POLICY "Users can view own KYC documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'kyc-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;
CREATE POLICY "Admins can view all KYC documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- Loan Documents Storage Policies
DROP POLICY IF EXISTS "Users can upload own loan documents" ON storage.objects;
CREATE POLICY "Users can upload own loan documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'loan-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view own loan documents" ON storage.objects;
CREATE POLICY "Users can view own loan documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'loan-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Admins can view all loan documents" ON storage.objects;
CREATE POLICY "Admins can view all loan documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'loan-documents'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything was created:

-- Check kyc_verifications table exists:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name = 'kyc_verifications';

-- Check crypto_transactions has admin fields:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'crypto_transactions' 
-- AND column_name IN ('admin_id', 'admin_notes', 'processed_at', 'btc_amount', 'btc_price');

-- Check user_profiles has new fields:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'user_profiles' 
-- AND column_name IN ('profile_picture_url', 'otp_enabled', 'frozen_at', 'tier');

-- ============================================
-- COMPLETE!
-- ============================================
-- All admin-side tables, fields, and policies have been added.
-- Admin pages should now work correctly!

