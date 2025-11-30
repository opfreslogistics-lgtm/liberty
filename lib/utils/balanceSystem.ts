/**
 * NEW BALANCE SYSTEM UTILITIES
 * 
 * This module provides functions to work with the new transaction-based balance system
 * where balances are automatically maintained by database triggers
 */

import { supabase } from '@/lib/supabase'

export interface BalanceUpdateResult {
  success: boolean
  newBalance?: number
  error?: string
}

/**
 * Create a transaction and let the database trigger handle balance updates
 * This is the recommended way to update balances
 */
export async function createTransactionAndUpdateBalance(
  userId: string,
  accountId: string,
  type: 'credit' | 'debit' | 'transfer',
  amount: number,
  category: string,
  description: string,
  options?: {
    status?: 'pending' | 'completed' | 'failed' | 'cancelled'
    pending?: boolean
    merchant?: string
  }
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        account_id: accountId,
        type,
        category,
        amount: amount.toString(),
        description,
        status: options?.status || 'completed',
        pending: options?.pending || false,
        merchant: options?.merchant || null,
        date: new Date().toISOString(),
      }])
      .select('id')
      .single()

    if (error) {
      console.error('[Balance System] Error creating transaction:', error)
      return { success: false, error: error.message }
    }

    // The database trigger will automatically update the account balance
    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify the balance was updated
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single()

    if (accountError) {
      console.error('[Balance System] Error verifying balance:', accountError)
      return { success: false, error: accountError.message }
    }

    return {
      success: true,
      transactionId: transaction.id,
    }
  } catch (err: any) {
    console.error('[Balance System] Unexpected error:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}

/**
 * Directly update account balance (use with caution, transactions are preferred)
 */
export async function updateAccountBalanceDirectly(
  accountId: string,
  amount: number,
  operation: 'add' | 'subtract'
): Promise<BalanceUpdateResult> {
  try {
    const { data, error } = await supabase.rpc('update_account_balance', {
      p_account_id: accountId,
      p_amount: amount.toString(),
      p_operation: operation,
    })

    if (error) {
      console.error('[Balance System] Error updating balance:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      newBalance: parseFloat(data.toString()),
    }
  } catch (err: any) {
    console.error('[Balance System] Unexpected error:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}

/**
 * Recalculate account balance from all transactions
 */
export async function recalculateAccountBalance(
  accountId: string
): Promise<BalanceUpdateResult> {
  try {
    const { data, error } = await supabase.rpc('recalculate_account_balance', {
      p_account_id: accountId,
    })

    if (error) {
      console.error('[Balance System] Error recalculating balance:', error)
      return { success: false, error: error.message }
    }

    // Update the account with the recalculated balance
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        balance: data.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId)

    if (updateError) {
      console.error('[Balance System] Error updating account with recalculated balance:', updateError)
      return { success: false, error: updateError.message }
    }

    return {
      success: true,
      newBalance: parseFloat(data.toString()),
    }
  } catch (err: any) {
    console.error('[Balance System] Unexpected error:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}

/**
 * Sync all account balances from transactions
 */
export async function syncAllAccountBalances(): Promise<{
  success: boolean
  syncedCount?: number
  error?: string
}> {
  try {
    const { data, error } = await supabase.rpc('sync_all_account_balances')

    if (error) {
      console.error('[Balance System] Error syncing balances:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      syncedCount: data?.length || 0,
    }
  } catch (err: any) {
    console.error('[Balance System] Unexpected error:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}

/**
 * Get account balance with verification
 */
export async function getAccountBalance(accountId: string): Promise<{
  success: boolean
  balance?: number
  calculatedBalance?: number
  matches?: boolean
  error?: string
}> {
  try {
    // Get stored balance
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single()

    if (accountError) {
      return { success: false, error: accountError.message }
    }

    // Calculate balance from transactions
    const { data: calculated, error: calcError } = await supabase.rpc(
      'recalculate_account_balance',
      { p_account_id: accountId }
    )

    if (calcError) {
      return {
        success: true,
        balance: parseFloat(account.balance.toString()),
        error: `Could not verify: ${calcError.message}`,
      }
    }

    const storedBalance = parseFloat(account.balance.toString())
    const calculatedBalance = parseFloat(calculated.toString())
    const matches = Math.abs(storedBalance - calculatedBalance) < 0.01 // Allow small rounding differences

    return {
      success: true,
      balance: storedBalance,
      calculatedBalance,
      matches,
    }
  } catch (err: any) {
    console.error('[Balance System] Unexpected error:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}

/**
 * Get balance audit log for an account
 */
export async function getBalanceAuditLog(
  accountId: string,
  limit: number = 50
): Promise<{
  success: boolean
  logs?: any[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('balance_audit_log')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[Balance System] Error fetching audit log:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      logs: data || [],
    }
  } catch (err: any) {
    console.error('[Balance System] Unexpected error:', err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}


