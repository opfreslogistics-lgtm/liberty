# OTP Verification System - Complete Implementation Guide

## ✅ What Has Been Implemented

A complete email-based OTP (One-Time Password) verification system has been implemented for your banking web app. This system is separate from Supabase Auth and provides an additional layer of security.

## 📋 Database Setup

### 1. Run the Database Migration

Execute the SQL file in your Supabase SQL Editor:

```sql
database_otp_verification_system.sql
```

This creates:
- `otp_verifications` table - Stores OTP codes
- `otp_verified_sessions` table - Tracks verified sessions
- `otp_rate_limits` table - Rate limiting (max 5 requests/hour)
- `app_settings` table - Global OTP setting
- Adds `two_factor_enabled` and `admin_forced_2fa` columns to `user_profiles`
- Database function `user_requires_otp_verification()` for OTP requirement logic

## 🔐 How It Works

### Authentication Flow

1. **User logs in** with email + password (Supabase Auth)
2. **System checks** if OTP verification is required:
   - If global setting = OFF → Skip OTP, go to dashboard
   - If global setting = ON AND user's 2FA toggle = ON → Redirect to `/verify-otp`
   - If user's toggle = OFF → Skip OTP, go to dashboard
   - Admin override always wins
   - **Superadmin always bypasses OTP**
   - **Admin using `/admin/login` form bypasses OTP and goes to `/admin`**

3. **On `/verify-otp` page**:
   - OTP is automatically sent to user's email
   - User enters 6-digit code
   - Code is verified
   - Verified session is created (valid for 24 hours)
   - User is redirected to dashboard

### Logic Rules

- **Global Setting OFF** → OTP never triggers
- **Global Setting ON + User 2FA ON** → OTP required
- **Global Setting ON + User 2FA OFF** → Skip OTP
- **Admin Override** → Always requires OTP (overrides user setting)
- **Superadmin** → Always bypasses OTP
- **Admin Login Form** → Bypasses OTP, goes to `/admin`

## 📁 Files Created

### Database
- `database_otp_verification_system.sql` - Complete database schema

### API Routes
- `app/api/otp/send/route.ts` - Send OTP code
- `app/api/otp/verify/route.ts` - Verify OTP code
- `app/api/otp/resend/route.ts` - Resend OTP code
- `app/api/otp/check-requirement/route.ts` - Check if user needs OTP
- `app/api/otp/check-session/route.ts` - Check verified session
- `app/api/settings/update-2fa/route.ts` - User updates their 2FA setting
- `app/api/admin/update-2fa/route.ts` - Admin forces 2FA for users
- `app/api/admin/global-otp-setting/route.ts` - Admin manages global OTP setting

### Pages
- `app/verify-otp/page.tsx` - OTP verification page with resend functionality
- `app/settings/security/page.tsx` - User security settings with 2FA toggle

### Utilities
- `lib/utils/otp.ts` - OTP utility functions

### Middleware
- `middleware.ts` - Route protection (simplified, OTP check in pages)

### Updated Files
- `app/login/page.tsx` - Redirects to `/verify-otp` when needed
- `app/admin/login/page.tsx` - Bypasses OTP, goes to `/admin`
- `app/admin/users/page.tsx` - Added 2FA controls in user management

## 🚀 Setup Instructions

### 1. Environment Variables

Make sure these are set in your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend (for sending OTP emails)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=Liberty Bank <noreply@yourdomain.com>
REPLY_TO_EMAIL=support@yourdomain.com
```

### 2. Run Database Migration

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run `database_otp_verification_system.sql`

### 3. Test the System

1. **Enable Global OTP** (Admin only):
   - Go to `/settings/security` as admin
   - Toggle "Enable OTP Verification System-Wide"

2. **Enable User 2FA**:
   - Go to `/settings/security` as user
   - Toggle "Email OTP Verification"

3. **Test Login Flow**:
   - Log out
   - Log in with a user that has 2FA enabled
   - You should be redirected to `/verify-otp`
   - Check email for 6-digit code
   - Enter code and verify

## 🎛️ Admin Controls

### Global OTP Setting

Admins can enable/disable OTP system-wide:
- Location: `/settings/security` (admin view)
- API: `POST /api/admin/global-otp-setting`

### Force 2FA for Users

Admins can force enable/disable 2FA for any user:
- Location: `/admin/users` → View user → Security section
- API: `POST /api/admin/update-2fa` with `force: true`

### User 2FA Toggle

Users can enable/disable their personal 2FA:
- Location: `/settings/security`
- API: `POST /api/settings/update-2fa`

## 📧 Email Template

OTP emails are sent using Resend with a professional banking-style template:
- Subject: "Your One-Time Login Code"
- Contains: 6-digit code, expiration time (5 minutes), security notice
- Styled with Liberty International Bank branding

## 🔒 Security Features

1. **Rate Limiting**: Max 5 OTP requests per hour per user
2. **Expiration**: OTP codes expire after 5 minutes
3. **Single Use**: Each OTP code can only be used once
4. **Session Tracking**: Verified sessions tracked for 24 hours
5. **Admin Override**: Admins can force 2FA for security compliance

## 🧪 Testing Checklist

- [ ] Run database migration
- [ ] Set environment variables
- [ ] Test user login with 2FA enabled
- [ ] Test user login with 2FA disabled
- [ ] Test admin login (should bypass OTP)
- [ ] Test superadmin login (should bypass OTP)
- [ ] Test OTP resend functionality
- [ ] Test rate limiting (try 6+ requests)
- [ ] Test expired OTP code
- [ ] Test admin force 2FA toggle
- [ ] Test global OTP setting toggle

## 📝 Notes

- **Superadmin accounts** always bypass OTP verification
- **Admin login form** (`/admin/login`) bypasses OTP and redirects to `/admin`
- **Regular login form** (`/login`) checks OTP requirement and redirects to `/verify-otp` if needed
- OTP verification is **separate from Supabase Auth** - it's a custom implementation
- All OTP codes are stored in your own database table
- Email sending uses **Resend.com** service

## 🐛 Troubleshooting

### OTP Email Not Received
- Check `RESEND_API_KEY` is set
- Verify `FROM_EMAIL` is a verified domain in Resend
- Check server logs for email sending errors

### OTP Verification Fails
- Check database migration was run
- Verify `otp_verifications` table exists
- Check OTP hasn't expired (5 minutes)
- Ensure OTP code matches exactly (6 digits)

### User Stuck on Verify-OTP Page
- Check if global OTP setting is enabled
- Verify user's `two_factor_enabled` status
- Check for admin override (`admin_forced_2fa`)
- Clear browser cookies and try again

## 🔄 Future Enhancements

Potential improvements:
- SMS OTP option
- Backup codes
- OTP history/logs
- Customizable expiration time
- Multi-device verification

---

**Implementation Complete!** 🎉

All files have been created and integrated. The system is ready to use after running the database migration and setting environment variables.

