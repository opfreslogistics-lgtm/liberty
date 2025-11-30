# Implementation Guide - New Balance System

## 🚀 Quick Start

### Step 1: Run the SQL Script

Run `database_new_balance_system.sql` in your Supabase SQL Editor. This creates:
- ✅ All necessary database functions
- ✅ Automatic balance update triggers
- ✅ Balance audit log table
- ✅ Syncs all existing balances from transactions

### Step 2: Verify Installation

After running the SQL script, verify it worked:

```sql
-- Check triggers were created
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'transactions';

-- Should show: trigger_transaction_balance_update
```

```sql
-- Check functions were created
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%balance%';

-- Should show multiple balance-related functions
```

```sql
-- Verify balances were synced
SELECT 
  account_type,
  balance,
  updated_at
FROM accounts
ORDER BY updated_at DESC
LIMIT 5;
```

### Step 3: Test the System

1. **Create a test transaction** (via admin funding or transfer)
2. **Check the balance** - should update automatically
3. **Check audit log**:
   ```sql
   SELECT * FROM balance_audit_log 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

## 🔄 Updating Application Code

### Priority 1: Card Funding (`app/cards/page.tsx`)

**Replace the balance update logic with transaction-based approach:**

```typescript
// OLD CODE (remove this):
const newAccountBalance = currentSourceBalance - amount
await supabase
  .from('accounts')
  .update({ balance: newAccountBalance.toString() })
  .eq('id', fundingAccountId)

// NEW CODE (use this):
import { createTransactionAndUpdateBalance } from '@/lib/utils/balanceSystem'

await createTransactionAndUpdateBalance(
  user.id,
  fundingAccountId,
  'debit',
  amount,
  'Card Funding',
  `Card Funding from ${sourceAccount.account_type} account to ${maskCardNumber(card.card_number)}`,
  { status: 'completed', pending: false }
)
```

### Priority 2: Account Funding (`app/admin/users/page.tsx`)

**Replace admin funding logic:**

```typescript
// OLD CODE:
const newBalance = selectedAccount.balance + amount
await supabase
  .from('accounts')
  .update({ balance: newBalance.toString() })
  .eq('id', selectedAccountId)

// NEW CODE:
import { createTransactionAndUpdateBalance } from '@/lib/utils/balanceSystem'

await createTransactionAndUpdateBalance(
  selectedUserData?.id,
  selectedAccountId,
  'credit',
  amount,
  'Direct Deposit',
  `${transactionType}: ${referenceNumber}`,
  { status: 'completed', pending: false }
)
```

### Priority 3: Transfers (`app/transfer/page.tsx`)

**Update transfer logic to use transactions for both accounts:**

For internal transfers:
```typescript
// Debit from source
await createTransactionAndUpdateBalance(
  user.id,
  fromAccount,
  'debit',
  transferAmount,
  'Internal Transfer',
  `Internal Transfer to ${toAccountData.account_type} - ${referenceNumber}`,
  { status: 'completed', pending: false }
)

// Credit to destination
await createTransactionAndUpdateBalance(
  user.id,
  toAccount,
  'credit',
  transferAmount,
  'Internal Transfer',
  `Internal Transfer from ${fromAccountData.account_type} - ${referenceNumber}`,
  { status: 'completed', pending: false }
)
```

## 📊 Dashboard Verification

The dashboard calculations are already correct:
- ✅ Monthly Income: Sum of credit transactions
- ✅ Monthly Expenses: Sum of debit transactions  
- ✅ Monthly Savings: Income - Expenses
- ✅ Savings Rate: (Savings / Income) * 100

These will automatically work correctly once balances are maintained by triggers.

## 🎯 Key Changes Summary

| Component | Old Behavior | New Behavior |
|-----------|--------------|--------------|
| Balance Updates | Manual calculation in code | Automatic via database triggers |
| Card Funding | Direct balance update | Transaction creates → trigger updates balance |
| Account Funding | Direct balance update | Transaction creates → trigger updates balance |
| Transfers | Direct balance updates | Two transactions → triggers update both balances |
| Balance Source | Stored in accounts table | Calculated from transactions (verified) |

## ✅ Testing Checklist

- [ ] Run SQL script successfully
- [ ] Verify triggers created
- [ ] Verify functions created
- [ ] Test card funding - balance updates automatically
- [ ] Test account funding - balance updates automatically
- [ ] Test internal transfer - both balances update
- [ ] Check audit log - entries being created
- [ ] Verify dashboard calculations
- [ ] Test with multiple concurrent transactions
- [ ] Verify balance matches transaction history

## 🔍 Troubleshooting

### Balances Not Updating

1. **Check triggers exist:**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE event_object_table = 'transactions';
   ```

2. **Check transaction status:**
   - Transactions must have `status = 'completed'`
   - Transactions must have `pending = false`
   - Only then will triggers fire

3. **Manual sync:**
   ```sql
   SELECT * FROM sync_all_account_balances();
   ```

### Balance Doesn't Match Transactions

1. **Recalculate balance:**
   ```sql
   SELECT recalculate_account_balance('your-account-id');
   ```

2. **Sync all balances:**
   ```sql
   SELECT * FROM sync_all_account_balances();
   ```

3. **Check for failed transactions:**
   ```sql
   SELECT * FROM transactions 
   WHERE account_id = 'your-account-id' 
   AND status != 'completed';
   ```

## 📝 Notes

- All balance updates are now atomic and race-condition safe
- Balance audit log provides complete history
- System is self-verifying - can detect discrepancies
- Dashboard will automatically show correct balances
- No need to manually refresh balances - triggers handle it


