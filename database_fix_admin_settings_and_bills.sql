-- ============================================
-- COMPREHENSIVE FIX FOR ADMIN SETTINGS AND BILLS
-- ============================================
-- Run this script in Supabase SQL Editor
-- This fixes:
-- 1. All missing app_settings columns for admin settings page
-- 2. Missing assigned_by column in bills table
-- 3. Ensures all storage buckets exist
-- ============================================

-- ============================================
-- STEP 1: ADD MISSING COLUMNS TO APP_SETTINGS TABLE
-- ============================================

-- Security Settings Columns
DO $$ 
BEGIN
  -- two_factor_required
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'two_factor_required'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN two_factor_required TEXT DEFAULT 'false';
  END IF;

  -- password_min_length
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'password_min_length'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN password_min_length TEXT DEFAULT '12';
  END IF;

  -- session_timeout
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'session_timeout'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN session_timeout TEXT DEFAULT '30';
  END IF;

  -- max_login_attempts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'max_login_attempts'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN max_login_attempts TEXT DEFAULT '5';
  END IF;

  -- ip_whitelist_enabled
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'ip_whitelist_enabled'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN ip_whitelist_enabled TEXT DEFAULT 'false';
  END IF;

  -- encryption_level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'encryption_level'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN encryption_level TEXT DEFAULT 'high';
  END IF;

  -- audit_log_retention
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'audit_log_retention'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN audit_log_retention TEXT DEFAULT '365';
  END IF;
END $$;

-- Notification Settings Columns
DO $$ 
BEGIN
  -- email_notifications
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'email_notifications'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN email_notifications TEXT DEFAULT 'true';
  END IF;

  -- sms_notifications
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'sms_notifications'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN sms_notifications TEXT DEFAULT 'false';
  END IF;

  -- push_notifications
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'push_notifications'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN push_notifications TEXT DEFAULT 'true';
  END IF;

  -- fraud_alerts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'fraud_alerts'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN fraud_alerts TEXT DEFAULT 'true';
  END IF;

  -- transaction_alerts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'transaction_alerts'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN transaction_alerts TEXT DEFAULT 'true';
  END IF;

  -- system_alerts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'system_alerts'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN system_alerts TEXT DEFAULT 'true';
  END IF;

  -- email_smtp_server
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'email_smtp_server'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN email_smtp_server TEXT DEFAULT 'smtp.libertybank.com';
  END IF;

  -- email_smtp_port
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'email_smtp_port'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN email_smtp_port TEXT DEFAULT '587';
  END IF;
END $$;

-- ============================================
-- STEP 2: ADD ASSIGNED_BY COLUMN TO BILLS TABLE
-- ============================================

DO $$ 
BEGIN
  -- assigned_by (who assigned the bill to the user)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bills' 
    AND column_name = 'assigned_by'
  ) THEN
    ALTER TABLE bills ADD COLUMN assigned_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_bills_assigned_by ON bills(assigned_by);
  END IF;
END $$;

-- ============================================
-- STEP 3: ENSURE ALL STORAGE BUCKETS EXIST
-- ============================================

-- App Images Bucket (for logos, favicons)
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-images', 'app-images', true)
ON CONFLICT (id) DO UPDATE 
SET name = 'app-images', public = true;

-- Bill Logos Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('bill-logos', 'bill-logos', true)
ON CONFLICT (id) DO UPDATE 
SET name = 'bill-logos', public = true;

-- ============================================
-- STEP 4: CREATE SECURITY DEFINER FUNCTION FOR STORAGE POLICIES
-- ============================================

CREATE OR REPLACE FUNCTION create_admin_settings_storage_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  -- ============================================
  -- APP-IMAGES BUCKET POLICIES (for logos, favicons)
  -- ============================================
  
  -- Drop existing policies
  DROP POLICY IF EXISTS "Admins can upload app images" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view app images" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can update app images" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can delete app images" ON storage.objects;
  
  -- Admins can upload app images
  CREATE POLICY "Admins can upload app images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'app-images'
      AND is_admin(auth.uid())
    );
  
  -- Anyone can view app images (public bucket)
  CREATE POLICY "Public can view app images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'app-images');
  
  -- Admins can update app images
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
  
  -- Admins can delete app images
  CREATE POLICY "Admins can delete app images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'app-images'
      AND is_admin(auth.uid())
    );
  
  -- ============================================
  -- BILL-LOGOS BUCKET POLICIES
  -- ============================================
  
  -- Drop existing policies
  DROP POLICY IF EXISTS "Admins can upload bill logos" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view bill logos" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can update bill logos" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can delete bill logos" ON storage.objects;
  
  -- Admins can upload bill logos
  CREATE POLICY "Admins can upload bill logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'bill-logos'
      AND is_admin(auth.uid())
    );
  
  -- Anyone can view bill logos (public bucket)
  CREATE POLICY "Anyone can view bill logos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'bill-logos');
  
  -- Admins can update bill logos
  CREATE POLICY "Admins can update bill logos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'bill-logos'
      AND is_admin(auth.uid())
    )
    WITH CHECK (
      bucket_id = 'bill-logos'
      AND is_admin(auth.uid())
    );
  
  -- Admins can delete bill logos
  CREATE POLICY "Admins can delete bill logos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'bill-logos'
      AND is_admin(auth.uid())
    );
END;
$$;

-- Execute function to create storage policies
SELECT create_admin_settings_storage_policies();

-- ============================================
-- STEP 5: ENSURE APP_SETTINGS HAS A ROW
-- ============================================

-- Insert default app settings if no row exists
INSERT INTO app_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM app_settings LIMIT 1);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check app_settings columns:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'app_settings' 
-- ORDER BY ordinal_position;

-- Check bills has assigned_by:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'bills' 
-- AND column_name = 'assigned_by';

-- Check storage buckets:
-- SELECT id, name, public FROM storage.buckets 
-- WHERE id IN ('app-images', 'bill-logos');

-- ============================================
-- COMPLETE!
-- ============================================
-- All fixes have been applied:
-- 1. ✅ All app_settings columns for admin settings page added
-- 2. ✅ assigned_by column added to bills table
-- 3. ✅ Storage buckets created (app-images, bill-logos)
-- 4. ✅ Storage policies created with SECURITY DEFINER function
-- 
-- You can now:
-- - Save all general settings
-- - Save all security settings
-- - Save all notification settings
-- - Upload logos and favicons in appearance settings
-- - Create bills with assigned_by field
-- - All settings will be properly saved to database!

