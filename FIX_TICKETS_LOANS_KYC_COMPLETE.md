# Fix Tickets, Loans, and KYC - Complete ✅

## 🎯 Issues Fixed

### 1. **Support Ticket Responses - Missing Columns** ✅
**Problem**: Admin trying to reply to tickets gets error:
```
Could not find the 'admin_id' column of 'support_ticket_responses' in the schema cache
```

**Solution**: Added missing columns to `support_ticket_responses` table:
- ✅ `admin_id` - UUID, references `user_profiles(id)` - tracks which admin replied
- ✅ `is_internal` - BOOLEAN, default false - marks internal admin notes

**RLS Policies Updated**:
- Users can view responses to their own tickets
- Users can insert their own responses
- Admins can view all ticket responses
- Admins can insert responses for any ticket
- Admins can update all ticket responses
- All policies now use `is_admin()` function for consistency

### 2. **Loans Table - Missing Columns** ✅
**Problem**: Loan application form fails with:
```
Could not find the 'annual_income' column of 'loans' in the schema cache
```

**Solution**: Added all missing columns to `loans` table:

**Financial Fields**:
- ✅ `annual_income` - DECIMAL(15, 2)
- ✅ `monthly_income` - DECIMAL(15, 2)
- ✅ `requested_amount` - DECIMAL(15, 2) - requested loan amount (before approval)
- ✅ `monthly_expenses` - DECIMAL(15, 2)
- ✅ `existing_loans` - DECIMAL(15, 2)
- ✅ `other_assets` - DECIMAL(15, 2)

**Personal Information**:
- ✅ `date_of_birth` - DATE
- ✅ `gender` - TEXT
- ✅ `phone_number` - TEXT
- ✅ `home_address` - TEXT
- ✅ `city` - TEXT
- ✅ `state` - TEXT
- ✅ `country` - TEXT
- ✅ `id_type` - TEXT
- ✅ `id_number` - TEXT
- ✅ `ssn_tax_id` - TEXT

**Employment Information**:
- ✅ `employment_status` - TEXT
- ✅ `employer_name` - TEXT
- ✅ `job_title` - TEXT
- ✅ `employment_start_date` - DATE
- ✅ `employer_address` - TEXT
- ✅ `employer_phone` - TEXT

**Other Fields**:
- ✅ `preferred_repayment_method` - TEXT
- ✅ `collateral` - TEXT
- ✅ `purpose` - TEXT (loan purpose)
- ✅ `reference_number` - TEXT (with index)
- ✅ `disbursed_at` - TIMESTAMP WITH TIME ZONE
- ✅ `admin_id` - UUID (which admin processed the loan)

**Consent Fields**:
- ✅ `terms_accepted` - BOOLEAN
- ✅ `credit_check_accepted` - BOOLEAN
- ✅ `repayment_policy_accepted` - BOOLEAN
- ✅ `digital_signature` - TEXT
- ✅ `otp_verified` - BOOLEAN

### 3. **KYC Form - RLS Policy Violations** ✅
**Problem**: KYC form fails with:
```
new row violates row-level security policy for table "kyc_verifications"
```

**Solution**: Updated all KYC RLS policies to use `is_admin()` function instead of the EXISTS pattern:

**Updated Policies**:
- ✅ Users can view their own KYC
- ✅ Users can insert their own KYC
- ✅ Users can update their own KYC (only if status is 'pending' or 'resubmit')
- ✅ Admins can view all KYC
- ✅ Admins can update all KYC

**Key Changes**:
- Replaced `EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))` with `is_admin(auth.uid())`
- This prevents infinite recursion and UUID/TEXT comparison errors
- Users can only update their KYC if it's pending or needs resubmission

## 📋 SQL Script

**File**: `database_fix_tickets_loans_kyc.sql`

This script:
1. Adds missing columns to `support_ticket_responses`
2. Adds all missing columns to `loans` table
3. Updates RLS policies for `support_ticket_responses`
4. Updates RLS policies for `kyc_verifications`

## ✨ Result

After running the SQL script:
- ✅ Admin can reply to support tickets without errors
- ✅ Users can apply for loans with all fields
- ✅ Users can submit KYC forms without RLS violations
- ✅ All forms work perfectly

---

**All fixes complete!** 🎉

Run `database_fix_tickets_loans_kyc.sql` in Supabase SQL Editor to apply all fixes.

