# New Transaction-Based Balance System

## 🎯 Overview

This is a completely redesigned balance management system where **transactions are the single source of truth**. Account balances are automatically calculated and maintained by database triggers, ensuring data integrity and eliminating balance sync issues.

## 🔑 Key Principles

1. **Transactions = Source of Truth**: All balance changes must go through transactions
2. **Automatic Balance Updates**: Database triggers automatically update balances when transactions are created
3. **Audit Trail**: Every balance change is logged for complete transparency
4. **Atomic Operations**: Balance updates are atomic and prevent race conditions
5. **Self-Verifying**: System can verify balances match transaction history

## 📊 How It Works

### 1. Transaction Creation → Automatic Balance Update

When a transaction is created:
```
1. Transaction inserted into `transactions` table
2. Database trigger fires automatically
3. Trigger calculates balance change based on transaction type
4. Account balance updated atomically
5. Change logged in `balance_audit_log`
```

### 2. Transaction Types

- **credit**: Adds to balance (+amount)
- **debit**: Subtracts from balance (-amount)  
- **transfer**: Can be positive (incoming) or negative (outgoing)

### 3. Balance Calculation Formula

```
Final Balance = SUM(
  credit transactions - debit transactions
) WHERE status = 'completed' AND pending = false
```

## 🗄️ Database Structure

### New Tables

1. **balance_audit_log**: Tracks every balance change with full audit trail
   - Previous balance
   - New balance
   - Amount change
   - Change type
   - Timestamp

### New Functions

1. **recalculate_account_balance(account_id)**: Calculates balance from all transactions
2. **update_account_balance(account_id, amount, operation)**: Atomic balance update with locking
3. **sync_all_account_balances()**: Syncs all account balances from transactions

### New Triggers

1. **trigger_transaction_balance_update**: Auto-updates balance on transaction insert
2. **trigger_transaction_status_update**: Updates balance when transaction status changes
3. **trigger_balance_audit_log**: Logs all balance changes

## 💻 Usage in Application Code

### Recommended: Use Transaction-Based Updates

```typescript
import { createTransactionAndUpdateBalance } from '@/lib/utils/balanceSystem'

// Fund an account (credit)
await createTransactionAndUpdateBalance(
  userId,
  accountId,
  'credit',
  500000,
  'Direct Deposit',
  'Account funding',
  { status: 'completed', pending: false }
)

// Deduct from account (debit)
await createTransactionAndUpdateBalance(
  userId,
  accountId,
  'debit',
  70000,
  'Card Funding',
  'Card funding debit',
  { status: 'completed', pending: false }
)
```

### Direct Balance Update (Use Sparingly)

```typescript
import { updateAccountBalanceDirectly } from '@/lib/utils/balanceSystem'

await updateAccountBalanceDirectly(
  accountId,
  1000,
  'add' // or 'subtract'
)
```

### Verify Balance

```typescript
import { getAccountBalance } from '@/lib/utils/balanceSystem'

const result = await getAccountBalance(accountId)
if (!result.matches) {
  // Balance doesn't match transaction history - sync needed
  await recalculateAccountBalance(accountId)
}
```

## 🔧 Migration Steps

### Step 1: Run SQL Script
Run `database_new_balance_system.sql` in Supabase SQL Editor. This will:
- Create all necessary functions and triggers
- Create balance audit log table
- Sync all existing account balances from transactions
- Set up proper permissions

### Step 2: Update Application Code
Replace direct balance updates with transaction-based updates:

**Before:**
```typescript
// Old way - directly updating balance
await supabase
  .from('accounts')
  .update({ balance: newBalance.toString() })
  .eq('id', accountId)
```

**After:**
```typescript
// New way - create transaction, trigger handles balance
await createTransactionAndUpdateBalance(
  userId, accountId, 'debit', amount, category, description
)
```

### Step 3: Update Key Functions
- Card funding (`app/cards/page.tsx`)
- Account funding (`app/admin/users/page.tsx`)
- Transfers (`app/transfer/page.tsx`)
- Wire transfers (`app/transfer/wire/page.tsx`)

## ✅ Benefits

1. **No Balance Sync Issues**: Balances always match transaction history
2. **Automatic Updates**: No manual balance calculations needed
3. **Race Condition Safe**: Row-level locking prevents concurrent update issues
4. **Complete Audit Trail**: Every balance change is logged
5. **Self-Verifying**: System can detect and fix balance discrepancies
6. **Simpler Code**: Just create transactions, balance updates automatically

## 🔍 Verification & Debugging

### Check Balance Accuracy
```sql
-- Verify balance matches transaction history
SELECT 
  a.id,
  a.account_type,
  a.balance as stored_balance,
  recalculate_account_balance(a.id) as calculated_balance,
  a.balance - recalculate_account_balance(a.id) as difference
FROM accounts a
WHERE ABS(a.balance - recalculate_account_balance(a.id)) > 0.01;
```

### View Audit Log
```sql
SELECT * FROM balance_audit_log 
WHERE account_id = 'your-account-id'
ORDER BY created_at DESC
LIMIT 20;
```

### Sync All Balances
```sql
SELECT * FROM sync_all_account_balances();
```

## 🚨 Important Notes

1. **Always use transactions**: Never directly update account balance except through transactions
2. **Status matters**: Only 'completed' and non-pending transactions affect balance
3. **Automatic sync**: The system will sync balances on initial setup
4. **Audit log**: All balance changes are automatically logged

## 📈 Dashboard Calculations

The dashboard now:
- Reads balances directly from accounts table (maintained by triggers)
- Calculates income/expenses from transactions
- Shows accurate balances that always match transaction history
- Updates automatically when transactions are created

## 🔄 Rollback Plan

If you need to revert:
1. Drop triggers: `DROP TRIGGER trigger_transaction_balance_update ON transactions;`
2. Drop functions: `DROP FUNCTION update_account_balance(...);`
3. Balance updates will stop being automatic, manual updates resume


