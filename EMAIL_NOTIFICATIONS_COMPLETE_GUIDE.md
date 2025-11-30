# Complete Email Notifications Guide

## 📧 Overview

Your Liberty International Bank application now has a comprehensive email notification system that sends professional emails to users and admins for various banking actions.

## ✅ What Emails Are Sent

### 1. **Admin Actions**

#### When Admin Changes User Role
- **User receives**: Email notification about role change (promotion/demotion)
  - Subject: "Account Role Changed - [New Role]"
  - Includes: Previous role, new role, changed by, date/time
  - Special message for promotions (admin/superadmin access)
  
- **Admins receive**: Notification about the role change action
  - Subject: "Admin Action: Role Changed to [Role]"
  - Includes: User details, action performed, who performed it

#### When Admin Funds User Account
- **User receives**: Account funded confirmation email
  - Subject: "Account Funded - [Amount] - [Reference Number]"
  - Includes: Amount, account type, account number, funding method, reference number, date/time, processed by admin
  
- **Admins receive**: Notification about the funding action
  - Subject: "Admin Action: Account Funded - [Amount]"
  - Includes: User details, account details, funding amount, method

### 2. **User Actions**

#### Transfers (Internal, External, P2P, Wire)
- **User receives**: Transfer confirmation email
- **Admins receive**: Copy of transfer notification

#### Bill Payments
- **User receives**: Bill payment confirmation email
- **Admins receive**: Copy of payment notification

#### Loan Applications
- **User receives**: Application received confirmation
- **Admins receive**: New loan application notification

#### Loan Approvals
- **User receives**: Loan approval email with terms
- **Admins receive**: Approval confirmation

#### Loan Payments
- **User receives**: Payment confirmation
- **Admins receive**: Payment notification

## 🔧 How It Works in Development Mode (Localhost)

### Development Behavior

When running on localhost, the email system works as follows:

1. **If `RESEND_API_KEY` is NOT set** (default for development):
   - ✅ Emails are **logged to the console** instead of being sent
   - ✅ All email data is still logged to the `email_notifications` table
   - ✅ You can see what emails would be sent in your terminal/console
   - ✅ No actual emails are sent (prevents accidental sends during development)

2. **If `RESEND_API_KEY` IS set**:
   - ✅ Emails are **actually sent** via Resend
   - ✅ Works exactly like production
   - ✅ Use Resend's test domain (`onboarding@resend.dev`) for testing

### Console Output Example

When `RESEND_API_KEY` is not set, you'll see output like this in your console:

```
Email would be sent: {
  to: 'user@example.com',
  subject: 'Account Funded - $1,000.00 - REF123456',
  from: 'Liberty Bank <noreply@libertybank.com>'
}
```

### Setting Up for Development Testing

If you want to actually send emails during development:

1. Sign up at https://resend.com (free account)
2. Get your API key from the dashboard
3. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   FROM_EMAIL=Liberty Bank <onboarding@resend.dev>
   REPLY_TO_EMAIL=support@libertybank.com
   ```
4. Use `onboarding@resend.dev` as the FROM_EMAIL (Resend's test domain)
5. Emails will be sent to any email address (for testing)

## 📋 Complete Email Notification Types

The system supports these notification types (defined in `database_email_notifications_system.sql`):

- `transfer_internal` - Internal transfers
- `transfer_external` - External transfers
- `transfer_p2p` - Peer-to-peer transfers
- `transfer_wire` - Wire transfers
- `bill_payment` - Bill payments
- `loan_application` - Loan applications
- `loan_approved` - Loan approvals
- `loan_declined` - Loan rejections
- `loan_payment` - Loan payments
- `account_funded` - **Admin funding** ✅ NEW
- `account_frozen` - Account freezes
- `kyc_approved` - KYC approvals
- `kyc_rejected` - KYC rejections
- `deposit_approved` - Deposit approvals
- `deposit_rejected` - Deposit rejections
- `card_created` - Card creation
- `card_blocked` - Card blocks
- `transaction_alert` - Transaction alerts
- `security_alert` - Security alerts
- `admin_action` - Admin actions
- `role_changed` - **Role changes** ✅ NEW

## 🎯 What Happens When Actions Occur

### Scenario 1: Admin Changes User Role

**Action Flow:**
1. Admin clicks "Assign Admin" or "Revoke Admin" in admin panel
2. Role is updated in database
3. **Email sent to user** with role change details
4. **Email sent to all admins** about the action
5. Email attempts are logged to `email_notifications` table

**User Email Includes:**
- Previous role
- New role
- Who changed it
- Date/time
- Special instructions if promoted (sign out/in to access admin panel)

### Scenario 2: Admin Funds User Account

**Action Flow:**
1. Admin selects user and account
2. Admin enters amount and funding method (Direct Deposit/ACH)
3. Transaction is created in database
4. Account balance is updated (via trigger)
5. In-app notification is created
6. **Email sent to user** with funding details
7. **Email sent to all admins** about the funding
8. Email attempts are logged to `email_notifications` table

**User Email Includes:**
- Amount funded
- Account type and number
- Funding method
- Reference number
- Date/time
- Admin who processed it

## 📊 Email Tracking

All email attempts are tracked in the `email_notifications` table:

- ✅ Success/failure status
- ✅ Recipient email and name
- ✅ Notification type
- ✅ Subject line
- ✅ Metadata (amounts, account details, etc.)
- ✅ Error messages (if sending failed)
- ✅ Timestamps

**View emails in Supabase:**
```sql
SELECT * FROM email_notifications 
ORDER BY created_at DESC 
LIMIT 50;
```

## 🚀 Production Setup

For production, you need:

1. **Resend Account** with verified domain
2. **Environment Variables** in `.env.local`:
   ```env
   RESEND_API_KEY=re_your_production_key
   FROM_EMAIL=Liberty Bank <noreply@yourdomain.com>
   REPLY_TO_EMAIL=support@yourdomain.com
   ```
3. **Domain Verification** in Resend dashboard
4. **Database Migration** - Run `database_email_notifications_system.sql`

## 🔍 Testing Email Notifications

### Test Role Change:
1. Go to Admin → Users
2. Find a user
3. Click "Assign Admin" or "Revoke Admin"
4. Check console (development) or email inbox (with API key set)
5. Check `email_notifications` table in Supabase

### Test Account Funding:
1. Go to Admin → Users
2. Select a user
3. Click "Fund Account"
4. Enter amount and select account
5. Submit
6. Check console (development) or email inbox (with API key set)
7. Check `email_notifications` table in Supabase

## 📝 Files Modified/Created

### New Files:
- None (all integrated into existing system)

### Modified Files:
- ✅ `lib/utils/emailTemplates.ts` - Added role change and account funded templates
- ✅ `lib/utils/emailNotifications.ts` - Added role change and account funded helpers
- ✅ `app/api/email/send/route.ts` - Added handlers for new notification types
- ✅ `app/admin/users/page.tsx` - Added email sending to role change and funding functions
- ✅ `database_email_notifications_system.sql` - Added `role_changed` to notification types

## ⚠️ Important Notes

1. **Non-blocking**: Email failures won't break transactions or role changes
2. **Error handling**: All email errors are logged but don't stop the main action
3. **Development safety**: Without API key, emails are logged only (won't send)
4. **Production ready**: With API key, emails are actually sent
5. **Audit trail**: All email attempts are logged in database

## 🎉 Summary

Your email notification system now covers:
- ✅ All user transactions (transfers, bills, loans)
- ✅ **Admin role changes** (NEW)
- ✅ **Admin account funding** (NEW)
- ✅ All admin actions are logged and notified
- ✅ Works safely in development (console logging)
- ✅ Production ready with Resend API key

---

**Ready to use!** The system will automatically send emails when admins perform actions or users make transactions. In development, check your console. In production, check email inboxes!

