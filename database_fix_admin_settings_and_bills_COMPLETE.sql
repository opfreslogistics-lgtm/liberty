-- ============================================
-- COMPREHENSIVE FIX FOR ADMIN SETTINGS AND BILLS
-- ============================================
-- Run this script in Supabase SQL Editor
-- This fixes:
-- 1. Creates app_settings table with KEY-VALUE structure (as used by code)
-- 2. Adds assigned_by column to bills table
-- 3. Ensures all storage buckets exist
-- ============================================

-- ============================================
-- STEP 1: CREATE/FIX APP_SETTINGS TABLE (KEY-VALUE STRUCTURE)
-- ============================================

-- Drop existing app_settings table if it has wrong structure (backup first!)
-- First check if it exists and has columns (old structure)
DO $$
BEGIN
  -- If table exists with column-based structure, we need to migrate it
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'app_settings'
  ) THEN
    -- Check if it has setting_key column (key-value structure)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'app_settings' 
      AND column_name = 'setting_key'
    ) THEN
      -- Old structure detected - drop and recreate
      DROP TABLE IF EXISTS app_settings CASCADE;
      
      -- Create new key-value structure table
      CREATE TABLE app_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        setting_key TEXT NOT NULL UNIQUE,
        setting_value TEXT,
        setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'image_url', 'json')),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);
    END IF;
  ELSE
    -- Table doesn't exist - create it
    CREATE TABLE app_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      setting_key TEXT NOT NULL UNIQUE,
      setting_value TEXT,
      setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'image_url', 'json')),
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);
  END IF;
END $$;

-- ============================================
-- STEP 2: INSERT DEFAULT SETTINGS (if they don't exist)
-- ============================================

-- General Settings
INSERT INTO app_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('app_name', 'Liberty National Bank', 'text', 'Application name'),
  ('support_email', 'support@libertybank.com', 'text', 'Support email address'),
  ('support_phone', '+1 (555) 123-4567', 'text', 'Support phone number'),
  ('support_hours', '24/7', 'text', 'Support hours'),
  ('timezone', 'America/New_York', 'text', 'System timezone'),
  ('currency', 'USD', 'text', 'Default currency'),
  ('date_format', 'MM/DD/YYYY', 'text', 'Date format')
ON CONFLICT (setting_key) DO NOTHING;

-- Security Settings
INSERT INTO app_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('two_factor_required', 'false', 'text', 'Require 2FA for all admin accounts'),
  ('password_min_length', '12', 'text', 'Minimum password length'),
  ('session_timeout', '30', 'text', 'Session timeout in minutes'),
  ('max_login_attempts', '5', 'text', 'Maximum login attempts'),
  ('ip_whitelist_enabled', 'false', 'text', 'Enable IP whitelist'),
  ('encryption_level', 'high', 'text', 'Encryption level'),
  ('audit_log_retention', '365', 'text', 'Audit log retention in days')
ON CONFLICT (setting_key) DO NOTHING;

-- Notification Settings
INSERT INTO app_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('email_notifications', 'true', 'text', 'Enable email notifications'),
  ('sms_notifications', 'false', 'text', 'Enable SMS notifications'),
  ('push_notifications', 'true', 'text', 'Enable push notifications'),
  ('fraud_alerts', 'true', 'text', 'Receive fraud alert notifications'),
  ('transaction_alerts', 'true', 'text', 'Receive transaction alerts'),
  ('system_alerts', 'true', 'text', 'Receive system alerts'),
  ('email_smtp_server', 'smtp.libertybank.com', 'text', 'SMTP server address'),
  ('email_smtp_port', '587', 'text', 'SMTP server port')
ON CONFLICT (setting_key) DO NOTHING;

-- Appearance Settings (image URLs)
INSERT INTO app_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('app_logo', NULL, 'image_url', 'Main application logo'),
  ('app_logo_light', NULL, 'image_url', 'Light mode logo'),
  ('app_logo_dark', NULL, 'image_url', 'Dark mode logo'),
  ('footer_logo_light', NULL, 'image_url', 'Footer light mode logo'),
  ('footer_logo_dark', NULL, 'image_url', 'Footer dark mode logo'),
  ('app_favicon', NULL, 'image_url', 'Application favicon'),
  ('contact_phone', NULL, 'text', 'Contact phone number'),
  ('contact_email', NULL, 'text', 'Contact email address'),
  ('contact_address', NULL, 'text', 'Contact address'),
  ('social_facebook_url', NULL, 'text', 'Facebook page URL'),
  ('social_twitter_url', NULL, 'text', 'Twitter/X profile URL'),
  ('social_instagram_url', NULL, 'text', 'Instagram profile URL'),
  ('social_linkedin_url', NULL, 'text', 'LinkedIn profile URL')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- STEP 3: ADD ASSIGNED_BY COLUMN TO BILLS TABLE
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
-- STEP 4: ENSURE ALL STORAGE BUCKETS EXIST
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
-- STEP 5: CREATE SECURITY DEFINER FUNCTION FOR STORAGE POLICIES
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
-- STEP 6: ENABLE RLS ON APP_SETTINGS
-- ============================================

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view app settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can update app settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can insert app settings" ON app_settings;

-- Create RLS policies
CREATE POLICY "Anyone can view app settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update app settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can insert app settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check app_settings structure:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'app_settings' 
-- ORDER BY ordinal_position;

-- Check app_settings has all keys:
-- SELECT setting_key, setting_value 
-- FROM app_settings 
-- ORDER BY setting_key;

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
-- 1. ✅ app_settings table created/updated with KEY-VALUE structure
-- 2. ✅ All default settings inserted
-- 3. ✅ assigned_by column added to bills table
-- 4. ✅ Storage buckets created (app-images, bill-logos)
-- 5. ✅ Storage policies created with SECURITY DEFINER function
-- 6. ✅ RLS policies for app_settings created
-- 
-- You can now:
-- - Save all general settings (will save to key-value table)
-- - Save all security settings
-- - Save all notification settings
-- - Upload logos and favicons in appearance settings
-- - Create bills with assigned_by field
-- - All settings will be properly saved to database!

