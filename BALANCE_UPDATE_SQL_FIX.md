# Balance Update SQL Fix - Ambiguous Column Reference

## 🐛 Error Fixed

**Error**: `column reference "account_id" is ambiguous`

**Cause**: In the `sync_all_account_balances_from_transactions()` function, the column `account_id` in the WHERE clause was ambiguous because:
- The function returns a TABLE with a column named `account_id`
- The `transactions` table also has a column named `account_id`
- PostgreSQL couldn't determine which one was being referenced

## ✅ Solution Applied

Added table alias `t` to the `transactions` table and qualified all column references:

**Before**:
```sql
SELECT ... 
FROM transactions
WHERE account_id = account_record.id;
```

**After**:
```sql
SELECT ...
FROM transactions t
WHERE t.account_id = account_record.id;
```

All column references in the CASE statement are now also qualified with `t.`:
- `t.type`
- `t.status`
- `t.pending`
- `t.amount`
- `t.account_id`

## 📝 Fixed Functions

1. ✅ `sync_all_account_balances_from_transactions()` - Fixed ambiguous reference
2. ✅ `force_update_account_balance()` - Added table aliases for consistency

## 🚀 Ready to Run

The SQL script `database_fix_balance_update_final.sql` is now fixed and ready to run without errors!

---

**Fix applied!** ✅

