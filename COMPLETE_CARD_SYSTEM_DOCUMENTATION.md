# Complete Card System Documentation

## Overview

This document describes the complete card funding and withdrawal system with proper transaction recording and balance synchronization.

---

## 🗄️ Database Setup

### Step 1: Run SQL Script

**File:** `database_complete_card_system.sql`

This script sets up:
- ✅ Card balance column (`DECIMAL(15, 2)`)
- ✅ Card ID in transactions table (for linking)
- ✅ Database functions for card operations
- ✅ Views for easy card transaction querying
- ✅ Triggers for automatic timestamp updates
- ✅ Proper indexes for performance

**Run this script FIRST before using the card system!**

---

## 💳 Card Funding (Account → Card)

### Workflow:

1. **User selects account type** (e.g., Savings, Checking)
   - System verifies account exists
   - System checks account balance
   - System validates account is not frozen

2. **User selects card to fund**
   - System verifies card exists
   - System checks card is not frozen
   - Dropdown shows: `•••• •••• •••• 2403 • JONES MANFRED • Balance: $X.XX`

3. **User enters amount**
   - System validates amount > 0
   - System validates account has sufficient balance

4. **System processes funding:**
   - ✅ **Fetches latest balances** from database (database-first approach)
   - ✅ **Validates sufficient balance** on source account
   - ✅ **Deducts amount** from source account balance
   - ✅ **Adds amount** to card balance
   - ✅ **Records transaction** in account history (DEBIT)
   - ✅ **Links transaction to card** (card_id field)
   - ✅ **Creates notification** for user
   - ✅ **Refreshes all data** to update UI

### Transaction Recording:

- **Type:** `debit` (money leaving account)
- **Category:** `Card Funding`
- **Account ID:** Source account ID
- **Card ID:** Card ID (for linking to card)
- **Description:** Includes card number, amount, and reference
- **Status:** `completed`

### Example Transaction:
```
Type: debit
Category: Card Funding
Amount: $100.00
Description: Card Funding: Transferred $100.00 to card ending •••• 2403 (JONES MANFRED) - Reference: CARD-FUND-1234567890-1234
```

---

## 💸 Card Withdrawal (Card → Account)

### Workflow:

1. **User selects card**
   - System verifies card exists
   - System checks card balance
   - System validates card is not frozen
   - Dropdown shows: `•••• •••• •••• 2403 - Balance: $X.XX`

2. **User selects destination account**
   - System verifies account exists
   - System validates account is not frozen

3. **User enters amount**
   - System validates amount > 0
   - System validates card has sufficient balance

4. **System processes withdrawal:**
   - ✅ **Fetches latest balances** from database (database-first approach)
   - ✅ **Validates sufficient balance** on card
   - ✅ **Deducts amount** from card balance
   - ✅ **Adds amount** to destination account balance
   - ✅ **Records transaction** in account history (CREDIT)
   - ✅ **Links transaction to card** (card_id field)
   - ✅ **Creates notification** for user
   - ✅ **Refreshes all data** to update UI

### Transaction Recording:

- **Type:** `credit` (money coming into account)
- **Category:** `Card Withdrawal`
- **Account ID:** Destination account ID
- **Card ID:** Card ID (for linking to card)
- **Description:** Includes card number, account type, amount, and reference
- **Status:** `completed`

### Example Transaction:
```
Type: credit
Category: Card Withdrawal
Amount: $100.00
Description: Card Withdrawal: Transferred $100.00 from card ending •••• 2403 (JONES MANFRED) to Savings account - Reference: CARD-WD-1234567890-5678
```

---

## 📊 Balance Synchronization

### Key Principles:

1. **Database-First Approach**
   - Always fetch latest balances from database before calculating
   - Never rely on local state for balance calculations
   - Prevents stale data issues

2. **Atomic Operations**
   - Both account and card balances updated in same transaction context
   - Rollback if any step fails
   - Ensures data consistency

3. **Verification Steps**
   - Verify balance updates after each operation
   - Retry if mismatch detected
   - Multiple refresh cycles to ensure UI sync

4. **Independent Balances**
   - Cards have their own balance (not linked to account)
   - Account balance and card balance are separate
   - No fallback to account balance for cards

### Balance Update Flow:

```
Funding:
Account Balance: $1000.00 → $900.00  (Deduct $100)
Card Balance:    $0.00    → $100.00  (Add $100)

Withdrawal:
Card Balance:    $100.00  → $50.00   (Deduct $50)
Account Balance: $900.00  → $950.00  (Add $50)
```

---

## 📝 Transaction History

### Account Transaction History

**Funding Transactions:**
- Shows as **DEBIT** (outgoing)
- Category: `Card Funding`
- Linked to card via `card_id`
- Includes card details in description

**Withdrawal Transactions:**
- Shows as **CREDIT** (incoming)
- Category: `Card Withdrawal`
- Linked to card via `card_id`
- Includes card and account details in description

### Card Transaction History

All transactions can be queried using:
- `card_transactions_view` (database view)
- Filter by `card_id` in transactions table
- Filter by description containing "Card"

### Transaction Fields:

```sql
- id: UUID (primary key)
- user_id: UUID (user who owns transaction)
- account_id: UUID (account involved)
- card_id: UUID (card involved - NEW FIELD)
- type: 'debit' | 'credit'
- category: 'Card Funding' | 'Card Withdrawal'
- amount: DECIMAL(15, 2)
- description: TEXT (includes details)
- status: 'completed' | 'pending' | 'failed'
- pending: BOOLEAN
- date: TIMESTAMP
- created_at: TIMESTAMP
```

---

## 🛡️ Error Handling

### Validation Checks:

1. **Account Status**
   - ✅ Account exists
   - ✅ Account belongs to user
   - ✅ Account is not frozen
   - ✅ Sufficient balance (for funding)

2. **Card Status**
   - ✅ Card exists
   - ✅ Card belongs to user
   - ✅ Card is not frozen
   - ✅ Sufficient balance (for withdrawal)

3. **Amount Validation**
   - ✅ Amount > 0
   - ✅ Amount is a valid number
   - ✅ Not exceeding available balance

### Rollback Mechanism:

If any step fails:
1. **Account update fails** → Rollback not needed (transaction not started)
2. **Card update fails** → Rollback account balance
3. **Transaction record fails** → Rollback both account and card balances

### Error Messages:

- **Insufficient Balance:** "You have $X.XX available. You need $Y.YY..."
- **Account Frozen:** Shows frozen modal with reason
- **Card Frozen:** Shows frozen modal with message
- **Transaction Failed:** Shows error with details

---

## 🔄 Refresh Logic

### After Successful Operation:

1. **Immediate Refresh** (500ms delay)
   - Refresh accounts
   - Refresh cards
   - Refresh transactions

2. **Delayed Refresh** (1 second)
   - Refresh cards again
   - Refresh accounts again

3. **Final Refresh** (2 seconds)
   - Final sync to catch any delayed database updates

This ensures UI always shows latest data!

---

## 📍 Key Files

### Database:
- `database_complete_card_system.sql` - Complete database setup

### Code:
- `app/cards/page.tsx` - Card page with funding/withdrawal functions
- `lib/hooks/useCards.ts` - Card data hook
- `lib/hooks/useAccounts.ts` - Account data hook
- `lib/hooks/useTransactions.ts` - Transaction data hook

---

## ✅ Testing Checklist

### Card Funding:
- [ ] Select account with sufficient balance
- [ ] Select card from dropdown (shows balance)
- [ ] Enter valid amount
- [ ] Verify account balance decreases
- [ ] Verify card balance increases
- [ ] Verify transaction appears in account history
- [ ] Verify transaction linked to card (card_id)
- [ ] Verify notification created
- [ ] Verify UI updates correctly

### Card Withdrawal:
- [ ] Select card with sufficient balance
- [ ] Select destination account
- [ ] Enter valid amount
- [ ] Verify card balance decreases
- [ ] Verify account balance increases
- [ ] Verify transaction appears in account history
- [ ] Verify transaction linked to card (card_id)
- [ ] Verify notification created
- [ ] Verify UI updates correctly

### Error Cases:
- [ ] Try funding with insufficient balance
- [ ] Try withdrawal with insufficient card balance
- [ ] Try funding/withdrawal with frozen account
- [ ] Try funding/withdrawal with frozen card
- [ ] Verify error messages are clear

---

## 🎯 Success Criteria

✅ **All balances stay synchronized**
✅ **All transactions recorded properly**
✅ **Card history shows all funding/withdrawals**
✅ **Account history shows all card transactions**
✅ **Error handling works correctly**
✅ **UI updates in real-time**
✅ **No data inconsistencies**

---

## 🚀 Next Steps

1. **Run SQL Script** - Execute `database_complete_card_system.sql`
2. **Test Funding** - Fund a card and verify everything works
3. **Test Withdrawal** - Withdraw from a card and verify everything works
4. **Check History** - Verify transactions appear in both card and account history
5. **Test Error Cases** - Try various error scenarios

Everything is ready! 🎉


