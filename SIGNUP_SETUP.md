# Signup System Setup Guide

## ✅ What's Been Created

### 1. **Signup Page** (`app/signup/page.tsx`)
- **Step 1**: Basic information (First name, Last name, Email, Phone, Password)
- **Step 2**: KYC & Account information (DOB, Address, Employment, Account Type)
- Beautiful, responsive UI with progress indicator
- Form validation
- Error handling

### 2. **Supabase Client** (`lib/supabase.ts`)
- Configured Supabase client
- Helper functions for user management

### 3. **Database Schema** (`DATABASE_SCHEMA.md`)
- Complete SQL schema for all required tables
- Row Level Security (RLS) policies
- Automatic triggers for `updated_at` timestamps

## 🚀 Setup Steps

### Step 1: Install Dependencies

Already done! ✅
- `@supabase/supabase-js` installed

### Step 2: Create Supabase Project

1. Go to https://supabase.com
2. Create a free account
3. Click "New Project"
4. Fill in project details:
   - **Name**: Liberty International Bank
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to you
5. Wait for project to be created (~2 minutes)

### Step 3: Get API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### Step 4: Set Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: 
- Replace `your_project_url_here` with your actual Project URL
- Replace `your_anon_key_here` with your actual anon key
- Do NOT commit `.env.local` to git (it's in `.gitignore`)

### Step 5: Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Open `DATABASE_SCHEMA.md`
3. Copy and run each SQL block in order:
   - First: All `CREATE TABLE` statements
   - Second: All `CREATE INDEX` statements
   - Third: Enable RLS with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
   - Fourth: Create RLS policies
   - Fifth: Create trigger functions

**Or** you can create a single SQL file and run it all at once.

### Step 6: Test Registration

1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:3000/signup`
3. Fill out the form:
   - Step 1: Enter basic information
   - Step 2: Complete KYC information
4. Submit registration
5. Check Supabase dashboard → **Authentication** → **Users** to see the new user
6. Check **Table Editor** → `user_profiles` to see the profile
7. Check **Table Editor** → `accounts` to see created accounts

## 🔐 How It Works

### First User = Superadmin

The system automatically checks if a registered user is the first user:

```typescript
const isFirstUser = await checkIfFirstUser()
```

- If `user_profiles` table is empty → First user becomes `superadmin`
- All subsequent users are `user` role by default

### Redirect Logic

After successful registration:
- **Superadmin** → Redirected to `/admin`
- **Regular Users** → Redirected to `/dashboard`

### What Gets Created

1. **Supabase Auth User** (handled by Supabase)
2. **User Profile** in `user_profiles` table with:
   - Personal information
   - Address
   - Employment info
   - Role (superadmin or user)
   - KYC status (defaults to 'pending')

3. **Bank Accounts** in `accounts` table:
   - Based on user's selection (checking, savings, or both)
   - Starting balance: $0.00
   - Unique 10-digit account numbers

## 📋 Admin Features

### View New Registrations

Admin can view new users in `/admin/users` page (already created).

### Fund User Accounts

Admin can fund user accounts from `/admin/users` page:
1. Click on a user
2. Click "Fund Account"
3. Select account type (checking, savings, business)
4. Enter amount
5. Submit

This will:
- Update account balance in `accounts` table
- Create a transaction record in `transactions` table
- Log the action in `admin_actions` table (for audit)

## 🔄 Next Steps

After setup, you may want to:

1. **Create Login Page** (`app/login/page.tsx`)
   - Email/password login
   - Redirect based on role

2. **Protect Routes**
   - Middleware to check authentication
   - Redirect unauthenticated users to login

3. **Admin Dashboard Integration**
   - Fetch real user count from database
   - Show pending registrations
   - Display real-time stats

4. **Email Verification** (optional)
   - Enable email confirmation in Supabase
   - Send verification emails

## 🐛 Troubleshooting

### Error: "Supabase environment variables are not set"
- Make sure `.env.local` exists in project root
- Check that variable names match exactly
- Restart your dev server after creating `.env.local`

### Error: "relation does not exist"
- Tables haven't been created yet
- Run SQL from `DATABASE_SCHEMA.md` in Supabase SQL Editor

### Error: "permission denied"
- RLS policies might be blocking access
- Check RLS policies in `DATABASE_SCHEMA.md`
- Temporarily disable RLS for testing: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

### Registration succeeds but no redirect
- Check browser console for errors
- Verify user was created in Supabase dashboard
- Check if role was set correctly in `user_profiles` table

## 📝 Notes

- **SSN**: Currently stored as plain text. In production, encrypt this field.
- **Card Numbers/CVV**: Should be encrypted in production.
- **Password**: Supabase handles password hashing automatically.
- **KYC Status**: New users start with 'pending'. Admin must approve in `/admin/kyc`.

---

**Ready to test!** 🚀

Once you've completed the setup steps, navigate to `/signup` and create your first account (superadmin).




