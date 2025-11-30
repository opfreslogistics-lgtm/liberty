-- ============================================
-- ADD OTP FIELDS TO USER_PROFILES
-- ============================================
-- Run this script in Supabase SQL Editor
-- Adds OTP code, OTP enabled flag, and OTP expiry timestamp to user_profiles
-- ============================================

-- ============================================
-- STEP 1: ADD OTP-RELATED COLUMNS
-- ============================================

DO $$ 
BEGIN
  -- Add OTP code field (stores the 6-digit code)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'otp_code'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN otp_code TEXT;
    COMMENT ON COLUMN user_profiles.otp_code IS '6-digit OTP code generated on login';
  END IF;

  -- Add OTP enabled flag (enabled by default)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'otp_enabled_login'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN otp_enabled_login BOOLEAN DEFAULT true;
    COMMENT ON COLUMN user_profiles.otp_enabled_login IS 'Whether OTP is required on login (default: true)';
    
    -- Set existing users to have OTP enabled by default
    UPDATE user_profiles 
    SET otp_enabled_login = true 
    WHERE otp_enabled_login IS NULL;
  END IF;

  -- Add OTP expiry timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'otp_expires_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN otp_expires_at TIMESTAMP WITH TIME ZONE;
    COMMENT ON COLUMN user_profiles.otp_expires_at IS 'Timestamp when the OTP code expires (typically 10 minutes from generation)';
  END IF;

  -- Add OTP generated at timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'otp_generated_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN otp_generated_at TIMESTAMP WITH TIME ZONE;
    COMMENT ON COLUMN user_profiles.otp_generated_at IS 'Timestamp when the OTP code was generated';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if columns exist:
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'user_profiles' 
-- AND column_name IN ('otp_code', 'otp_enabled_login', 'otp_expires_at', 'otp_generated_at')
-- ORDER BY column_name;

-- ============================================
-- COMPLETE!
-- ============================================
-- The user_profiles table now has:
-- ✅ otp_code (TEXT) - Stores 6-digit OTP code
-- ✅ otp_enabled_login (BOOLEAN, default: true) - Admin can toggle this
-- ✅ otp_expires_at (TIMESTAMP) - When OTP expires
-- ✅ otp_generated_at (TIMESTAMP) - When OTP was generated
--
-- OTP is enabled by default for all users. Admins can toggle it off if needed.

