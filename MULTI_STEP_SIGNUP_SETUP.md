# Multi-Step Signup System - Setup Guide

## Overview
This multi-step signup system allows users to register in 3 steps:
1. **Step 1**: Basic Information (creates Supabase auth account)
2. **Step 2**: Account Information & KYC (auto-generates accounts and cards)
3. **Step 3**: Financial & Verification (document uploads)

## Features
- ✅ Automatic progress saving between steps
- ✅ First user becomes SUPER ADMIN automatically
- ✅ Auto-generation of account numbers and cards for selected account types
- ✅ Proper redirects based on user role (admin → /admin, user → /dashboard)
- ✅ Resume incomplete signups
- ✅ Secure document uploads to Supabase Storage

## Database Setup

### Step 1: Run the Multi-Step Signup Schema
Run `database_multi_step_signup.sql` in your Supabase SQL Editor. This will:
- Add signup progress tracking columns to `user_profiles`
- Create function to auto-assign superadmin to first user
- Create functions to generate unique account numbers and Luhn-valid card numbers
- Create function to auto-generate accounts with cards

### Step 2: Set Up Storage Bucket
Run `database_storage_setup.sql` in your Supabase SQL Editor. This will:
- Create `documents` storage bucket for driver's license uploads
- Set up proper RLS policies for document access

## How It Works

### Step 1: Basic Information
- User enters: First Name, Last Name, Username, Email, Phone, Password
- Creates Supabase auth account
- Creates user profile with `signup_step = 2`
- First user automatically gets `role = 'superadmin'`, all others get `role = 'user'`

### Step 2: Account Information & KYC
- User enters: Date of Birth, SSN, Address, Employment Info
- User selects 1-3 account types (Checking, Savings, Business, Fixed Deposit)
- For each selected account type:
  - System generates unique 12-digit account number
  - System generates unique 16-digit Luhn-valid card number (Visa or Mastercard)
  - System generates expiration date (2-4 years from now)
  - System generates CVV
  - Creates account and card records in database
- Updates user profile with `signup_step = 3`

### Step 3: Financial & Verification
- User uploads: Driver's License Front, Driver's License Back
- User optionally enters: Credit Score
- Uploads documents to Supabase Storage
- Updates user profile with `signup_complete = true` and `account_status = 'active'`
- Redirects based on role:
  - Super Admin / Admin → `/admin`
  - Regular User → `/dashboard`

## Progress Saving
- Each step saves progress automatically
- If user logs in with incomplete signup, they're redirected to `/signup` to continue
- Saved data is automatically loaded when resuming

## Admin Detection Logic
The first user to sign up automatically becomes SUPER ADMIN. This is handled by a database trigger:
```sql
CREATE TRIGGER trigger_check_first_user
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_first_user();
```

## Account & Card Generation
When user selects account types in Step 2:
- Unique 12-digit account numbers are generated
- Luhn-valid card numbers are generated (Visa or Mastercard)
- Cards are automatically linked to accounts
- All data is stored in `accounts` and `cards` tables

## Redirect Logic
- **Login**: Checks `signup_complete` - if false, redirects to `/signup`
- **After Step 3**: 
  - Super Admin / Admin → `/admin`
  - Regular User → `/dashboard`

## File Structure
- `app/signup/page.tsx` - Main signup page with all 3 steps
- `database_multi_step_signup.sql` - Database schema and functions
- `database_storage_setup.sql` - Storage bucket setup

## Testing Checklist
- [ ] First user signup becomes superadmin
- [ ] Second user signup becomes regular user
- [ ] Step 1 creates auth account and profile
- [ ] Step 2 generates accounts and cards for selected types
- [ ] Step 3 uploads documents and completes signup
- [ ] Incomplete signup can be resumed
- [ ] Redirects work correctly based on role
- [ ] Login redirects incomplete signups to /signup

## Notes
- Card numbers are generated using Luhn algorithm for validity
- Account numbers are 12 digits, unique
- Documents are stored in Supabase Storage with proper RLS policies
- All signup data is validated before proceeding to next step

