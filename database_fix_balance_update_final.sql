-- ============================================
-- FINAL FIX FOR BALANCE UPDATE SYSTEM
-- ============================================
-- Run this script to ensure balances update correctly when transactions are created
-- ============================================

-- ============================================
-- STEP 1: IMPROVE BALANCE UPDATE TRIGGER
-- ============================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS trigger_update_balance_on_transaction ON transactions;
DROP FUNCTION IF EXISTS update_account_balance_on_transaction();

-- Create improved balance update function with proper DECIMAL handling and row locking
CREATE OR REPLACE FUNCTION update_account_balance_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  account_balance DECIMAL(15, 2);
  transaction_amount DECIMAL(15, 2);
  new_balance DECIMAL(15, 2);
BEGIN
  -- Only process completed, non-pending transactions that have an account_id
  IF NEW.status = 'completed' 
     AND (NEW.pending IS NULL OR NEW.pending = false) 
     AND NEW.account_id IS NOT NULL THEN
    
    -- Convert transaction amount to DECIMAL (handle both string and numeric types)
    transaction_amount := COALESCE(
      CASE 
        WHEN NEW.amount IS NULL THEN 0::DECIMAL(15, 2)
        WHEN pg_typeof(NEW.amount)::text = 'numeric' OR pg_typeof(NEW.amount)::text = 'decimal' THEN 
          NEW.amount::DECIMAL(15, 2)
        ELSE 
          CAST(NEW.amount AS TEXT)::DECIMAL(15, 2)
      END,
      0::DECIMAL(15, 2)
    );
    
    -- Get current account balance with row lock to prevent race conditions
    SELECT COALESCE(balance, 0::DECIMAL(15, 2)) INTO account_balance
    FROM accounts
    WHERE id = NEW.account_id
    FOR UPDATE; -- Lock row to prevent concurrent updates
    
    -- Calculate new balance based on transaction type
    IF NEW.type = 'credit' THEN
      new_balance := account_balance + transaction_amount;
    ELSIF NEW.type = 'debit' THEN
      new_balance := account_balance - transaction_amount;
      -- Ensure balance doesn't go negative (optional - remove if you allow overdraft)
      IF new_balance < 0 THEN
        new_balance := 0::DECIMAL(15, 2);
      END IF;
    ELSE
      -- For transfer or other types, don't change balance here
      RETURN NEW;
    END IF;
    
    -- Update account balance
    UPDATE accounts
    SET balance = new_balance,
        updated_at = NOW()
    WHERE id = NEW.account_id;
    
    -- Log the update for debugging (optional)
    RAISE NOTICE 'Balance updated: Account % | Old: % | New: % | Transaction: %', 
      NEW.account_id, account_balance, new_balance, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for balance updates
CREATE TRIGGER trigger_update_balance_on_transaction
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance_on_transaction();

-- ============================================
-- STEP 2: SYNC ALL ACCOUNT BALANCES FROM TRANSACTIONS
-- ============================================
-- This recalculates all account balances from their transaction history

CREATE OR REPLACE FUNCTION sync_all_account_balances_from_transactions()
RETURNS TABLE(account_id UUID, old_balance DECIMAL(15,2), new_balance DECIMAL(15,2)) AS $$
DECLARE
  account_record RECORD;
  calculated_balance DECIMAL(15, 2);
  current_balance DECIMAL(15, 2);
BEGIN
  FOR account_record IN SELECT id, balance FROM accounts WHERE status = 'active' LOOP
    -- Get current balance
    current_balance := COALESCE(account_record.balance, 0::DECIMAL(15, 2));
    
    -- Calculate balance from all completed transactions
    SELECT COALESCE(
      SUM(
        CASE 
          WHEN t.type = 'credit' AND t.status = 'completed' AND (t.pending IS NULL OR t.pending = false) THEN 
            COALESCE(t.amount::DECIMAL(15, 2), 0::DECIMAL(15, 2))
          WHEN t.type = 'debit' AND t.status = 'completed' AND (t.pending IS NULL OR t.pending = false) THEN 
            -COALESCE(t.amount::DECIMAL(15, 2), 0::DECIMAL(15, 2))
          ELSE 0::DECIMAL(15, 2)
        END
      ),
      0::DECIMAL(15, 2)
    ) INTO calculated_balance
    FROM transactions t
    WHERE t.account_id = account_record.id;
    
    -- Update account balance
    UPDATE accounts
    SET balance = calculated_balance,
        updated_at = NOW()
    WHERE id = account_record.id;
    
    -- Return result for verification
    account_id := account_record.id;
    old_balance := current_balance;
    new_balance := calculated_balance;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync to fix any existing balance discrepancies
SELECT * FROM sync_all_account_balances_from_transactions();

-- ============================================
-- STEP 3: CREATE HELPER FUNCTION TO FORCE UPDATE BALANCE
-- ============================================
-- Use this if you need to manually update a balance

CREATE OR REPLACE FUNCTION force_update_account_balance(
  p_account_id UUID
)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
  calculated_balance DECIMAL(15, 2);
BEGIN
  -- Calculate balance from all completed transactions
  SELECT COALESCE(
    SUM(
      CASE 
        WHEN t.type = 'credit' AND t.status = 'completed' AND (t.pending IS NULL OR t.pending = false) THEN 
          COALESCE(t.amount::DECIMAL(15, 2), 0::DECIMAL(15, 2))
        WHEN t.type = 'debit' AND t.status = 'completed' AND (t.pending IS NULL OR t.pending = false) THEN 
          -COALESCE(t.amount::DECIMAL(15, 2), 0::DECIMAL(15, 2))
        ELSE 0::DECIMAL(15, 2)
      END
    ),
    0::DECIMAL(15, 2)
  ) INTO calculated_balance
  FROM transactions t
  WHERE t.account_id = p_account_id;
  
  -- Update account balance
  UPDATE accounts
  SET balance = calculated_balance,
      updated_at = NOW()
  WHERE id = p_account_id;
  
  RETURN calculated_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if trigger exists:
-- SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'trigger_update_balance_on_transaction';

-- Check function exists:
-- SELECT routine_name FROM information_schema.routines WHERE routine_name = 'update_account_balance_on_transaction';

-- Test balance calculation for a specific account:
-- SELECT force_update_account_balance('ACCOUNT_ID_HERE');

-- Check recent transactions and their account balances:
-- SELECT 
--   t.id as transaction_id,
--   t.account_id,
--   t.type,
--   t.amount,
--   t.status,
--   t.pending,
--   a.balance as account_balance,
--   a.account_type,
--   t.created_at
-- FROM transactions t
-- LEFT JOIN accounts a ON a.id = t.account_id
-- WHERE t.created_at > NOW() - INTERVAL '24 hours'
-- ORDER BY t.created_at DESC
-- LIMIT 20;

-- ============================================
-- COMPLETE!
-- ============================================
-- The balance update system is now fixed:
-- 1. Improved trigger with proper DECIMAL type handling
-- 2. Row-level locking to prevent race conditions
-- 3. All existing balances synced from transactions
-- 4. Helper function to manually fix balances if needed
-- 
-- When you create a transaction with:
-- - type: 'credit' or 'debit'
-- - status: 'completed'
-- - pending: false or NULL
-- 
-- The account balance will automatically update!

