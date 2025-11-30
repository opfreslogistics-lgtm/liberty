-- Add missing timestamp columns to loans table
-- This fixes the "Could not find the 'approved_at' column" error

DO $$ 
BEGIN
  -- Add approved_at column for tracking when loan was approved
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE loans ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    CREATE INDEX IF NOT EXISTS idx_loans_approved_at ON loans(approved_at DESC);
  END IF;

  -- Add declined_at column for tracking when loan was declined/rejected
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'declined_at'
  ) THEN
    ALTER TABLE loans ADD COLUMN declined_at TIMESTAMP WITH TIME ZONE;
    CREATE INDEX IF NOT EXISTS idx_loans_declined_at ON loans(declined_at DESC);
  END IF;

  -- Add disbursed_at column for tracking when loan was disbursed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'disbursed_at'
  ) THEN
    ALTER TABLE loans ADD COLUMN disbursed_at TIMESTAMP WITH TIME ZONE;
    CREATE INDEX IF NOT EXISTS idx_loans_disbursed_at ON loans(disbursed_at DESC);
  END IF;

  -- Add completed_at column for tracking when loan was completed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE loans ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    CREATE INDEX IF NOT EXISTS idx_loans_completed_at ON loans(completed_at DESC);
  END IF;

  -- Also ensure balance_remaining and total_paid columns exist (used by admin page)
  -- Note: The loans table already has a 'balance' column, but balance_remaining is used for tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'balance_remaining'
  ) THEN
    ALTER TABLE loans ADD COLUMN balance_remaining DECIMAL(15, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'total_paid'
  ) THEN
    ALTER TABLE loans ADD COLUMN total_paid DECIMAL(15, 2) DEFAULT 0;
  END IF;

  -- Add decline_reason column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'decline_reason'
  ) THEN
    ALTER TABLE loans ADD COLUMN decline_reason TEXT;
  END IF;

END $$;

-- Initialize balance_remaining from balance column for existing loans
UPDATE loans 
SET balance_remaining = balance 
WHERE balance_remaining IS NULL AND balance IS NOT NULL;

-- Add comments to document the columns
COMMENT ON COLUMN loans.approved_at IS 'Timestamp when the loan was approved by an admin';
COMMENT ON COLUMN loans.declined_at IS 'Timestamp when the loan was declined/rejected';
COMMENT ON COLUMN loans.disbursed_at IS 'Timestamp when the loan funds were disbursed to the user';
COMMENT ON COLUMN loans.completed_at IS 'Timestamp when the loan was fully paid and completed';
COMMENT ON COLUMN loans.balance_remaining IS 'Remaining balance on the loan';
COMMENT ON COLUMN loans.total_paid IS 'Total amount paid towards the loan';

