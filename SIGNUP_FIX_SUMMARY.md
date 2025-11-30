# Signup Account Type Error - Fix Summary

## Problems
When trying to sign up for an account, users encountered two errors:

1. **First Error:**
```
column "account_type" does not exist
```
This error occurred when the signup process tried to create bank accounts after the user selected their account types in Step 2 of the registration process.

2. **Second Error (after fixing the first):**
```
new row violates row-level security policy for table "user_profiles"
```
This error occurred when trying to insert the user profile during Step 1 of the registration process, because the RLS (Row Level Security) INSERT policy was missing or incorrectly configured.

## Root Causes

1. **Missing `account_type` column**: The database schema was missing the `account_type` column in the `accounts` table. While the schema files defined this column, it appears the database was not properly migrated or the column was never created.

2. **Missing RLS INSERT policies**: The Row Level Security policies that allow users to insert their own profile during signup were missing or incorrectly configured. Without these policies, Supabase blocks the INSERT operation for security reasons.

## Solution
A comprehensive database migration script has been created: `database_fix_account_type_column.sql`

This script:
1. ✅ Adds the `account_type` column to the `accounts` table if it doesn't exist
2. ✅ Adds proper constraints (CHECK constraint for valid account types)
3. ✅ Creates necessary indexes for performance
4. ✅ Also fixes other missing columns that may be needed:
   - `account_status` in `user_profiles` table
   - `username` in `user_profiles` table
   - `freeze_reason` in `user_profiles` table
   - `otp_enabled` in `user_profiles` table
5. ✅ **Creates/updates RLS policies** to allow signup:
   - `Users can insert own profile` - allows users to create their profile during signup
   - `Users can view own profile` - allows users to view their profile (needed for username check)
   - `Users can insert own accounts` - allows users to create accounts during signup step 2
   - `Users can view own accounts` - allows users to view their accounts

## How to Fix

### Step 1: Run the Migration Script
1. Open your Supabase Dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `database_fix_account_type_column.sql`
4. Run the script
5. You should see success messages indicating which columns were added

### Step 2: Verify the Fix
After running the migration, you can verify by running this query in Supabase SQL Editor:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('accounts', 'user_profiles')
AND column_name IN ('account_type', 'account_status', 'username')
ORDER BY table_name, column_name;
```

You should see:
- `accounts.account_type` (TEXT, NOT NULL)
- `user_profiles.account_status` (TEXT, default 'active')
- `user_profiles.username` (TEXT, nullable)

### Step 3: Test Signup
1. Try signing up for a new account
2. Complete Step 1 (Basic Information)
3. Complete Step 2 (Account Details) - **This is where the error occurred**
4. Select one or more account types (checking, savings, business, fixed-deposit)
5. The accounts should now be created successfully
6. Complete Step 3 (Verification)

## What the Migration Does

### For `accounts` table:
- Adds `account_type` column (TEXT, NOT NULL)
- Adds CHECK constraint: `account_type IN ('checking', 'savings', 'business', 'fixed-deposit')`
- Sets default value 'checking' for any existing accounts
- Creates index `idx_accounts_account_type` for faster queries

### For `user_profiles` table:
- Adds `account_status` column (TEXT, default 'active')
- Adds CHECK constraint: `account_status IN ('active', 'frozen', 'deleted')`
- Adds `username` column (TEXT, nullable, unique)
- Adds `freeze_reason` column (TEXT, nullable)
- Adds `otp_enabled` column (BOOLEAN, default false)
- Creates indexes for performance
- **Creates RLS policies:**
  - `Users can insert own profile` - allows signup
  - `Users can view own profile` - allows profile access

### For `accounts` table:
- **Creates RLS policies:**
  - `Users can insert own accounts` - allows account creation during signup
  - `Users can view own accounts` - allows account access

## Signup Flow (After Fix)

1. **Step 1**: User enters basic info (name, email, password, etc.)
   - Creates Supabase auth user
   - Creates user profile in `user_profiles` table

2. **Step 2**: User enters KYC info and selects account types
   - Updates user profile with KYC information
   - **Creates accounts** in `accounts` table for each selected account type
   - Each account gets:
     - Unique 12-digit account number
     - Account type (checking, savings, business, or fixed-deposit)
     - Initial balance: $0.00
     - Status: 'active'

3. **Step 3**: User uploads driver's license
   - Updates profile with verification documents
   - Redirects to dashboard

## Files Modified/Created

1. **`database_fix_account_type_column.sql`** (NEW)
   - Comprehensive migration script to fix all missing columns

2. **`app/signup/page.tsx`** (NO CHANGES NEEDED)
   - Already correctly uses `account_type` when creating accounts
   - Code at line 383: `account_type: accountType`

## Notes

- The migration script is **idempotent** - it's safe to run multiple times
- It checks if columns exist before adding them
- It won't break existing data
- If columns already exist, it will just verify and report success

## Related Files

- `database_schema.sql` - Base schema (should include account_type)
- `database_schema_complete.sql` - Complete schema with all tables
- `app/signup/page.tsx` - Signup page that creates accounts
- `MULTI_ACCOUNT_SIGNUP.md` - Documentation about multi-account signup feature

