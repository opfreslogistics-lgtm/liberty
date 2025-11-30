-- ============================================
-- COMPREHENSIVE DATABASE FIX FOR ALL ISSUES
-- ============================================
-- Run this script in Supabase SQL Editor
-- This fixes all missing columns, buckets, and balance update issues
-- ============================================

-- ============================================
-- STEP 1: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add reference_number to mobile_deposits table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mobile_deposits' 
    AND column_name = 'reference_number'
  ) THEN
    ALTER TABLE mobile_deposits ADD COLUMN reference_number TEXT;
    CREATE INDEX IF NOT EXISTS idx_mobile_deposits_reference_number ON mobile_deposits(reference_number);
  END IF;
END $$;

-- Add transaction_id to mobile_deposits if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mobile_deposits' 
    AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE mobile_deposits ADD COLUMN transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add profile_picture_url to user_profiles if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'profile_picture_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN profile_picture_url TEXT;
  END IF;
END $$;

-- Add otp_enabled to user_profiles if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'otp_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN otp_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add frozen_at to user_profiles if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'frozen_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN frozen_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add tier to user_profiles if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'tier'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'premium', 'vip', 'elite'));
  END IF;
END $$;

-- ============================================
-- STEP 2: CREATE BALANCE UPDATE TRIGGER FUNCTION
-- ============================================
-- This ensures account balances are automatically updated when transactions are created

CREATE OR REPLACE FUNCTION update_account_balance_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  account_balance DECIMAL(15, 2);
  transaction_amount DECIMAL(15, 2);
  new_balance DECIMAL(15, 2);
BEGIN
  -- Only process completed, non-pending transactions
  IF NEW.status = 'completed' AND (NEW.pending = false OR NEW.pending IS NULL) AND NEW.account_id IS NOT NULL THEN
    transaction_amount := NEW.amount;
    
    -- Get current account balance
    SELECT COALESCE(balance, 0) INTO account_balance
    FROM accounts
    WHERE id = NEW.account_id;
    
    -- Calculate new balance based on transaction type
    IF NEW.type = 'credit' THEN
      new_balance := account_balance + transaction_amount;
    ELSIF NEW.type = 'debit' THEN
      new_balance := account_balance - transaction_amount;
    ELSE
      -- For transfer or other types, don't change balance here
      RETURN NEW;
    END IF;
    
    -- Update account balance
    UPDATE accounts
    SET balance = new_balance,
        updated_at = NOW()
    WHERE id = NEW.account_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for balance updates
DROP TRIGGER IF EXISTS trigger_update_balance_on_transaction ON transactions;
CREATE TRIGGER trigger_update_balance_on_transaction
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance_on_transaction();

-- ============================================
-- STEP 3: CREATE STORAGE BUCKETS
-- ============================================

-- Profile Pictures Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- App Images Bucket (for logos, favicons)
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-images', 'app-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 4: CREATE STORAGE POLICIES
-- ============================================

-- Profile Pictures Storage Policies
DROP POLICY IF EXISTS "Users can upload own profile pictures" ON storage.objects;
CREATE POLICY "Users can upload own profile pictures"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view profile pictures" ON storage.objects;
CREATE POLICY "Users can view profile pictures"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'profile-pictures');

DROP POLICY IF EXISTS "Users can update own profile pictures" ON storage.objects;
CREATE POLICY "Users can update own profile pictures"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own profile pictures" ON storage.objects;
CREATE POLICY "Users can delete own profile pictures"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- App Images Storage Policies (for admin logos/favicons)
DROP POLICY IF EXISTS "Admins can upload app images" ON storage.objects;
CREATE POLICY "Admins can upload app images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'app-images'
    AND is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Anyone can view app images" ON storage.objects;
CREATE POLICY "Anyone can view app images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'app-images');

DROP POLICY IF EXISTS "Admins can update app images" ON storage.objects;
CREATE POLICY "Admins can update app images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'app-images'
    AND is_admin(auth.uid())
  )
  WITH CHECK (
    bucket_id = 'app-images'
    AND is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins can delete app images" ON storage.objects;
CREATE POLICY "Admins can delete app images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'app-images'
    AND is_admin(auth.uid())
  );

-- ============================================
-- STEP 5: ENSURE APP_SETTINGS TABLE HAS ALL LOGO/Favicon COLUMNS
-- ============================================

DO $$ 
BEGIN
  -- Add app_logo if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'app_logo'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN app_logo TEXT;
  END IF;

  -- Add app_logo_light if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'app_logo_light'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN app_logo_light TEXT;
  END IF;

  -- Add app_logo_dark if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'app_logo_dark'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN app_logo_dark TEXT;
  END IF;

  -- Add app_favicon if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'app_favicon'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN app_favicon TEXT;
  END IF;

  -- Add footer_logo_light if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'footer_logo_light'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN footer_logo_light TEXT;
  END IF;

  -- Add footer_logo_dark if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'footer_logo_dark'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN footer_logo_dark TEXT;
  END IF;
END $$;

-- ============================================
-- STEP 6: SYNC ALL ACCOUNT BALANCES FROM TRANSACTIONS
-- ============================================
-- This ensures all balances match their transaction history

CREATE OR REPLACE FUNCTION sync_all_account_balances()
RETURNS void AS $$
DECLARE
  account_record RECORD;
  calculated_balance DECIMAL(15, 2);
BEGIN
  FOR account_record IN SELECT id FROM accounts LOOP
    -- Calculate balance from all completed transactions
    SELECT COALESCE(
      SUM(
        CASE 
          WHEN type = 'credit' AND status = 'completed' AND (pending = false OR pending IS NULL) THEN amount
          WHEN type = 'debit' AND status = 'completed' AND (pending = false OR pending IS NULL) THEN -amount
          ELSE 0
        END
      ),
      0
    ) INTO calculated_balance
    FROM transactions
    WHERE account_id = account_record.id;
    
    -- Update account balance
    UPDATE accounts
    SET balance = calculated_balance,
        updated_at = NOW()
    WHERE id = account_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function to fix any existing balance discrepancies
SELECT sync_all_account_balances();

-- ============================================
-- STEP 7: VERIFY AND CREATE MISSING INDEXES
-- ============================================

-- Ensure mobile_deposits has proper indexes
CREATE INDEX IF NOT EXISTS idx_mobile_deposits_transaction_id ON mobile_deposits(transaction_id);

-- Ensure transactions has reference_number index
CREATE INDEX IF NOT EXISTS idx_transactions_reference_number ON transactions(reference_number) WHERE reference_number IS NOT NULL;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything was created:

-- Check mobile_deposits has reference_number:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'mobile_deposits' 
-- AND column_name = 'reference_number';

-- Check profile_picture_url exists:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'user_profiles' 
-- AND column_name = 'profile_picture_url';

-- Check buckets exist:
-- SELECT * FROM storage.buckets WHERE id IN ('profile-pictures', 'app-images');

-- Check trigger exists:
-- SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_balance_on_transaction';

-- ============================================
-- COMPLETE!
-- ============================================
-- All missing columns, buckets, and balance triggers have been created.
-- The system will now:
-- 1. Automatically update account balances when transactions are created
-- 2. Support profile picture uploads
-- 3. Support app logo/favicon uploads
-- 4. Have reference_number in mobile_deposits
-- All admin pages should now work correctly!

