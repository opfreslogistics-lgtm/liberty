# How to Check if account_type Column Exists

## Important Clarification
**`account_type` is NOT a table** - it's a **COLUMN** inside the `accounts` table!

## Steps to Check in Supabase

### 1. Go to Table Editor in Supabase
- Open your Supabase project
- Click on "Table Editor" in the left sidebar
- Look for the **`accounts`** table (NOT `account_type` - that doesn't exist as a table!)

### 2. Check the accounts Table Structure
Once you open the `accounts` table, you should see columns like:
- `id`
- `user_id`
- `account_number`
- `balance`
- `status`
- **`account_type`** ← This is what you're looking for!
- `last4`
- `created_at`
- `updated_at`

### 3. If You Don't See `account_type` Column

Run this simple script in the SQL Editor:

```sql
-- Add account_type column
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS account_type TEXT;

-- Update any NULL values
UPDATE accounts SET account_type = 'checking' WHERE account_type IS NULL;

-- Make it NOT NULL
ALTER TABLE accounts ALTER COLUMN account_type SET NOT NULL;

-- Add constraint
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_account_type_check;
ALTER TABLE accounts 
ADD CONSTRAINT accounts_account_type_check 
CHECK (account_type IN ('checking', 'savings', 'business'));

-- Create index
CREATE INDEX IF NOT EXISTS idx_accounts_account_type ON accounts(account_type);
```

### 4. Verify Using SQL Query

Run this in SQL Editor to check:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'accounts' 
  AND column_name = 'account_type';
```

**Expected Result:**
- If the column exists, you'll see one row with:
  - `column_name`: `account_type`
  - `data_type`: `text`
  - `is_nullable`: `NO`

- If the column doesn't exist, you'll see "0 rows returned"

## Quick Fix Script

If the column is missing, run the file:
- **`database_SIMPLE_ADD_ACCOUNT_TYPE.sql`**

This is the simplest script that will definitely add the column.

## Troubleshooting

### Issue: "relation accounts does not exist"
**Solution:** The `accounts` table doesn't exist. You need to run the full setup script first.

### Issue: "column account_type already exists"
**Solution:** The column exists! You can ignore this error. The issue might be elsewhere.

### Issue: "permission denied"
**Solution:** Make sure you're running the script in the SQL Editor with proper permissions.

## Visual Guide

In Supabase Table Editor:
```
📁 Tables
  └── 📄 accounts ← Open this table
       ├── id
       ├── user_id
       ├── account_number
       ├── balance
       ├── status
       ├── account_type ← This is what you need!
       ├── last4
       ├── created_at
       └── updated_at
```

**NOT this:**
```
❌ account_type (this doesn't exist as a table)
```

