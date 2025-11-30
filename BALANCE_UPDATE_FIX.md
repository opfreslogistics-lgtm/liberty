# Balance Update Fix - Card Funding & Transfers

## Problem
When funding cards or making transfers, the account balances were not updating in the dashboard, even though transactions were being recorded correctly.

## Root Cause
1. **Using stale local state**: The code was using account balances from React state instead of fetching fresh values from the database
2. **Balance type mismatch**: Supabase returns DECIMAL fields as strings, but the code wasn't parsing them correctly
3. **No database-first updates**: Updates were based on potentially outdated local state values

## Fixes Applied

### 1. Fixed Account Balance Parsing (`lib/hooks/useAccounts.ts`)
- ✅ Now properly parses DECIMAL values from Supabase (which come as strings)
- ✅ Handles null, undefined, string, and number types safely
- ✅ Added console logging for debugging

### 2. Fixed Transfer Logic (`app/transfer/page.tsx`)
- ✅ Fetches latest source account balance from database before deducting
- ✅ Fetches latest destination account balance from database before adding
- ✅ Added proper error handling and rollback logic
- ✅ Added console logging for debugging
- ✅ Added `updated_at` timestamp updates

### 3. Fixed Card Funding Logic (`app/cards/page.tsx`)
- ✅ Fetches latest source account balance from database before deducting
- ✅ Fetches latest card balance from database before adding
- ✅ Added proper error handling
- ✅ Added console logging for debugging
- ✅ Improved refresh logic with verification checks
- ✅ Added `updated_at` timestamp updates

### 4. Improved Dashboard Refresh (`app/dashboard/page.tsx`)
- ✅ Auto-refreshes accounts when page becomes visible
- ✅ Auto-refreshes on window focus
- ✅ Added safe balance parsing helper function
- ✅ Refreshes on component mount

## SQL Scripts Required

### Run This First: `database_fix_account_balances_simple.sql`
This ensures the database is properly configured:
- Drops problematic triggers
- Sets balance defaults
- Fixes NULL balances
- Recreates triggers correctly

## Testing Steps

1. **Run the SQL script** in Supabase SQL Editor
2. **Open browser console** (F12) to see debug logs
3. **Test card funding**:
   - Fund a card with $70,000
   - Check console for `[Card Funding]` logs
   - Verify account balance reduces correctly
4. **Test transfers**:
   - Transfer $100 from checking to savings
   - Check console for `[Transfer]` logs
   - Verify both balances update correctly
5. **Check dashboard**:
   - Navigate away and back to dashboard
   - Balances should auto-refresh

## Debug Information

### Console Logs to Watch For:
- `[Card Funding] Updating source account...` - Shows balance calculation
- `[Card Funding] Source account updated successfully` - Confirms update
- `[Transfer] Updating source account...` - Shows transfer balance calculation
- `[useAccounts] Account...` - Shows what balances are being fetched
- Any errors in red - These indicate what went wrong

## Expected Behavior After Fix

### Card Funding:
1. User funds card with $70,000 from checking account
2. Checking account balance should reduce by $70,000
3. Card balance should increase by $70,000
4. Dashboard should immediately reflect new balances

### Internal Transfers:
1. User transfers $100 from checking to savings
2. Checking balance should reduce by $100
3. Savings balance should increase by $100
4. Dashboard should immediately reflect new balances

## If Balances Still Don't Update

1. **Check browser console** for error messages
2. **Verify SQL script was run** successfully
3. **Check database directly** in Supabase:
   ```sql
   SELECT id, account_type, balance, updated_at 
   FROM accounts 
   ORDER BY updated_at DESC;
   ```
4. **Check RLS policies** - Make sure authenticated users can UPDATE accounts
5. **Share console logs** - The debug logs will show exactly where the issue is

## Notes

- Balance updates now use database-first approach (fetch latest, then update)
- All balance values are parsed safely from DECIMAL strings
- Multiple refresh mechanisms ensure dashboard stays updated
- Console logging helps debug any remaining issues


