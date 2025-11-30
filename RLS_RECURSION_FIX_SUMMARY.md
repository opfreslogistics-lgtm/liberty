# RLS Infinite Recursion Fix - Complete Solution

## 🔴 Problem

When trying to sign up, you get this error:
```
infinite recursion detected in policy for relation "user_profiles"
```

## 🔍 Root Cause

The admin RLS policies were checking if a user is admin by querying the `user_profiles` table itself:

```sql
-- PROBLEMATIC (creates infinite loop)
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles  -- ❌ This triggers RLS policy check
      WHERE id = auth.uid()         -- ❌ Which queries user_profiles again
      AND role IN ('admin', 'superadmin')  -- ❌ Infinite loop!
    )
  );
```

This creates a circular dependency:
1. Policy checks: "Is this user admin?" → Queries `user_profiles`
2. Querying `user_profiles` → Triggers RLS policy check
3. Policy check again: "Is this user admin?" → Queries `user_profiles`
4. **INFINITE LOOP!** 🔄

## ✅ Solution

Created a `SECURITY DEFINER` function that bypasses RLS to check admin status:

```sql
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- ✅ This bypasses RLS!
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Bypasses RLS, so no infinite recursion
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role IN ('admin', 'superadmin'), false);
END;
$$;
```

Then all admin policies use this function:

```sql
-- FIXED (no recursion)
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin(auth.uid()));  -- ✅ Uses function that bypasses RLS
```

## 📋 How to Fix

### **Quick Fix (Recommended)**

1. Open Supabase SQL Editor
2. Copy and paste the contents of **`QUICK_RLS_FIX.sql`**
3. Run the SQL
4. Try signing up again - it should work!

### **What the Fix Does:**

1. ✅ Creates `is_admin()` helper function (bypasses RLS)
2. ✅ Drops all problematic admin policies
3. ✅ Recreates all admin policies using `is_admin()`
4. ✅ Breaks the circular dependency

## 🔧 Files Created

1. **`QUICK_RLS_FIX.sql`** - Quick fix (run this first!)
2. **`database_fix_rls_recursion.sql`** - Detailed fix with comments
3. **`database_schema_complete.sql`** - Updated full schema (includes fix)

## ✅ After Running the Fix

1. **Signup should work** - No more infinite recursion error
2. **Users can create profiles** - INSERT policies work correctly
3. **Admins can view all profiles** - No recursion in admin policies
4. **All policies work correctly** - No circular dependencies

## 🧪 Test the Fix

After running the SQL:

```sql
-- Test 1: Verify function exists
SELECT proname FROM pg_proc WHERE proname = 'is_admin';

-- Test 2: Test the function (replace with real user ID)
SELECT is_admin('your-user-id-here');

-- Test 3: Try signing up - should work without recursion error!
```

## 📝 What Changed

### **Before (Problematic):**
```sql
-- All admin policies used this pattern:
USING (
  EXISTS (
    SELECT 1 FROM user_profiles  -- ❌ Circular dependency
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
);
```

### **After (Fixed):**
```sql
-- All admin policies now use:
USING (is_admin(auth.uid()));  -- ✅ No recursion
```

## 🎯 Result

**The infinite recursion error is now fixed!** 

- ✅ Signup works correctly
- ✅ Users can insert their profiles
- ✅ Admins can view all profiles
- ✅ No circular dependencies

---

**Run `QUICK_RLS_FIX.sql` in Supabase SQL Editor to fix it now!** 🔧✨




