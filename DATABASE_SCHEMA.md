# Supabase Database Schema for Liberty International Bank

## 📋 Required Tables

### 1. `user_profiles` (extends Supabase auth.users)

Stores user profile information and role management.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'United States',
  ssn TEXT, -- Should be encrypted in production
  employment_status TEXT,
  employer_name TEXT,
  annual_income DECIMAL(12, 2),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected', 'resubmit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_kyc_status ON user_profiles(kyc_status);
```

### 2. `accounts`

Stores bank accounts (checking, savings, business).

```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'business', 'fixed-deposit')),
  account_number TEXT NOT NULL UNIQUE,
  balance DECIMAL(15, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  last4 TEXT, -- Last 4 digits for display
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
```

### 3. `transactions`

Stores all financial transactions.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'transfer')),
  category TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  merchant TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  pending BOOLEAN DEFAULT false,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
```

### 4. `cards`

Stores debit/credit card information.

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  card_number TEXT NOT NULL, -- Should be encrypted in production
  cardholder_name TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL, -- Should be encrypted in production
  card_type TEXT DEFAULT 'debit' CHECK (card_type IN ('debit', 'credit')),
  frozen BOOLEAN DEFAULT false,
  online_enabled BOOLEAN DEFAULT true,
  atm_enabled BOOLEAN DEFAULT true,
  contactless_enabled BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'blocked', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_account_id ON cards(account_id);
```

### 5. `mobile_deposits`

Stores mobile cheque deposits (pending admin approval).

```sql
CREATE TABLE mobile_deposits (
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

-- Create indexes
CREATE INDEX idx_mobile_deposits_user_id ON mobile_deposits(user_id);
CREATE INDEX idx_mobile_deposits_status ON mobile_deposits(status);
CREATE INDEX idx_mobile_deposits_deposit_id ON mobile_deposits(deposit_id);
```

### 6. `admin_actions`

Audit log for all admin actions (funding, approvals, etc.).

```sql
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('fund_account', 'freeze_account', 'approve_kyc', 'approve_deposit', 'approve_loan', 'edit_user', 'other')),
  target_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  details JSONB, -- Flexible JSON for action-specific data
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_target_user_id ON admin_actions(target_user_id);
CREATE INDEX idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at DESC);
```

### 7. `loans`

Stores loan applications and active loans.

```sql
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('personal', 'auto', 'home', 'student')),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
```

### 8. `support_tickets`

Stores customer support tickets.

```sql
CREATE TABLE support_tickets (
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

-- Create indexes
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_ticket_id ON support_tickets(ticket_id);
```

## 🔐 Row Level Security (RLS) Policies

Enable RLS on all tables:

```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
```

### Example RLS Policies (customize as needed):

```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only see their own accounts
CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all accounts
CREATE POLICY "Admins can view all accounts"
  ON accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- Similar policies for other tables...
```

## 🔄 Automatic Functions

### Update `updated_at` timestamp:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mobile_deposits_updated_at BEFORE UPDATE ON mobile_deposits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 📝 Notes

1. **Security**: In production, encrypt sensitive fields like SSN, card numbers, and CVV.
2. **SSN**: Consider using a separate secure vault service for storing SSN.
3. **Account Numbers**: Generate unique account numbers with proper checksums.
4. **RLS**: Implement comprehensive Row Level Security policies before going to production.
5. **Indexes**: Add more indexes based on your query patterns.

## 🚀 Setup Instructions

### Quick Setup (Recommended)
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Open the file `database_schema.sql` in this project
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. All tables, indexes, RLS policies, and triggers will be created automatically

### Manual Setup (Alternative)
If you prefer to run statements individually:
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run each CREATE TABLE statement above
4. Run the RLS policy statements
5. Run the trigger functions
6. Test with a sample registration

**Note**: The file `database_schema.sql` contains all SQL statements without markdown syntax and is ready to execute directly.

