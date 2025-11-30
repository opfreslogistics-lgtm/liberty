-- Add missing document URL columns to loans table
-- This fixes the "Could not find the 'bank_statement_urls' column" error

DO $$ 
BEGIN
  -- Add id_front_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'id_front_url'
  ) THEN
    ALTER TABLE loans ADD COLUMN id_front_url TEXT;
  END IF;

  -- Add id_back_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'id_back_url'
  ) THEN
    ALTER TABLE loans ADD COLUMN id_back_url TEXT;
  END IF;

  -- Add payslip_urls column (JSONB array to store multiple payslip URLs)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'payslip_urls'
  ) THEN
    ALTER TABLE loans ADD COLUMN payslip_urls JSONB;
  END IF;

  -- Add bank_statement_urls column (JSONB array to store multiple bank statement URLs)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'bank_statement_urls'
  ) THEN
    ALTER TABLE loans ADD COLUMN bank_statement_urls JSONB;
  END IF;

  -- Add utility_bill_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'utility_bill_url'
  ) THEN
    ALTER TABLE loans ADD COLUMN utility_bill_url TEXT;
  END IF;

  -- Add business_registration_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'business_registration_url'
  ) THEN
    ALTER TABLE loans ADD COLUMN business_registration_url TEXT;
  END IF;

  -- Add passport_photo_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'passport_photo_url'
  ) THEN
    ALTER TABLE loans ADD COLUMN passport_photo_url TEXT;
  END IF;
END $$;

-- Create index for faster document queries (optional)
CREATE INDEX IF NOT EXISTS idx_loans_documents ON loans(id_front_url, id_back_url) WHERE id_front_url IS NOT NULL;

