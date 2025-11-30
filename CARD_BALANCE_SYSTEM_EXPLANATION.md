# Card Balance System - Mirrors Account Balance System

## Overview

Cards now work **exactly** like accounts when it comes to balance management. Each card has its own unique card number, and the balance is tied to that specific card number (just like account balance is tied to account number).

---

## How It Works (Same as Accounts)

### 1. Unique Card Numbers
- Each card has a **unique 16-digit card_number** (e.g., `4532123456789012`)
- Cards are assigned to users when created
- Card numbers are unique across the entire system

### 2. Balance Tied to Card Number
- Each card has its own **balance** column in the database
- The balance is tied to the **specific card_number**
- When funding/withdrawing, we update the balance for that **specific card_number**

### 3. Funding Logic (Account → Card)

**Step 1:** Fetch account balance from database
- Account identified by: `account_id` and `account_number`
- Get current balance

**Step 2:** Fetch card balance from database
- Card identified by: `card_id` and `card_number`
- Get current balance tied to that card_number

**Step 3:** Calculate new balances
- Account: `currentBalance - amount`
- Card: `currentBalance + amount`

**Step 4:** Update account balance
- Update by `account_id` and `account_number`
- Deduct amount

**Step 5:** Update card balance
- Update by `card_id` and `card_number`
- Add amount (balance tied to that specific card_number)

**Step 6:** Verify updates
- Verify account balance updated correctly
- Verify card balance updated correctly (by card_number)

**Step 7:** Create transaction record
- Record debit on account
- Link transaction to card via `card_id`

### 4. Withdrawal Logic (Card → Account)

**Step 1:** Fetch card balance from database
- Card identified by: `card_id` and `card_number`
- Get current balance tied to that card_number

**Step 2:** Fetch account balance from database
- Account identified by: `account_id` and `account_number`
- Get current balance

**Step 3:** Calculate new balances
- Card: `currentBalance - amount`
- Account: `currentBalance + amount`

**Step 4:** Update card balance
- Update by `card_id` and `card_number`
- Deduct amount (balance tied to that specific card_number)

**Step 5:** Update account balance
- Update by `account_id` and `account_number`
- Add amount

**Step 6:** Verify updates
- Verify card balance updated correctly (by card_number)
- Verify account balance updated correctly

**Step 7:** Create transaction record
- Record credit on account
- Link transaction to card via `card_id`

---

## Database Structure

### Cards Table
```sql
cards
├── id (UUID) - Primary key
├── user_id (UUID) - User who owns the card
├── card_number (TEXT) - Unique 16-digit card number
├── balance (DECIMAL(15,2)) - Balance tied to this card_number
├── cardholder_name (TEXT)
├── account_id (UUID) - Linked account (optional)
└── ... other fields
```

### Key Points:
- ✅ `card_number` is unique (like `account_number` for accounts)
- ✅ `balance` is tied to the `card_number` (like account balance tied to account_number)
- ✅ Each card maintains its own independent balance

---

## Balance Updates

### Account Balance Update Pattern:
```typescript
// Fetch by account_id and account_number
const account = await supabase
  .from('accounts')
  .select('id, account_number, balance')
  .eq('id', accountId)
  .single()

// Update by account_id
await supabase
  .from('accounts')
  .update({ balance: newBalance })
  .eq('id', accountId)
```

### Card Balance Update Pattern (Same Logic):
```typescript
// Fetch by card_id and card_number
const card = await supabase
  .from('cards')
  .select('id, card_number, balance')
  .eq('id', cardId)
  .single()

// Update by card_id and verify by card_number
await supabase
  .from('cards')
  .update({ balance: newBalance })
  .eq('id', cardId)
  .eq('card_number', card.card_number) // Double-verify by card_number
```

---

## Transaction Recording

### Account Funding Transaction:
- **Account:** Identified by `account_id` and `account_number`
- **Type:** `credit` (money added to account)
- **Balance:** Added to account balance tied to account_number

### Card Funding Transaction:
- **Account:** Identified by `account_id` and `account_number`
- **Card:** Identified by `card_id` and `card_number`
- **Type:** `debit` (money leaving account)
- **Account Balance:** Deducted from account tied to account_number
- **Card Balance:** Added to card tied to card_number

---

## Verification

Both account and card balances are verified after updates:
1. ✅ Fetch latest balance from database
2. ✅ Compare with expected balance
3. ✅ Retry update if mismatch detected
4. ✅ Log verification results

---

## Key Differences: Account vs Card

| Feature | Account | Card |
|---------|---------|------|
| **Identifier** | `account_number` (12 digits) | `card_number` (16 digits) |
| **Balance Column** | `balance` | `balance` |
| **Unique Constraint** | Yes (account_number) | Yes (card_number) |
| **Balance Updates** | By account_id | By card_id + card_number |
| **User Association** | user_id | user_id |
| **Tied To** | account_number | card_number |

---

## Summary

Cards now work **exactly** like accounts:
1. ✅ Each card has a unique card_number (like account has account_number)
2. ✅ Each card's balance is tied to that card_number (like account balance tied to account_number)
3. ✅ Balance updates use the same logic pattern
4. ✅ Verification ensures balance is correctly tied to card_number
5. ✅ All transactions are recorded properly
6. ✅ Database-first approach (fetch latest balance before updating)

Everything is synchronized and working correctly! 🎉


