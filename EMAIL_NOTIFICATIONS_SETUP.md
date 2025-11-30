# Email Notifications System Setup Guide

## ✅ What's Been Created

A comprehensive email notification system has been added to your Liberty International Bank application. The system sends professional, clean email notifications to both users and admins for various banking actions.

### Features

- **Transfer Notifications**: Internal, External, P2P, and Wire transfers
- **Bill Payment Notifications**: Confirmation emails for bill payments
- **Loan Notifications**: Application received, approval, and payment confirmations
- **Admin Notifications**: Admins receive copies of all important transactions
- **Email Tracking**: All sent emails are logged in the database
- **Professional Templates**: Clean, responsive HTML email templates

## 📋 Setup Steps

### Step 1: Install Dependencies

```bash
npm install resend
```

### Step 2: Set Up Resend Account

1. Go to https://resend.com and create a free account
2. Verify your domain or use Resend's test domain for development
3. Get your API key from the dashboard

### Step 3: Configure Environment Variables

Create or update your `.env.local` file with the following:

```env
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Configuration
FROM_EMAIL=Liberty Bank <noreply@yourdomain.com>
REPLY_TO_EMAIL=support@yourdomain.com
```

**Important Notes:**
- Replace `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual Resend API key
- Replace `noreply@yourdomain.com` with your verified domain email
- Replace `support@yourdomain.com` with your support email
- For development, you can use Resend's test domain: `onboarding@resend.dev`

### Step 4: Create Database Tables

Run the SQL file in your Supabase SQL Editor:

```bash
database_email_notifications_system.sql
```

This creates:
- `email_notifications` table for tracking sent emails
- Helper functions to get admin and user emails
- Row Level Security (RLS) policies

### Step 5: Verify Installation

1. Make a test transfer or bill payment
2. Check your email inbox
3. Check the `email_notifications` table in Supabase to see logged emails

## 📧 Email Notification Types

The system sends emails for:

### Transfers
- **Internal Transfer**: Between user's own accounts
- **External Transfer**: To external bank accounts
- **P2P Transfer**: Peer-to-peer transfers
- **Wire Transfer**: Domestic and international wire transfers

### Bills
- **Bill Payment**: Confirmation when a bill is paid

### Loans
- **Loan Application**: When a user submits a loan application
- **Loan Approval**: When admin approves a loan
- **Loan Payment**: When a user makes a loan payment

## 🎨 Email Templates

All emails use professional, responsive HTML templates with:
- Clean, modern design
- Mobile-responsive layout
- Brand colors and styling
- Transaction details clearly displayed
- Security notices where appropriate

## 🔧 Customization

### Customizing Email Templates

Edit the templates in `lib/utils/emailTemplates.ts`:
- `getTransferEmailTemplate()` - Transfer notifications
- `getBillPaymentEmailTemplate()` - Bill payment notifications
- `getLoanApplicationEmailTemplate()` - Loan application notifications
- `getLoanApprovalEmailTemplate()` - Loan approval notifications
- `getLoanPaymentEmailTemplate()` - Loan payment notifications

### Customizing Email Service

Edit `lib/utils/emailService.ts` to:
- Change email sending logic
- Add new notification types
- Customize email logging

### Customizing API Route

Edit `app/api/email/send/route.ts` to:
- Change email service provider
- Add custom email processing
- Modify email headers

## 📊 Email Tracking

All sent emails are tracked in the `email_notifications` table with:
- Recipient email and name
- Notification type
- Subject line
- Send status (success/failure)
- Error messages (if any)
- Metadata (transaction details, amounts, etc.)
- Timestamps

## 🔒 Security

- Email sending is non-blocking (won't break transactions if email fails)
- All email operations are logged for audit purposes
- RLS policies ensure users can only see their own email notifications
- Admins can view all email notifications

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set correctly
2. **Check Domain**: Ensure your domain is verified in Resend
3. **Check Logs**: Look at the `email_notifications` table for error messages
4. **Check Console**: Look for errors in browser console and server logs

### Development Mode

In development, if `RESEND_API_KEY` is not set, emails will be logged to the console instead of being sent. This is intentional to prevent accidental email sends during development.

### Email Delivery Issues

- Check Resend dashboard for delivery status
- Verify recipient email addresses are valid
- Check spam/junk folders
- Review Resend logs for bounce/spam reports

## 📝 Adding New Notification Types

To add a new notification type:

1. Add the notification type to `database_email_notifications_system.sql`:
   ```sql
   CHECK (notification_type IN (..., 'new_type'))
   ```

2. Create a template function in `lib/utils/emailTemplates.ts`:
   ```typescript
   export function getNewTypeEmailTemplate(data: NewTypeData) {
     // Template code
   }
   ```

3. Add handling in `app/api/email/send/route.ts`:
   ```typescript
   case 'new_type': {
     // Handle new type
   }
   ```

4. Create a helper function in `lib/utils/emailNotifications.ts`:
   ```typescript
   export async function sendNewTypeNotification(...) {
     // Notification logic
   }
   ```

5. Call the function where needed in your code

## 🎯 Best Practices

1. **Always use non-blocking email sends**: Don't let email failures break transactions
2. **Log all email attempts**: Track both successes and failures
3. **Use meaningful subjects**: Help users identify emails quickly
4. **Include reference numbers**: Make it easy to track transactions
5. **Test thoroughly**: Test all email types before going to production
6. **Monitor email delivery**: Check Resend dashboard regularly
7. **Keep templates updated**: Ensure branding and information stay current

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

---

**Ready to go!** Your email notification system is now set up and ready to send professional banking notifications to your users and admins.

