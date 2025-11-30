-- ============================================
-- COMPLETE DATABASE SETUP FOR LIBERTY BANK
-- ============================================
-- Run this ENTIRE script in Supabase SQL Editor
-- This sets up EVERYTHING needed for all user-side and admin features
-- ============================================

-- ============================================
-- STEP 1: CREATE USER_PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  username TEXT UNIQUE,
  phone TEXT,
  
  -- Personal Information
  date_of_birth DATE,
  ssn TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
  marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'separated')),
  nationality TEXT,
  
  -- Address Information
  address TEXT,
  address_line_2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'United States',
  
  -- Employment Information
  employment_status TEXT CHECK (employment_status IN ('employed', 'self-employed', 'unemployed', 'student', 'retired', 'other')),
  employer_name TEXT,
  job_title TEXT,
  employment_years INTEGER,
  annual_income DECIMAL(15, 2),
  monthly_income DECIMAL(15, 2),
  
  -- Financial Information
  credit_score INTEGER,
  total_assets DECIMAL(15, 2),
  monthly_expenses DECIMAL(15, 2),
  
  -- Security Questions
  security_question_1 TEXT,
  security_answer_1 TEXT,
  security_question_2 TEXT,
  security_answer_2 TEXT,
  security_question_3 TEXT,
  security_answer_3 TEXT,
  
  -- Additional Information
  preferred_language TEXT DEFAULT 'en',
  referral_source TEXT,
  marketing_consent BOOLEAN DEFAULT false,
  
  -- Role & Status
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'frozen', 'deleted', 'pending', 'not_submitted')),
  freeze_reason TEXT,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected', 'resubmit')),
  
  -- Signup Tracking
  signup_step INTEGER DEFAULT 1 CHECK (signup_step BETWEEN 1 AND 6),
  signup_complete BOOLEAN DEFAULT false,
  
  -- Documents
  driver_license_front_url TEXT,
  driver_license_back_url TEXT,
  id_document_url TEXT,
  proof_of_address_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_status ON user_profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_signup_step ON user_profiles(signup_step);
CREATE INDEX IF NOT EXISTS idx_user_profiles_signup_complete ON user_profiles(signup_complete);

-- ============================================
-- STEP 2: CREATE ACCOUNTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'business', 'fixed-deposit', 'investment')),
  account_number TEXT NOT NULL UNIQUE,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  last4 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for accounts
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_accounts_account_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);

-- ============================================
-- STEP 3: CREATE CARDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  card_number TEXT NOT NULL UNIQUE,
  cardholder_name TEXT NOT NULL,
  -- Support both formats for compatibility
  expiry_month INTEGER CHECK (expiry_month BETWEEN 1 AND 12),
  expiry_year INTEGER CHECK (expiry_year >= 2024),
  expiration_month TEXT,
  expiration_year TEXT,
  cvv TEXT NOT NULL,
  card_type TEXT DEFAULT 'debit' CHECK (card_type IN ('debit', 'credit')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'frozen', 'cancelled', 'expired')),
  last4 TEXT,
  brand TEXT,
  card_network TEXT CHECK (card_network IN ('visa', 'mastercard', 'amex')),
  billing_address TEXT,
  is_virtual BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE,
  account_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for cards
CREATE INDEX IF NOT EXISTS idx_cards_account_id ON cards(account_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_card_number ON cards(card_number);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);

-- ============================================
-- STEP 4: CREATE TRANSACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'transfer', 'deposit', 'withdrawal', 'fee', 'refund')),
  category TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  merchant TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  pending BOOLEAN DEFAULT false,
  reference_number TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- ============================================
-- STEP 5: CREATE CARD_TRANSACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  merchant_name TEXT,
  location TEXT,
  reference_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for card_transactions
CREATE INDEX IF NOT EXISTS idx_card_transactions_card_id ON card_transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_user_id ON card_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_account_id ON card_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_created_at ON card_transactions(created_at DESC);

-- ============================================
-- STEP 6: CREATE CRYPTO_PORTFOLIO TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS crypto_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  funded_amount DECIMAL(15, 2) DEFAULT 0.00,
  crypto_balance DECIMAL(18, 8) DEFAULT 0.00000000,
  crypto_balance_value_usd DECIMAL(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for crypto_portfolio
CREATE INDEX IF NOT EXISTS idx_crypto_portfolio_user_id ON crypto_portfolio(user_id);

-- ============================================
-- STEP 7: CREATE CRYPTO_TRANSACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS crypto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  crypto_type TEXT DEFAULT 'BTC',
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  amount_usd DECIMAL(15, 2) NOT NULL,
  amount_crypto DECIMAL(18, 8) NOT NULL,
  crypto_price DECIMAL(15, 2) NOT NULL,
  fee DECIMAL(15, 2) DEFAULT 0.00,
  reference_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for crypto_transactions
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_user_id ON crypto_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_account_id ON crypto_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_created_at ON crypto_transactions(created_at DESC);

-- ============================================
-- STEP 8: CREATE LOANS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('personal', 'auto', 'home', 'student', 'business')),
  amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  term_months INTEGER NOT NULL,
  monthly_payment DECIMAL(15, 2) NOT NULL,
  balance DECIMAL(15, 2) NOT NULL,
  original_amount DECIMAL(15, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted')),
  next_payment_date DATE,
  payments_remaining INTEGER,
  admin_notes TEXT,
  loan_purpose TEXT,
  application_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for loans
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_loan_type ON loans(loan_type);

-- ============================================
-- STEP 9: CREATE LOAN_PAYMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  payment_amount DECIMAL(15, 2) NOT NULL,
  principal_amount DECIMAL(15, 2) NOT NULL,
  interest_amount DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'partial')),
  reference_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for loan_payments
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_user_id ON loan_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_status ON loan_payments(status);

-- ============================================
-- STEP 10: CREATE BILLS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  bill_name TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  due_date DATE NOT NULL,
  bill_logo_url TEXT,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  auto_pay_enabled BOOLEAN DEFAULT false,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bills
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);

-- ============================================
-- STEP 11: CREATE BILL_PAYMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  payment_amount DECIMAL(15, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reference_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bill_payments
CREATE INDEX IF NOT EXISTS idx_bill_payments_bill_id ON bill_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_payments_user_id ON bill_payments(user_id);

-- ============================================
-- STEP 12: CREATE MOBILE_DEPOSITS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS mobile_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  deposit_id TEXT NOT NULL UNIQUE,
  amount DECIMAL(15, 2) NOT NULL,
  front_image_url TEXT,
  back_image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  admin_id UUID REFERENCES user_profiles(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for mobile_deposits
CREATE INDEX IF NOT EXISTS idx_mobile_deposits_user_id ON mobile_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_deposits_status ON mobile_deposits(status);
CREATE INDEX IF NOT EXISTS idx_mobile_deposits_deposit_id ON mobile_deposits(deposit_id);

-- ============================================
-- STEP 13: CREATE SUPPORT_TICKETS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for support_tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_id ON support_tickets(ticket_id);

-- ============================================
-- STEP 14: CREATE SUPPORT_TICKET_RESPONSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS support_ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for support_ticket_responses
CREATE INDEX IF NOT EXISTS idx_support_ticket_responses_ticket_id ON support_ticket_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_responses_user_id ON support_ticket_responses(user_id);

-- ============================================
-- STEP 15: CREATE NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- STEP 16: CREATE SAVED_RECIPIENTS TABLE (P2P)
-- ============================================

CREATE TABLE IF NOT EXISTS saved_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_phone TEXT,
  recipient_name TEXT,
  recipient_profile_picture TEXT,
  last_account_type TEXT,
  last_transferred_at TIMESTAMP WITH TIME ZONE,
  total_transactions INTEGER DEFAULT 0,
  total_amount DECIMAL(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for saved_recipients
CREATE INDEX IF NOT EXISTS idx_saved_recipients_user_id ON saved_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipients_recipient_email ON saved_recipients(recipient_email);

-- ============================================
-- STEP 17: CREATE APP_SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name TEXT DEFAULT 'Liberty National Bank',
  app_logo TEXT,
  app_logo_light TEXT,
  app_logo_dark TEXT,
  footer_logo_light TEXT,
  footer_logo_dark TEXT,
  app_favicon TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_address TEXT,
  social_facebook_url TEXT,
  social_twitter_url TEXT,
  social_instagram_url TEXT,
  social_linkedin_url TEXT,
  support_email TEXT,
  support_phone TEXT,
  support_hours TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  currency TEXT DEFAULT 'USD',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id)
);

-- Insert default app settings if not exists
INSERT INTO app_settings (id)
VALUES (gen_random_uuid())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 18: ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 19: CREATE HELPER FUNCTION FOR ADMIN CHECK (MUST BE BEFORE POLICIES)
-- ============================================
-- This function bypasses RLS to check if a user is admin
-- Prevents infinite recursion and UUID/TEXT comparison issues

CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Bypasses RLS, so no infinite recursion
  SELECT role INTO user_role
  FROM user_profiles
  WHERE id = check_user_id;
  
  RETURN COALESCE(user_role IN ('admin', 'superadmin'), false);
END;
$$;

-- ============================================
-- STEP 20: CREATE RLS POLICIES FOR USER_PROFILES
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin policies using is_admin() helper function
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================
-- STEP 21: CREATE RLS POLICIES FOR ACCOUNTS
-- ============================================

DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update all accounts" ON accounts;

CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin policies using is_admin() helper function
CREATE POLICY "Admins can view all accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================
-- STEP 22: CREATE RLS POLICIES FOR CARDS
-- ============================================

DROP POLICY IF EXISTS "Users can view own cards" ON cards;
DROP POLICY IF EXISTS "Users can insert own cards" ON cards;
DROP POLICY IF EXISTS "Users can update own cards" ON cards;
DROP POLICY IF EXISTS "Admins can view all cards" ON cards;
DROP POLICY IF EXISTS "Admins can update all cards" ON cards;

CREATE POLICY "Users can view own cards"
  ON cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards"
  ON cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin policies using is_admin() helper function
CREATE POLICY "Admins can view all cards"
  ON cards FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all cards"
  ON cards FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================
-- STEP 23: CREATE RLS POLICIES FOR TRANSACTIONS
-- ============================================

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can insert transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin policies using is_admin() helper function
CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- STEP 24: CREATE RLS POLICIES FOR OTHER TABLES
-- ============================================

-- Card Transactions
DROP POLICY IF EXISTS "Users can view own card transactions" ON card_transactions;
CREATE POLICY "Users can view own card transactions"
  ON card_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Crypto Portfolio
DROP POLICY IF EXISTS "Users can manage own crypto portfolio" ON crypto_portfolio;
CREATE POLICY "Users can manage own crypto portfolio"
  ON crypto_portfolio FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Crypto Transactions
DROP POLICY IF EXISTS "Users can view own crypto transactions" ON crypto_transactions;
CREATE POLICY "Users can view own crypto transactions"
  ON crypto_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own crypto transactions" ON crypto_transactions;
CREATE POLICY "Users can insert own crypto transactions"
  ON crypto_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Loans
DROP POLICY IF EXISTS "Users can manage own loans" ON loans;
CREATE POLICY "Users can manage own loans"
  ON loans FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin policies using is_admin() helper function
DROP POLICY IF EXISTS "Admins can view all loans" ON loans;
CREATE POLICY "Admins can view all loans"
  ON loans FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Loan Payments
DROP POLICY IF EXISTS "Users can view own loan payments" ON loan_payments;
CREATE POLICY "Users can view own loan payments"
  ON loan_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Bills
DROP POLICY IF EXISTS "Users can manage own bills" ON bills;
CREATE POLICY "Users can manage own bills"
  ON bills FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bill Payments
DROP POLICY IF EXISTS "Users can view own bill payments" ON bill_payments;
CREATE POLICY "Users can view own bill payments"
  ON bill_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bill payments" ON bill_payments;
CREATE POLICY "Users can insert own bill payments"
  ON bill_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Mobile Deposits
DROP POLICY IF EXISTS "Users can manage own mobile deposits" ON mobile_deposits;
CREATE POLICY "Users can manage own mobile deposits"
  ON mobile_deposits FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin policies using is_admin() helper function
DROP POLICY IF EXISTS "Admins can view all mobile deposits" ON mobile_deposits;
CREATE POLICY "Admins can view all mobile deposits"
  ON mobile_deposits FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update mobile deposits" ON mobile_deposits;
CREATE POLICY "Admins can update mobile deposits"
  ON mobile_deposits FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Support Tickets
DROP POLICY IF EXISTS "Users can manage own support tickets" ON support_tickets;
CREATE POLICY "Users can manage own support tickets"
  ON support_tickets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin policies using is_admin() helper function
DROP POLICY IF EXISTS "Admins can view all support tickets" ON support_tickets;
CREATE POLICY "Admins can view all support tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all support tickets" ON support_tickets;
CREATE POLICY "Admins can update all support tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Support Ticket Responses
DROP POLICY IF EXISTS "Users can view own ticket responses" ON support_ticket_responses;
CREATE POLICY "Users can view own ticket responses"
  ON support_ticket_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = support_ticket_responses.ticket_id
      AND st.user_id = auth.uid()
    )
    OR support_ticket_responses.user_id = auth.uid()
    OR is_admin(auth.uid())
  );

-- Admin check using is_admin() helper function
DROP POLICY IF EXISTS "Users can insert ticket responses" ON support_ticket_responses;
CREATE POLICY "Users can insert ticket responses"
  ON support_ticket_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR is_admin(auth.uid())
  );

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Saved Recipients
DROP POLICY IF EXISTS "Users can manage own saved recipients" ON saved_recipients;
CREATE POLICY "Users can manage own saved recipients"
  ON saved_recipients FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- App Settings (Read by all authenticated users, write by admins only)
DROP POLICY IF EXISTS "Authenticated users can view app settings" ON app_settings;
CREATE POLICY "Authenticated users can view app settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (true);

-- Admin policy using is_admin() helper function
DROP POLICY IF EXISTS "Admins can update app settings" ON app_settings;
CREATE POLICY "Admins can update app settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================
-- STEP 25: CREATE FUNCTION TO UPDATE UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on all tables that have it
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crypto_portfolio_updated_at ON crypto_portfolio;
CREATE TRIGGER update_crypto_portfolio_updated_at
  BEFORE UPDATE ON crypto_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_loans_updated_at ON loans;
CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bills_updated_at ON bills;
CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mobile_deposits_updated_at ON mobile_deposits;
CREATE TRIGGER update_mobile_deposits_updated_at
  BEFORE UPDATE ON mobile_deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_recipients_updated_at ON saved_recipients;
CREATE TRIGGER update_saved_recipients_updated_at
  BEFORE UPDATE ON saved_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 26: CREATE FUNCTION TO SYNC CARD EXPIRATION FIELDS
-- ============================================

CREATE OR REPLACE FUNCTION sync_card_expiration_fields()
RETURNS TRIGGER AS $$
DECLARE
  year_int INTEGER;
BEGIN
  -- Sync expiry_month/expiry_year to expiration_month/expiration_year (TEXT format)
  IF NEW.expiry_month IS NOT NULL AND NEW.expiration_month IS NULL THEN
    NEW.expiration_month := LPAD(NEW.expiry_month::TEXT, 2, '0');
  END IF;
  
  IF NEW.expiry_year IS NOT NULL AND NEW.expiration_year IS NULL THEN
    -- Convert full year (e.g., 2026) to 2-digit year (e.g., '26')
    NEW.expiration_year := LPAD((NEW.expiry_year % 100)::TEXT, 2, '0');
  END IF;
  
  -- Sync expiration_month/expiration_year to expiry_month/expiry_year (INTEGER format)
  IF NEW.expiration_month IS NOT NULL AND NEW.expiry_month IS NULL THEN
    NEW.expiry_month := NEW.expiration_month::INTEGER;
  END IF;
  
  IF NEW.expiration_year IS NOT NULL AND NEW.expiry_year IS NULL THEN
    -- Convert 2-digit year (e.g., '26') to full year (e.g., 2026)
    year_int := NEW.expiration_year::INTEGER;
    IF year_int < 50 THEN
      NEW.expiry_year := 2000 + year_int;
    ELSE
      NEW.expiry_year := 1900 + year_int;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_card_expiration ON cards;
CREATE TRIGGER trigger_sync_card_expiration
  BEFORE INSERT OR UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION sync_card_expiration_fields();

-- ============================================
-- STEP 27: CREATE FUNCTION FOR FIRST USER AS SUPERADMIN
-- ============================================

CREATE OR REPLACE FUNCTION check_first_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user
  IF (SELECT COUNT(*) FROM user_profiles) = 1 THEN
    NEW.role = 'superadmin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_check_first_user ON user_profiles;
CREATE TRIGGER trigger_check_first_user
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_first_user();

-- ============================================
-- COMPLETE!
-- ============================================
-- All tables, indexes, RLS policies, and triggers have been created
-- Your database is now ready for all user-side and admin features!
