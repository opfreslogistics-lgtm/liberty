# Transaction Format Update

## Changes Made

Updated card funding and withdrawal transaction descriptions to match the dashboard display format.

## Transaction Formats

### Card Funding (Account → Card)
- **Description:** `Top up card - REF123456`
- **Category:** `Card Funding`
- **Display on Dashboard:**
  ```
  Top up card - REF123456
  Card Funding • Nov 27, 2025
  ```

### Card Withdrawal (Card → Account)
- **Description:** `Withdrawal from {Account Type} Account - REF123456`
  - Example: `Withdrawal from Business Account - REF123456`
  - Example: `Withdrawal from Savings Account - REF123456`
- **Category:** `Card Funding` (as per user example)
- **Display on Dashboard:**
  ```
  Withdrawal from Business Account - REF123456
  Card Funding • Nov 27, 2025
  ```

## Reference Number Format

- Uses format: `REF{6-digit number}`
- Example: `REF718125`, `REF718590`

## Dashboard Display

The dashboard shows:
- **Main text:** Transaction description (name)
- **Subtitle:** Category • Date

Example:
```
Top up card - REF718590
Card Funding • Nov 27, 2025

Withdrawal from Business Account - REF718125
Card Funding • Nov 27, 2025
```

## Code Changes

### Funding Transaction (app/cards/page.tsx)
```javascript
description: `Top up card - ${transactionRef}`,
category: 'Card Funding',
```

### Withdrawal Transaction (app/cards/page.tsx)
```javascript
description: `Withdrawal from ${accountTypeFormatted} Account - ${transactionRef}`,
category: 'Card Funding',
```

All transactions will now display in the clean, concise format as requested!


