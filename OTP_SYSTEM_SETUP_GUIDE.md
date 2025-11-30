# OTP (One-Time Password) Login System - Complete Setup Guide

## ✅ What's Been Implemented

A complete OTP (One-Time Password) authentication system that sends a 6-digit code to users' emails during login. Admins can enable/disable OTP for individual users.

### Features

- **6-Digit OTP Codes**: Secure 6-digit codes sent via email
- **10-Minute Expiry**: Codes expire after 10 minutes for security
- **Admin Control**: Admins can toggle OTP on/off for any user
- **Automatic Integration**: Works seamlessly with existing login flow
- **Email Notifications**: Professional email templates for OTP codes
- **Rate Limiting**: Maximum 5 verification attempts per code
- **Security**: Codes are invalidated after use or expiry

## 📋 Setup Steps

### Step 1: Run Database Migration

Execute the SQL file in your Supabase SQL Editor:

```bash
database_otp_system.sql
```

This creates:
- `otp_enabled` column in `user_profiles` table
- `login_otp_codes` table for storing OTP codes
- Indexes for performance
- Row Level Security (RLS) policies

### Step 2: Verify Email Configuration

Make sure your email service (Resend) is configured in `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=Liberty Bank <noreply@yourdomain.com>
REPLY_TO_EMAIL=support@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

### Step 3: Enable OTP for Users (Admin)

1. Go to **Admin Dashboard** → **Users**
2. Click on any user to view details
3. In the **Account Information** section, you'll see **OTP Login** toggle
4. Toggle it **ON** to enable OTP for that user
5. Toggle it **OFF** to disable OTP (user can login normally)

## 🔄 How It Works

### For Users (When OTP is Enabled)

1. User enters email and password on login page
2. System verifies password
3. If OTP is enabled, system:
   - Signs user out temporarily
   - Generates a 6-digit OTP code
   - Sends code to user's email
   - Shows OTP input form
4. User enters the 6-digit code from email
5. System verifies code
6. If valid, user is signed in and redirected to dashboard

### For Users (When OTP is Disabled)

- Normal login flow (no OTP required)
- User enters email and password
- Directly logged in

### For Admins

- **View OTP Status**: See if OTP is enabled/disabled for each user
- **Toggle OTP**: Enable or disable OTP for any user with a simple toggle switch
- **Real-time Updates**: Changes take effect immediately

## 📁 Files Created/Modified

### New Files

1. **`database_otp_system.sql`**
   - Database schema for OTP system
   - Creates `login_otp_codes` table
   - Adds `otp_enabled` column to `user_profiles`

2. **`app/api/auth/generate-otp/route.ts`**
   - API endpoint to generate and send OTP codes
   - Validates user exists and OTP is enabled
   - Sends email with OTP code

3. **`app/api/auth/verify-otp/route.ts`**
   - API endpoint to verify OTP codes
   - Checks expiry and attempts
   - Returns success if valid

### Modified Files

1. **`lib/utils/emailTemplates.ts`**
   - Added `getOTPEmailTemplate()` function
   - Professional OTP email template

2. **`app/api/email/send/route.ts`**
   - Added `otp_login` case to handle OTP emails

3. **`app/login/page.tsx`**
   - Added OTP verification flow
   - OTP input form UI
   - Integration with login process

4. **`app/admin/users/page.tsx`**
   - Added OTP toggle in user details modal
   - `handleToggleOTP()` function
   - OTP status display

## 🎯 Usage Examples

### Enable OTP for a User (Admin)

```typescript
// In admin/users/page.tsx
// Click the toggle switch in user details modal
// The system automatically:
// 1. Updates user_profiles.otp_enabled = true
// 2. User will now require OTP on next login
```

### User Login Flow (OTP Enabled)

```
1. User: Enters email + password
2. System: Verifies password ✓
3. System: Checks otp_enabled = true
4. System: Generates OTP code (e.g., "123456")
5. System: Sends email with code
6. User: Receives email with code
7. User: Enters code in OTP form
8. System: Verifies code ✓
9. System: Completes login → Redirects to dashboard
```

## 🔒 Security Features

1. **Code Expiry**: OTP codes expire after 10 minutes
2. **Single Use**: Codes are marked as used after verification
3. **Attempt Limiting**: Maximum 5 verification attempts per code
4. **Automatic Cleanup**: Expired codes are automatically invalidated
5. **Email Validation**: Only sends OTP if user exists and OTP is enabled
6. **No Enumeration**: Doesn't reveal if user exists or not

## 🐛 Troubleshooting

### OTP Not Sending

1. Check `RESEND_API_KEY` in `.env.local`
2. Verify email service is configured
3. Check browser console for errors
4. Verify user has `otp_enabled = true` in database

### OTP Code Invalid

1. Check if code has expired (10 minutes)
2. Verify code hasn't been used already
3. Check if maximum attempts exceeded (5 attempts)
4. Ensure code is exactly 6 digits

### Admin Toggle Not Working

1. Verify admin has proper permissions
2. Check database connection
3. Refresh users list after toggling
4. Check browser console for errors

## 📊 Database Schema

### `user_profiles` Table
```sql
ALTER TABLE user_profiles
ADD COLUMN otp_enabled BOOLEAN DEFAULT false;
```

### `login_otp_codes` Table
```sql
CREATE TABLE login_otp_codes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  email TEXT NOT NULL,
  code TEXT NOT NULL, -- 6-digit code
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 UI Components

### Login Page OTP Form

- Clean, modern OTP input field
- Large, monospace font for code
- Resend code button
- Countdown timer showing expiry
- Back to login button

### Admin User Details

- OTP status display (Enabled/Disabled)
- Toggle switch for easy enable/disable
- Real-time updates

## ✅ Testing Checklist

- [ ] Run database migration
- [ ] Enable OTP for a test user
- [ ] Attempt login with that user
- [ ] Verify OTP email is received
- [ ] Enter correct OTP code
- [ ] Verify successful login
- [ ] Test with expired code
- [ ] Test with invalid code
- [ ] Test with maximum attempts
- [ ] Disable OTP and verify normal login works
- [ ] Test admin toggle functionality

## 🚀 Next Steps

1. **Run the database migration** (`database_otp_system.sql`)
2. **Test with a user account** by enabling OTP
3. **Configure email service** if not already done
4. **Enable OTP for users** who need it via admin panel

## 📝 Notes

- OTP codes are case-insensitive
- Codes are numeric only (6 digits)
- Each code can only be used once
- Users can request a new code if needed
- Admin can disable OTP at any time
- OTP is optional - users without it login normally

---

**That's it!** Your OTP login system is ready to use! 🎉

