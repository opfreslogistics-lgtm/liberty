# Storage Fix - Permission Error Solution

## 🐛 Error Fixed

**Error**: `must be owner of table objects`

**Cause**: Directly modifying `storage.objects` table or creating policies requires elevated permissions that regular SQL editor users don't have.

## ✅ Solution

Created two versions of the fix:

### Version 1: `database_fix_storage_and_mobile_deposit.sql`
- Removed `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;` (not needed, RLS is already enabled)
- Creates buckets and policies directly
- **Use this if you have full admin permissions**

### Version 2: `database_fix_storage_and_mobile_deposit_v2.sql` (RECOMMENDED)
- Creates buckets via SQL (should work)
- Uses a `SECURITY DEFINER` function to create policies with elevated privileges
- Avoids permission errors
- **Use this version if you get permission errors**

## 🚀 How to Apply

### Option A: Run V2 Script (Recommended)
1. Run `database_fix_storage_and_mobile_deposit_v2.sql` in Supabase SQL Editor
2. This version uses SECURITY DEFINER functions to bypass permission issues

### Option B: Create Buckets Manually via Dashboard
If SQL still fails, create buckets manually:

1. **Go to Supabase Dashboard** → **Storage**
2. **Create New Bucket**:
   - Bucket name: `bill-logos`
   - Public: ✅ Yes
3. **Create Another Bucket**:
   - Bucket name: `app-images`
   - Public: ✅ Yes

4. **Then run only the mobile deposit fix**:
```sql
-- Fix mobile deposit reference_number column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mobile_deposits' 
    AND column_name = 'reference_number'
  ) THEN
    ALTER TABLE mobile_deposits DROP COLUMN IF EXISTS reference_number CASCADE;
  END IF;
  
  ALTER TABLE mobile_deposits ADD COLUMN reference_number TEXT;
  CREATE INDEX IF NOT EXISTS idx_mobile_deposits_reference_number ON mobile_deposits(reference_number);
END $$;
```

## 📋 What Gets Fixed

✅ **Mobile Deposit**:
- `reference_number` column added to `mobile_deposits` table

✅ **Bill-Logos Bucket**:
- Bucket created (public)
- Policies for admin upload, public view

✅ **App-Images Bucket**:
- Bucket created/updated (public)
- Policies for admin upload/update/delete, public view

## 🔍 Verify After Running

Check buckets exist:
```sql
SELECT id, name, public FROM storage.buckets 
WHERE id IN ('bill-logos', 'app-images');
```

Check mobile_deposits column:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mobile_deposits' 
AND column_name = 'reference_number';
```

---

**Recommended: Use `database_fix_storage_and_mobile_deposit_v2.sql`** ✅

