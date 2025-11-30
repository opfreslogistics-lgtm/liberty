-- ============================================
-- CREATE USER_DEVICES TABLE FOR ACTIVE DEVICE TRACKING
-- ============================================

-- Create user_devices table to track active devices/sessions
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL, -- Unique device identifier (fingerprint)
  device_name TEXT NOT NULL, -- e.g., "Chrome on Windows", "Safari on iPhone"
  device_type TEXT NOT NULL, -- 'desktop', 'mobile', 'tablet'
  browser TEXT, -- e.g., "Chrome", "Safari", "Firefox"
  browser_version TEXT,
  os TEXT, -- e.g., "Windows", "macOS", "iOS", "Android"
  os_version TEXT,
  ip_address TEXT,
  location TEXT, -- e.g., "New York, NY, US" (from IP geolocation)
  user_agent TEXT NOT NULL,
  is_current BOOLEAN DEFAULT false, -- True for the current session
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one current device per user
  UNIQUE(user_id, device_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_id ON user_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_last_active_at ON user_devices(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_devices_is_current ON user_devices(is_current);

-- ============================================
-- RLS POLICIES FOR USER_DEVICES
-- ============================================

-- Enable RLS
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- Users can view their own devices
DROP POLICY IF EXISTS "Users can view own devices" ON user_devices;
CREATE POLICY "Users can view own devices"
  ON user_devices FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own devices
DROP POLICY IF EXISTS "Users can insert own devices" ON user_devices;
CREATE POLICY "Users can insert own devices"
  ON user_devices FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own devices
DROP POLICY IF EXISTS "Users can update own devices" ON user_devices;
CREATE POLICY "Users can update own devices"
  ON user_devices FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own devices
DROP POLICY IF EXISTS "Users can delete own devices" ON user_devices;
CREATE POLICY "Users can delete own devices"
  ON user_devices FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all devices
DROP POLICY IF EXISTS "Admins can view all devices" ON user_devices;
CREATE POLICY "Admins can view all devices"
  ON user_devices FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can delete all devices
DROP POLICY IF EXISTS "Admins can delete all devices" ON user_devices;
CREATE POLICY "Admins can delete all devices"
  ON user_devices FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================
-- FUNCTION TO UPDATE LAST_ACTIVE_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_device_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update last_active_at
DROP TRIGGER IF EXISTS trigger_update_device_last_active ON user_devices;
CREATE TRIGGER trigger_update_device_last_active
  BEFORE UPDATE ON user_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_device_last_active();

-- ============================================
-- FUNCTION TO CLEAN UP OLD DEVICES
-- ============================================

-- Remove devices that haven't been active in 90 days
CREATE OR REPLACE FUNCTION cleanup_old_devices()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_devices
  WHERE last_active_at < NOW() - INTERVAL '90 days'
    AND is_current = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

