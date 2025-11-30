/**
 * Account Number Generation Utility
 * Generates unique 12-digit account numbers for bank accounts
 */

import { supabase } from '@/lib/supabase'

/**
 * Generate a unique 12-digit account number
 * Format: 100 + 9 random digits = 100XXXXXXXXX
 */
export async function generateUniqueAccountNumber(): Promise<string> {
  const BANK_CODE = '100'
  const maxAttempts = 100
  let attempts = 0

  while (attempts < maxAttempts) {
    // Generate 9 random digits
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString()
    const accountNumber = BANK_CODE + randomDigits

    // Check if account number already exists
    const { data: existingAccount } = await supabase
      .from('accounts')
      .select('account_number')
      .eq('account_number', accountNumber)
      .maybeSingle()

    if (!existingAccount) {
      return accountNumber
    }

    attempts++
  }

  throw new Error('Failed to generate unique account number after multiple attempts')
}

/**
 * Generate account number and return with last 4 digits
 */
export async function generateAccountWithLast4(): Promise<{
  accountNumber: string
  last4: string
}> {
  const accountNumber = await generateUniqueAccountNumber()
  const last4 = accountNumber.slice(-4)
  
  return {
    accountNumber,
    last4,
  }
}

