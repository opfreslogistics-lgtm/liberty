# Email Notifications Setup & Configuration Guide 📧

## Current Status

### ✅ What's Already Implemented

The email notification system is **fully implemented** in the code! Email notifications are already being sent for:

1. **✅ User Transfers** - When users transfer money
2. **✅ Admin Funding** - When admin funds user accounts
3. **✅ Card Transactions** - When admin processes card transactions (debit, credit, ATM, etc.)
4. **✅ Loan Applications** - When users apply for loans
5. **✅ Loan Approvals** - When admin approves loans
6. **✅ Loan Payments** - When loan payments are made
7. **✅ Role Changes** - When admin changes user roles
8. **✅ Mobile Deposits** - When users submit mobile deposits
9. **✅ Contact Form** - When someone submits contact form
10. **✅ Support Tickets** - When support tickets are created

### ⚠️ Why Emails Aren't Sending

Emails are **already coded** but not working because:

**1. Database Functions Missing**
- Required RPC functions don't exist in database
- Functions needed: `get_admin_emails()` and `get_user_email_info()`
- Without these, the code can't get user/admin email addresses

**2. Environment Variables Not Configured**
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASSWORD` - Your Gmail app password
- Without these, Nodemailer can't send emails

**3. Table May Not Exist**
- `email_notifications` table may not exist
- Used for logging email activity

## How to Fix (3 Steps)

### STEP 1: Run Database Script

**In Supabase Dashboard:**
1. Go to SQL Editor
2. Click "New Query"
3. Copy and paste the contents of `database_add_email_functions.sql`
4. Click "Run"

This creates:
- `get_admin_emails()` function
- `get_user_email_info()` function
- `email_notifications` table
- Proper security policies

### STEP 2: Configure Email Environment Variables

**In Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add these variables:

```bash
# For Gmail (recommended)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM=Liberty Bank <noreply@libertybank.com>

# Alternative: Custom SMTP
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=Liberty Bank <noreply@domain.com>
```

3. Click "Save"
4. Redeploy your application

**For Gmail App Password:**
1. Go to myaccount.google.com
2. Security → 2-Step Verification (enable if not enabled)
3. App Passwords → Generate new app password
4. Select "Mail" and "Other" (name it "Liberty Bank")
5. Copy the 16-character password (no spaces!)
6. Use this as `EMAIL_PASSWORD`

### STEP 3: Test Email Notifications

After completing steps 1 & 2:

1. **Test Admin Funding:**
   - Go to Admin → Users
   - Select a user
   - Click "Fund Account"
   - Enter amount and submit
   - ✅ User should receive email

2. **Test Card Transaction:**
   - Go to Admin → Cards
   - Select a card
   - Perform an action (debit/credit)
   - ✅ User should receive email

3. **Test User Transfer:**
   - Login as regular user
   - Go to Transfer
   - Make a transfer
   - ✅ You should receive email

## Code Locations

### Email Notification Functions
**File**: `lib/utils/emailNotifications.ts`

Functions available:
- `sendTransferNotification()` - For transfers
- `sendBillPaymentNotification()` - For bill payments
- `sendLoanApplicationNotification()` - For loan applications
- `sendLoanApprovalNotification()` - For loan approvals
- `sendLoanPaymentNotification()` - For loan payments
- `sendRoleChangeNotification()` - For role changes
- `sendAccountFundedNotification()` - For account funding
- `sendMobileDepositNotification()` - For mobile deposits
- `sendCardTransactionNotification()` - For card transactions

### Where Emails Are Sent

**Admin Actions:**
- `app/admin/users/page.tsx` (line 708) - Calls `sendAccountFundedNotification()`
- `app/admin/cards/page.tsx` (line 329) - Calls `sendCardTransactionNotification()`

**User Actions:**
- `app/transfer/page.tsx` (line 507, 596) - Calls `sendTransferNotification()`

**API Routes:**
- `app/api/email/send/route.ts` - Main email sending endpoint

### Email Service
**File**: `lib/utils/emailService.ts`

Core functions:
- `sendEmailNotification()` - Sends email via API
- `notifyUser()` - Sends email to user
- `notifyAdmins()` - Sends email to all admins
- `notifyUserAndAdmins()` - Sends to both

### Email Templates
**File**: `lib/utils/emailTemplates.ts`

HTML email templates for:
- Transfers (internal, external, P2P, wire)
- Bill payments
- Loan applications, approvals, payments
- Card transactions
- Account funding
- Role changes
- Mobile deposits
- Contact forms
- Support tickets
- OTP codes

## Email Flow Architecture

```
User Action → emailNotifications.ts
     ↓
notifyUser(userId) → emailService.ts
     ↓
getUserEmailInfo(userId) → Database RPC
     ↓
sendEmailNotification() → /api/email/send
     ↓
Nodemailer → SMTP Server → User's Email
     ↓
Email Delivered ✅
```

## Troubleshooting

### Problem: Emails Still Not Sending

**Check 1: Database Functions**
Run this SQL to verify functions exist:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('get_admin_emails', 'get_user_email_info');
```

**Check 2: Environment Variables**
In your deployed app, check logs for:
```
📧 Email (Development Mode - Email not configured)
```

If you see this, environment variables aren't set.

**Check 3: Email Service**
Check console logs for:
```
✅ Email sent successfully
```

If you see errors like "Invalid credentials" or "Connection failed", check your email password.

### Problem: OTP Emails Work But Transaction Emails Don't

**Why**: OTP uses Resend API, but transactions use Nodemailer

**Solution**: 
- OTP: Uses `RESEND_API_KEY` environment variable
- Transactions: Use `EMAIL_USER` and `EMAIL_PASSWORD`
- Both need to be configured separately

**To make transactions use Resend too** (optional):
You can modify `/api/email/send/route.ts` to use Resend instead of Nodemailer if preferred.

## Testing Email Notifications

### Test 1: Admin Funding
```typescript
// In Admin → Users page
handleFundSubmit() 
  → Creates transaction
  → Calls sendAccountFundedNotification()
  → User receives email ✉️
```

### Test 2: Card Transaction
```typescript
// In Admin → Cards page
handleCardAction()
  → Creates card transaction
  → Calls sendCardTransactionNotification()
  → User receives email ✉️
```

### Test 3: User Transfer
```typescript
// In Transfer page
handleTransferSubmit()
  → Creates transfer
  → Calls sendTransferNotification()
  → User receives email ✉️
  → Admin receives notification ✉️
```

## Email Templates

All emails include:
- Professional HTML design
- Liberty Bank branding
- Transaction details
- Reference numbers
- Date/time stamps
- Contact information
- Security disclaimers

Example email content:
```html
Subject: Account Funded - $1,000.00 - REF123456

Dear John Doe,

Your Checking account has been funded with $1,000.00.

Transaction Details:
- Amount: $1,000.00
- Account: Checking
- Method: Direct Deposit
- Reference: REF123456
- Date: Nov 30, 2025

Thank you for banking with Liberty Bank.
```

## Current Configuration

### What Uses Nodemailer (Requires EMAIL_USER/PASSWORD):
- All transaction emails
- Admin action notifications
- Bill payment notifications
- Role change notifications
- Contact form emails
- Support ticket emails

### What Uses Resend (Requires RESEND_API_KEY):
- OTP emails only

### Recommendation:
Configure both for complete coverage:
1. Set up Nodemailer (Gmail or SMTP)
2. Keep Resend for OTP (already working)

## Security Considerations

### Email Security:
- ✅ Emails sent via secure connection (TLS/SSL)
- ✅ Sensitive data masked in logs
- ✅ No passwords in email content
- ✅ Reference numbers for tracking
- ✅ Professional from address

### Database Security:
- ✅ RPC functions use SECURITY DEFINER
- ✅ Row Level Security on email_notifications table
- ✅ Only admins can view email logs
- ✅ Automatic user/admin email fetching

## Summary

### What's Working:
- ✅ OTP emails (using Resend)
- ✅ All email notification code is written
- ✅ All transaction types covered
- ✅ Templates are professional
- ✅ Error handling implemented

### What Needs Setup:
- ⚠️ Run database_add_email_functions.sql
- ⚠️ Set EMAIL_USER and EMAIL_PASSWORD in Vercel
- ⚠️ Test after configuration

### Once Configured:
- 🎯 All transactions will send emails
- 🎯 Admin actions will notify users
- 🎯 Users will receive all notifications
- 🎯 Admins will be kept informed
- 🎯 Full audit trail of communications

---

**Action Required**: 
1. Run `database_add_email_functions.sql` in Supabase
2. Add email environment variables in Vercel
3. Redeploy application
4. Test email notifications

**Estimated Setup Time**: 10-15 minutes  
**Result**: All transaction emails working! 📧✅
