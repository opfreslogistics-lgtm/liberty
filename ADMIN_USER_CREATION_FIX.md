# Admin User Creation Fix - Complete Guide

## Issues Fixed

### 1. CHECK Constraint Violations
- **Problem**: `user_profiles_employment_status_check` constraint violations
- **Cause**: Empty strings being sent instead of NULL
- **Solution**: Added sanitization function that converts empty strings to NULL and validates against allowed values

### 2. Complete Field Mapping
- **Problem**: Missing fields from signup form
- **Solution**: Added all fields from registration form to ensure consistency

## Changes Made

### `app/api/admin/create-user/route.ts`

1. **Added Field Sanitization**
   - Created `sanitizeConstraintValue()` helper function
   - Validates against CHECK constraint allowed values
   - Converts empty strings to NULL

2. **Added Complete Field Support**
   - Gender, marital status, SSN, nationality
   - Job title, employment years, monthly income
   - Total assets, monthly expenses
   - Security questions (3)
   - Preferred language, referral source, marketing consent

3. **Fixed Constraint Handling**
   - `employment_status`: Only accepts `'employed', 'self-employed', 'unemployed', 'student', 'retired', 'other'` or NULL
   - `gender`: Only accepts `'male', 'female', 'other', 'prefer-not-to-say'` or NULL
   - `marital_status`: Only accepts `'single', 'married', 'divorced', 'widowed', 'separated'` or NULL

4. **Login Capability**
   - Sets `email_confirm: true` - email is confirmed
   - Sets `signup_complete: true` - signup is complete
   - Sets `signup_step: 6` - all steps complete
   - Sets `account_status: 'active'` - account is active
   - Sets `otp_enabled_login: true` - OTP enabled (users can log in)

### `app/admin/users/page.tsx`

1. **Fixed Employment Status Sending**
   - Changed from `employmentStatus || null` to proper validation
   - Ensures empty strings are handled correctly

## How It Works

1. **Admin fills form** → All fields are optional except basic info
2. **Form sends data** → Empty fields are sent as empty strings
3. **API validates** → Sanitizes constraint fields (converts empty to NULL)
4. **Creates auth user** → Email confirmed, ready to login
5. **Creates profile** → All fields properly validated and inserted
6. **Creates accounts** → Up to 3 accounts with cards if requested
7. **User can login** → Immediately after creation

## Validation Rules

### Employment Status
- Allowed: `'employed', 'self-employed', 'unemployed', 'student', 'retired', 'other'`
- Empty string → NULL
- Invalid value → NULL (prevents constraint violation)

### Gender
- Allowed: `'male', 'female', 'other', 'prefer-not-to-say'`
- Empty string → NULL

### Marital Status
- Allowed: `'single', 'married', 'divorced', 'widowed', 'separated'`
- Empty string → NULL

## User Login After Creation

Users created via admin form can immediately log in because:
- ✅ Email is confirmed (`email_confirm: true`)
- ✅ Signup is complete (`signup_complete: true`)
- ✅ Account is active (`account_status: 'active'`)
- ✅ OTP is enabled (they'll receive OTP email on first login)

## Testing

1. Go to `/admin/users`
2. Click "Add User"
3. Fill in required fields (first name, last name, username, email, password)
4. Optionally fill in other fields
5. Select account types (up to 3)
6. Click "Create User"
7. User should be created successfully
8. User can immediately log in with the provided credentials

## Error Prevention

- Empty strings → NULL (prevents CHECK constraint violations)
- Invalid values → NULL (prevents CHECK constraint violations)
- Type validation before insertion
- Proper error messages for invalid data

