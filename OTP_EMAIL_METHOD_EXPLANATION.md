# OTP Email Sending Method - Explanation & Troubleshooting

## 📧 How OTP Emails Are Sent

The OTP system uses **Resend** to send emails directly from the API route. Here's how it works:

### Method: Direct Resend Integration

**Location:** `app/api/auth/generate-otp/route.ts`

**Process:**
1. User logs in with email and password
2. System checks if OTP is enabled for that user
3. A 6-digit OTP code is generated
4. Code is stored in the database (`login_otp_codes` table)
5. Email is sent **directly using Resend** (no HTTP fetch calls)
6. Email notification is logged in the database

### Key Changes Made

**Before:** 
- Used HTTP fetch to call `/api/email/send` route
- Could fail due to internal routing issues
- Less reliable in server-side contexts

**After:**
- Directly uses Resend service in the same API route
- More reliable and faster
- Better error handling and logging
- Still logs email notifications in database

## 🔧 Configuration Required

### Environment Variables

Make sure these are set in your `.env.local` file:

```env
# Resend API Key (REQUIRED)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Configuration
FROM_EMAIL=Liberty Bank <noreply@yourdomain.com>
REPLY_TO_EMAIL=support@yourdomain.com
```

### For Development (Testing)

If `RESEND_API_KEY` is not set:
- OTP codes are still generated and stored
- Email details are logged to console
- System returns success (for testing)
- You can check the console to see what would be sent

## 📋 Step-by-Step Troubleshooting

### Issue: OTP Email Not Being Received

#### Step 1: Check Environment Variables

```bash
# Check if RESEND_API_KEY is set
echo $RESEND_API_KEY  # Linux/Mac
# or check .env.local file
```

**Solution:** Add `RESEND_API_KEY` to `.env.local` and restart your dev server.

#### Step 2: Check Server Logs

Look for these console messages:

**Success:**
```
OTP email sent successfully: { to: 'user@example.com', messageId: 'xxx' }
```

**Error:**
```
Resend error sending OTP email: { message: '...' }
```

**No API Key:**
```
RESEND_API_KEY not configured. Email would be sent in production.
OTP Email would be sent: { to: '...', otpCode: '123456', from: '...' }
```

#### Step 3: Verify Resend Account

1. Go to https://resend.com
2. Check your API key is valid
3. Check if you have verified your domain
4. Check if you're using the correct FROM_EMAIL format

**FROM_EMAIL Format:**
```
✅ Correct: "Liberty Bank <noreply@yourdomain.com>"
✅ Correct (test): "Liberty Bank <onboarding@resend.dev>"
❌ Wrong: "noreply@yourdomain.com" (missing name)
```

#### Step 4: Check Database

Verify OTP code was stored:

```sql
SELECT * FROM login_otp_codes 
WHERE email = 'user@example.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

Check email notification log:

```sql
SELECT * FROM email_notifications 
WHERE notification_type = 'otp_login' 
ORDER BY created_at DESC 
LIMIT 5;
```

Look at:
- `email_sent` (true/false)
- `email_error` (error message if failed)
- `email_sent_at` (timestamp)

#### Step 5: Check OTP Is Enabled

Make sure OTP is enabled for the user:

```sql
SELECT email, otp_enabled FROM user_profiles 
WHERE email = 'user@example.com';
```

If `otp_enabled` is `false`, enable it via admin panel.

### Issue: OTP Code Not Working

#### Check Code Expiry

```sql
SELECT 
  code,
  expires_at,
  used,
  attempts,
  NOW() as current_time,
  expires_at > NOW() as is_valid
FROM login_otp_codes 
WHERE email = 'user@example.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

#### Check Attempts

Max attempts is 5. If exceeded, request a new code.

## 🔍 Common Error Messages

### "RESEND_API_KEY not configured"

**Meaning:** No API key in environment variables.

**Solution:** 
1. Get API key from https://resend.com
2. Add to `.env.local`: `RESEND_API_KEY=re_xxxxx`
3. Restart dev server

### "Failed to send email"

**Meaning:** Resend API call failed.

**Possible Causes:**
- Invalid API key
- Unverified domain (if using custom FROM_EMAIL)
- Rate limiting
- Invalid email address

**Solution:**
- Check Resend dashboard for errors
- Use `onboarding@resend.dev` for testing
- Verify email address is valid

### "OTP is not enabled for this account"

**Meaning:** User doesn't have OTP enabled.

**Solution:**
- Go to Admin Dashboard → Users
- Click on user
- Toggle "OTP Login" ON

## 🧪 Testing Without Resend API Key

During development, if you don't have a Resend API key:

1. OTP codes are still generated and stored
2. Check console logs for the OTP code
3. You can manually enter the code from console
4. Or check database:

```sql
SELECT code FROM login_otp_codes 
WHERE email = 'user@example.com' 
AND used = false 
ORDER BY created_at DESC 
LIMIT 1;
```

## 📊 Email Delivery Tracking

### Database Logs

All email attempts are logged in `email_notifications` table:

```sql
SELECT 
  recipient_email,
  subject,
  email_sent,
  email_error,
  email_sent_at,
  created_at
FROM email_notifications
WHERE notification_type = 'otp_login'
ORDER BY created_at DESC;
```

### Resend Dashboard

Check https://resend.com/emails for:
- Delivery status
- Bounce reports
- Open rates (if enabled)

## 🚀 Quick Setup Checklist

- [ ] Resend account created at https://resend.com
- [ ] API key obtained from Resend dashboard
- [ ] `RESEND_API_KEY` added to `.env.local`
- [ ] `FROM_EMAIL` configured (use `onboarding@resend.dev` for testing)
- [ ] `REPLY_TO_EMAIL` configured
- [ ] Dev server restarted after adding env vars
- [ ] OTP enabled for test user via admin panel
- [ ] Test login attempted
- [ ] Console logs checked for email sending status
- [ ] Email received (or checked Resend dashboard)

## 🔗 Related Files

- **OTP Generation:** `app/api/auth/generate-otp/route.ts`
- **OTP Verification:** `app/api/auth/verify-otp/route.ts`
- **Login Page:** `app/login/page.tsx`
- **Email Templates:** `lib/utils/emailTemplates.ts`
- **Email API Route:** `app/api/email/send/route.ts` (used by other features)

## 💡 Pro Tips

1. **For Development:** Use `onboarding@resend.dev` as FROM_EMAIL (works without domain verification)

2. **For Production:** Verify your domain in Resend first, then use your domain email

3. **Testing:** Always check console logs - they show exactly what's happening

4. **Database:** Check `email_notifications` table to see all email attempts and errors

5. **Debugging:** Enable detailed logging in development mode to see all email operations

---

**That's it!** Your OTP emails should now be sent reliably using Resend. If you're still having issues, check the server console logs first - they'll tell you exactly what's wrong.

