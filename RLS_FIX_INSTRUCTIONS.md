# Fix Infinite Recursion in RLS Policies

## 🔴 Problem

When signing up, you're getting this error:
```
infinite recursion detected in policy for relation "user_profiles"
```

This happens because the admin RLS policies are checking if a user is admin by querying the `user_profiles` table itself, which triggers the same policies again, creating an infinite loop.

## ✅ Solution

I've created a fix that uses a `SECURITY DEFINER` function to bypass RLS when checking admin status. This breaks the circular dependency.

## 📋 How to Fix

### Option 1: Quick Fix (Recommended)

Run this SQL file in your Supabase SQL Editor:
```
database_fix_rls_recursion.sql
```

This file will:
1. Drop all problematic admin policies
2. Create the `is_admin()` helper function
3. Recreate all admin policies using the helper function

### Option 2: Full Schema Recreate

Run the updated complete schema:
```
database_schema_complete.sql
```

This file now includes the fix from the start.

## 🔧 What the Fix Does

1. **Creates `is_admin()` Function**:
   - Uses `SECURITY DEFINER` to bypass RLS
   - Checks user role without triggering policy checks
   - Prevents infinite recursion

2. **Updates All Admin Policies**:
   - Replaces `EXISTS (SELECT 1 FROM user_profiles...)` patterns
   - Uses `is_admin(auth.uid())` instead
   - Breaks the circular dependency

## 📝 SQL to Run

If you want to fix it manually, run this:

```sql
-- 1. Create helper function
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role IN ('admin', 'superadmin'), false);
END;
$$;

-- 2. Drop old policies (all the ones with EXISTS...)
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
-- ... (drop all other admin policies)

-- 3. Recreate policies using is_admin()
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (is_admin(auth.uid()));
-- ... (recreate all other admin policies)
```

## ✅ After Running the Fix

1. Try signing up again
2. The infinite recursion error should be gone
3. Signup should work correctly

## 🔍 How to Verify

After running the fix, verify it worked:

```sql
-- Check that the function exists
SELECT proname FROM pg_proc WHERE proname = 'is_admin';

-- Test the function (replace with a real user ID)
SELECT is_admin('your-user-id-here');
```

---

**Run `database_fix_rls_recursion.sql` to fix the issue immediately!** 🔧




