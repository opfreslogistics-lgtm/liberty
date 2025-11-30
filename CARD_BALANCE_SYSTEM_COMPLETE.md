# Complete Card Balance System - Mirrors Account System

## Overview

The card balance system now works **exactly** like the account balance system. Each card has a unique card number, and the balance is tied to that specific card number (just like account balance is tied to account number).

---

## Key Principles (Same as Accounts)

### 1. Unique Identification
- **Accounts:** Each account has a unique `account_number` (12 digits)
- **Cards:** Each card has a unique `card_number` (16 digits)

### 2. Balance Ownership
- **Accounts:** Balance is tied to the `account_number`
- **Cards:** Balance is tied to the `card_number`

### 3. Update Pattern
- **Accounts:** Update by `account_id`, verify by `account_number`
- **Cards:** Update by `card_id`, verify by `card_number`

---

## How Card Funding Works (Same Pattern as Account Funding)

### Step-by-Step Process:

1. **Fetch Account Balance**
   - Get account by `account_id` and `account_number`
   - Get current balance tied to that account_number

2. **Fetch Card Balance**
   - Get card by `card_id` and `card_number`
   - Get current balance tied to that card_number
   - Verify card_number exists and is valid

3. **Validate**
   - Check account has sufficient balance
   - Check card is not frozen
   - Verify card_number belongs to user

4. **Calculate New Balances**
   - Account: `currentBalance - amount`
   - Card: `currentBalance + amount`

5. **Update Account Balance**
   - Update by `account_id`
   - Balance deducted from account tied to account_number

6. **Update Card Balance**
   - Update by `card_id` AND `card_number` (double verification)
   - Balance added to card tied to card_number

7. **Verify Updates**
   - Fetch account balance again (by account_number)
   - Fetch card balance again (by card_number)
   - Compare with expected values
   - Retry if mismatch

8. **Record Transaction**
   - Create transaction record
   - Link to account (by account_id)
   - Link to card (by card_id and card_number)

---

## Database Structure

### Cards Table (Same Pattern as Accounts)
```sql
cards
├── id (UUID)                    -- Primary key (like account.id)
├── user_id (UUID)               -- User who owns card (like account.user_id)
├── card_number (TEXT UNIQUE)    -- Unique identifier (like account.account_number)
├── balance (DECIMAL(15,2))      -- Balance tied to card_number (like account.balance)
├── cardholder_name (TEXT)
├── account_id (UUID)            -- Linked account (optional)
└── ... other fields
```

### Key Relationships:
- ✅ `card_number` is UNIQUE (like `account_number`)
- ✅ `balance` is tied to `card_number` (like account balance tied to account_number)
- ✅ Each card has independent balance (like each account has independent balance)

---

## Balance Update Logic

### Account Balance Update:
```typescript
// 1. Fetch by account_id
const account = await supabase
  .from('accounts')
  .select('id, account_number, balance')
  .eq('id', accountId)
  .single()

// 2. Calculate new balance
const newBalance = account.balance + amount

// 3. Update by account_id
await supabase
  .from('accounts')
  .update({ balance: newBalance })
  .eq('id', accountId)
```

### Card Balance Update (Same Pattern):
```typescript
// 1. Fetch by card_id and card_number
const card = await supabase
  .from('cards')
  .select('id, card_number, balance')
  .eq('id', cardId)
  .single()

// 2. Verify card_number exists
if (!card.card_number) {
  throw new Error('Card number not found')
}

// 3. Calculate new balance
const newBalance = card.balance + amount

// 4. Update by card_id AND card_number (double verification)
await supabase
  .from('cards')
  .update({ balance: newBalance })
  .eq('id', cardId)
  .eq('card_number', card.card_number) // Ensure correct card
```

---

## Verification Process

### After Update:
1. Fetch card again by `card_id` AND `card_number`
2. Compare balance with expected value
3. Retry update if mismatch (using both ID and card_number)

This ensures:
- ✅ Balance is correctly tied to card_number
- ✅ We're updating the right card
- ✅ No balance mixing between cards

---

## Transaction Flow

### Card Funding (Account → Card):
```
1. Fetch Account (by account_id + account_number)
   → Get balance tied to account_number

2. Fetch Card (by card_id + card_number)
   → Get balance tied to card_number

3. Deduct from Account Balance
   → Update account by account_id
   → Balance removed from account_number

4. Add to Card Balance
   → Update card by card_id + card_number
   → Balance added to card_number

5. Record Transaction
   → Debit on account
   → Link to card (card_id + card_number)
```

### Card Withdrawal (Card → Account):
```
1. Fetch Card (by card_id + card_number)
   → Get balance tied to card_number

2. Fetch Account (by account_id + account_number)
   → Get balance tied to account_number

3. Deduct from Card Balance
   → Update card by card_id + card_number
   → Balance removed from card_number

4. Add to Account Balance
   → Update account by account_id
   → Balance added to account_number

5. Record Transaction
   → Credit on account
   → Link to card (card_id + card_number)
```

---

## Key Differences: Account vs Card

| Feature | Account | Card |
|---------|---------|------|
| **Unique ID** | `account_number` (12 digits) | `card_number` (16 digits) |
| **Example** | `100123456789` | `4532123456789012` |
| **Balance Column** | `balance` | `balance` |
| **Balance Tied To** | `account_number` | `card_number` |
| **Update By** | `account_id` | `card_id` + `card_number` |
| **User Owns** | Multiple accounts | Multiple cards |
| **Each Has** | Independent balance | Independent balance |

---

## SQL Script

Run `database_card_balance_system.sql` to:
- ✅ Ensure balance column exists
- ✅ Create indexes on card_number
- ✅ Enforce uniqueness on card_number
- ✅ Create balance update function
- ✅ Verify card structure

---

## Summary

Cards now work **exactly** like accounts:

1. ✅ **Unique Card Numbers** - Each card has unique 16-digit card_number
2. ✅ **Balance Ownership** - Balance is tied to that specific card_number
3. ✅ **Same Update Pattern** - Fetch, calculate, update, verify (same as accounts)
4. ✅ **Double Verification** - Update by both ID and card_number
5. ✅ **Independent Balances** - Each card maintains its own balance
6. ✅ **Proper Logging** - Logs show card_number prominently

**Everything is now synchronized!** 🎉


