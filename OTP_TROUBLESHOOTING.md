# OTP System Troubleshooting Guide

## Issues Fixed

### 1. Login Redirect Issue
**Problem**: Login was redirecting to dashboard instead of `/verify-otp`

**Fix Applied**:
- Improved error handling in login page
- Added console logging to track OTP check flow
- Fixed the redirect logic to properly check OTP requirement

**To Test**:
1. Enable global OTP setting (as admin)
2. Enable 2FA for a user
3. Log in with that user
4. Should redirect to `/verify-otp`

### 2. OTP Codes Not Saving
**Problem**: OTP codes were not being saved to database

**Fix Applied**:
- Service role automatically bypasses RLS, so this should work
- Added better error logging in OTP send API
- Created `database_fix_otp_rls.sql` to ensure RLS policies are correct

**To Fix**:
1. Run `database_fix_otp_rls.sql` in Supabase SQL Editor
2. Check server logs when sending OTP
3. Verify OTP is being inserted (check `otp_verifications` table)

### 3. Email Not Sending
**Problem**: OTP emails were not being sent

**Fix Applied**:
- Added better error logging
- Check if `RESEND_API_KEY` is set
- Email will still log in console if key is missing (for development)

**To Fix**:
1. Set `RESEND_API_KEY` in `.env.local`
2. Set `FROM_EMAIL` to a verified domain in Resend
3. Check server console logs for email sending errors

## Debug Steps

### Step 1: Check Environment Variables

Make sure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=Liberty Bank <noreply@yourdomain.com>
REPLY_TO_EMAIL=support@yourdomain.com
```

### Step 2: Run Database Migrations

1. Run `database_otp_verification_system.sql`
2. Run `database_fix_otp_rls.sql`

### Step 3: Enable Global OTP Setting

As an admin, go to `/settings/security` and enable "Global OTP Setting"

Or run this SQL:

```sql
UPDATE app_settings 
SET setting_value = 'true'::jsonb 
WHERE setting_key = 'otp_global_enabled';
```

### Step 4: Enable User 2FA

For a test user, enable 2FA:

```sql
UPDATE user_profiles 
SET two_factor_enabled = true 
WHERE email = 'test@example.com';
```

### Step 5: Use Debug Endpoint

Check OTP system status:

```
GET /api/otp/debug?userId=USER_ID
```

This will show:
- User profile and 2FA settings
- Global OTP setting
- Recent OTP codes
- Verified sessions
- Environment variable status

### Step 6: Check Browser Console

When logging in, check browser console for:
- "OTP check result:" - Shows if OTP is required
- "OTP required, redirecting to verify-otp" - Confirms redirect
- Any error messages

### Step 7: Check Server Logs

Check your Next.js server console for:
- "Storing OTP in database:" - Confirms OTP is being saved
- "OTP stored successfully:" - Confirms save worked
- "Sending OTP email to:" - Confirms email attempt
- "OTP email sent successfully" - Confirms email sent
- Any error messages

## Common Issues

### Issue: "OTP check result: { requiresOTP: false }"

**Cause**: Global OTP setting is OFF or user 2FA is OFF

**Fix**: 
1. Enable global OTP setting
2. Enable user's 2FA toggle

### Issue: "Error storing OTP: ..."

**Cause**: Database RLS policy blocking insert

**Fix**:
1. Run `database_fix_otp_rls.sql`
2. Verify service role key is set correctly
3. Service role should bypass RLS automatically

### Issue: "Error sending OTP email: ..."

**Cause**: Resend API key not set or invalid

**Fix**:
1. Set `RESEND_API_KEY` in `.env.local`
2. Verify domain in Resend dashboard
3. Check `FROM_EMAIL` matches verified domain

### Issue: OTP codes in database but email not received

**Cause**: Email delivery issue

**Fix**:
1. Check Resend dashboard for delivery status
2. Check spam folder
3. Verify email address is correct
4. Check Resend API logs

## Testing Checklist

- [ ] Database migrations run
- [ ] Environment variables set
- [ ] Global OTP setting enabled
- [ ] User 2FA enabled
- [ ] Login redirects to `/verify-otp`
- [ ] OTP code appears in database
- [ ] Email is received
- [ ] OTP verification works
- [ ] Redirect to dashboard after verification

## Quick Test SQL

```sql
-- Check global setting
SELECT * FROM app_settings WHERE setting_key = 'otp_global_enabled';

-- Check user 2FA
SELECT id, email, two_factor_enabled, admin_forced_2fa 
FROM user_profiles 
WHERE email = 'your@email.com';

-- Check recent OTPs
SELECT * FROM otp_verifications 
ORDER BY created_at DESC 
LIMIT 5;

-- Check verified sessions
SELECT * FROM otp_verified_sessions 
WHERE expires_at > NOW()
ORDER BY created_at DESC;
```

## Still Having Issues?

1. Check browser console for errors
2. Check server logs for errors
3. Use debug endpoint: `/api/otp/debug?userId=USER_ID`
4. Verify database tables exist
5. Verify RLS policies are correct
6. Test with a fresh user account

