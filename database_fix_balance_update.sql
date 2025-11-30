-- ============================================
-- FIX BALANCE UPDATE SYSTEM
-- ============================================
-- This ensures account balances are properly updated when transactions are created
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: DROP AND RECREATE BALANCE UPDATE TRIGGER WITH PROPER TYPE HANDLING
-- ============================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS trigger_update_balance_on_transaction ON transactions;
DROP FUNCTION IF EXISTS update_account_balance_on_transaction();

-- Create improved balance update function with proper DECIMAL handling
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
    
    -- Convert transaction amount to DECIMAL (handle both string and numeric)
    transaction_amount := COALESCE(
      CASE 
        WHEN NEW.amount IS NULL THEN 0::DECIMAL(15, 2)
        WHEN pg_typeof(NEW.amount)::text = 'numeric' THEN NEW.amount::DECIMAL(15, 2)
        ELSE NEW.amount::text::DECIMAL(15, 2)
      END,
      0::DECIMAL(15, 2)
    );
    
    -- Get current account balance (handle DECIMAL properly)
    SELECT COALESCE(balance, 0::DECIMAL(15, 2)) INTO account_balance
    FROM accounts
    WHERE id = NEW.account_id
    FOR UPDATE; -- Lock row to prevent race conditions
    
    -- Calculate new balance based on transaction type
    IF NEW.type = 'credit' THEN
      new_balance := account_balance + transaction_amount;
    ELSIF NEW.type = 'debit' THEN
      new_balance := account_balance - transaction_amount;
    ELSE
      -- For transfer or other types, don't change balance here
      RETURN NEW;
    END IF;
    
    -- Ensure balance doesn't go negative (optional - remove if you allow overdraft)
    IF new_balance < 0 THEN
      new_balance := 0::DECIMAL(15, 2);
    END IF;
    
    -- Update account balance with proper DECIMAL handling
    UPDATE accounts
    SET balance = new_balance,
        updated_at = NOW()
    WHERE id = NEW.account_id;
    
    -- Log the update (optional - for debugging)
    RAISE NOTICE 'Updated account % balance: % -> % (transaction: %, amount: %)', 
      NEW.account_id, account_balance, new_balance, NEW.id, transaction_amount;
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
-- STEP 2: SYNC ALL EXISTING BALANCES FROM TRANSACTIONS
-- ============================================
-- This recalculates all account balances from transaction history

CREATE OR REPLACE FUNCTION sync_all_account_balances_from_transactions()
RETURNS void AS $$
DECLARE
  account_record RECORD;
  calculated_balance DECIMAL(15, 2);
BEGIN
  FOR account_record IN SELECT id FROM accounts WHERE status = 'active' LOOP
    -- Calculate balance from all completed transactions
    SELECT COALESCE(
      SUM(
        CASE 
          WHEN type = 'credit' AND status = 'completed' AND (pending IS NULL OR pending = false) THEN 
            COALESCE(amount::DECIMAL(15, 2), 0::DECIMAL(15, 2))
          WHEN type = 'debit' AND status = 'completed' AND (pending IS NULL OR pending = false) THEN 
            -COALESCE(amount::DECIMAL(15, 2), 0::DECIMAL(15, 2))
          ELSE 0::DECIMAL(15, 2)
        END
      ),
      0::DECIMAL(15, 2)
    ) INTO calculated_balance
    FROM transactions
    WHERE account_id = account_record.id;
    
    -- Update account balance
    UPDATE accounts
    SET balance = calculated_balance,
        updated_at = NOW()
    WHERE id = account_record.id;
    
    RAISE NOTICE 'Synced account % balance to %', account_record.id, calculated_balance;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync to fix any existing balance discrepancies
SELECT sync_all_account_balances_from_transactions();

-- ============================================
-- STEP 3: CREATE FUNCTION TO MANUALLY UPDATE BALANCE (FOR TESTING)
-- ============================================

CREATE OR REPLACE FUNCTION manual_update_account_balance(
  p_account_id UUID,
  p_transaction_type TEXT,
  p_amount DECIMAL(15, 2)
)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
  current_balance DECIMAL(15, 2);
  new_balance DECIMAL(15, 2);
BEGIN
  -- Get current balance
  SELECT COALESCE(balance, 0::DECIMAL(15, 2)) INTO current_balance
  FROM accounts
  WHERE id = p_account_id
  FOR UPDATE;
  
  -- Calculate new balance
  IF p_transaction_type = 'credit' THEN
    new_balance := current_balance + p_amount;
  ELSIF p_transaction_type = 'debit' THEN
    new_balance := current_balance - p_amount;
    IF new_balance < 0 THEN
      new_balance := 0::DECIMAL(15, 2);
    END IF;
  ELSE
    RETURN current_balance;
  END IF;
  
  -- Update balance
  UPDATE accounts
  SET balance = new_balance,
      updated_at = NOW()
  WHERE id = p_account_id;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if trigger exists:
-- SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_balance_on_transaction';

-- Check function exists:
-- SELECT routine_name FROM information_schema.routines WHERE routine_name = 'update_account_balance_on_transaction';

-- Test the trigger by checking recent transactions:
-- SELECT 
--   t.id,
--   t.account_id,
--   t.type,
--   t.amount,
--   t.status,
--   a.balance as account_balance,
--   t.created_at
-- FROM transactions t
-- LEFT JOIN accounts a ON a.id = t.account_id
-- WHERE t.created_at > NOW() - INTERVAL '1 hour'
-- ORDER BY t.created_at DESC
-- LIMIT 10;

-- ============================================
-- COMPLETE!
-- ============================================
-- The balance update system is now fixed and improved:
-- 1. Trigger properly handles DECIMAL types
-- 2. Row-level locking prevents race conditions
-- 3. All existing balances are synced from transactions
-- 4. Balance updates happen automatically when transactions are created

