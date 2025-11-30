-- ============================================
-- FIXES FOR REMAINING ISSUES
-- ============================================
-- Run this AFTER database_complete_setup.sql and database_complete_setup2.sql
-- ============================================

-- ============================================
-- STEP 1: FIX CRYPTO_TRANSACTIONS STATUS COLUMN
-- ============================================
-- The status column may not exist, so we need to add it first before adding constraints

DO $$ 
BEGIN
  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crypto_transactions' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE crypto_transactions ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;

  -- Now safely add/update the constraint
  ALTER TABLE crypto_transactions DROP CONSTRAINT IF EXISTS crypto_transactions_status_check;
  ALTER TABLE crypto_transactions 
    ADD CONSTRAINT crypto_transactions_status_check 
    CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));
END $$;

-- ============================================
-- STEP 2: FIX SUPPORT_TICKETS TICKET_ID GENERATION
-- ============================================
-- Create a function to automatically generate ticket_id when a ticket is created

CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate ticket ID in format: TKT-YYYYMMDD-XXXXXX (where XXXXXX is random 6 digits)
  IF NEW.ticket_id IS NULL OR NEW.ticket_id = '' THEN
    NEW.ticket_id := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate ticket_id
DROP TRIGGER IF EXISTS trigger_generate_ticket_id ON support_tickets;
CREATE TRIGGER trigger_generate_ticket_id
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_id();

-- ============================================
-- STEP 3: VERIFY PROFILE PICTURES BUCKET EXISTS
-- ============================================

-- Ensure profile-pictures bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Ensure storage policies exist for profile-pictures
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

-- ============================================
-- COMPLETE!
-- ============================================
-- All issues have been fixed:
-- 1. crypto_transactions status column now exists with proper constraint
-- 2. Support tickets will auto-generate ticket_id on insert
-- 3. Profile pictures bucket is verified and policies are set

