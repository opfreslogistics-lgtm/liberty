# Complete Transaction Format Implementation Guide

## Overview

This document outlines the complete implementation of the new transaction format system for all transaction types.

## Transaction Format Standard

All transactions follow this format:
- **Title:** `TransactionType – REF123456`
- **Subtitle:** `Debited/Credited • MMM DD, YYYY`
- **Amount:** `$XXX.XX` (aligned right)

## Transaction Type Abbreviations

1. **Card Top-Up:** `Card TopUp – REF953425`
2. **Card Withdrawal:** `Card Withdrawal – REF953425`
3. **Internal Transfer:** `INT C/S – REF829102` (Checking → Savings)
   - Format: `INT {FROM_INITIAL}/{TO_INITIAL}`
   - Examples: `INT C/S`, `INT B/C`, `INT S/B`, etc.
4. **External Transfer:** `EXT – REF920551`
5. **Domestic Wire:** `DWIRE – REF551092`
6. **International Wire:** `INTL WIRE – REF551092`

## Implementation Files

### SQL Scripts
- `database_transaction_recording_system.sql` - Complete database setup

### Code Files to Update

1. **Transaction Creation:**
   - `app/cards/page.tsx` - Card Top-Up & Withdrawal
   - `app/transfer/page.tsx` - Internal, External, P2P transfers
   - `app/transfer/wire/page.tsx` - Wire transfers

2. **Transaction Display:**
   - `app/dashboard/page.tsx` - Recent transactions
   - `app/history/page.tsx` - Full transaction history
   - `app/cards/page.tsx` - Card transaction history

3. **Utilities:**
   - `lib/utils/transactionFormatting.ts` - Formatting helpers

## Transaction Creation Pattern

All transactions should include:
```typescript
{
  transaction_type: 'Card TopUp', // Abbreviation
  reference_number: 'REF953425',   // Generated reference
  description: 'Card TopUp – REF953425', // Formatted description
  type: 'debit' | 'credit',
  category: 'Card Funding',
  // ... other fields
}
```

## Display Format

### Dashboard & History Display:
```typescript
// Title line
"Card TopUp – REF953425"

// Subtitle line  
"Credited • Nov 27, 2025"

// Amount (right aligned)
"$300.00"
```

## Account Type Abbreviations

For Internal Transfers:
- **C** = Checking
- **S** = Savings  
- **B** = Business
- **F** = Fixed Deposit

Examples:
- Checking → Savings: `INT C/S`
- Business → Checking: `INT B/C`
- Savings → Business: `INT S/B`


