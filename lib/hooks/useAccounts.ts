import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Account {
  id: string
  user_id: string
  account_type: 'checking' | 'savings' | 'business' | 'fixed-deposit'
  account_number: string
  balance: number
  status: 'active' | 'frozen' | 'closed'
  last4: string
  created_at: string
  updated_at: string
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchAccounts()
    
    // Set up real-time subscription for account balance updates
    let channel: any = null
    
    const setupSubscription = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) return
      
      channel = supabase
        .channel('accounts_balance_updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'accounts',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            console.log('[useAccounts] Account balance updated, refreshing...')
            fetchAccounts()
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            console.log('[useAccounts] Transaction created, refreshing accounts...')
            // Wait a bit for trigger to update balance
            setTimeout(() => fetchAccounts(), 500)
          }
        )
        .subscribe()
    }
    
    setupSubscription()
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [refreshKey])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('User not authenticated')
        setAccounts([])
        setLoading(false)
        return
      }

      // Fetch accounts from database
      const { data, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      if (accountsError) {
        console.error('Error fetching accounts:', accountsError)
        setError(accountsError.message || 'Failed to fetch accounts')
        setAccounts([])
        setLoading(false)
        return
      }

      // Parse balance from string (DECIMAL) to number and ensure all fields are properly typed
      const parsedAccounts: Account[] = (data || []).map((account: any) => {
        let parsedBalance = 0
        
        if (account.balance !== null && account.balance !== undefined) {
          if (typeof account.balance === 'string') {
            parsedBalance = parseFloat(account.balance) || 0
          } else if (typeof account.balance === 'number') {
            parsedBalance = account.balance
          }
        }
        
        console.log(`[useAccounts] Account ${account.account_type} (${account.id}): balance type=${typeof account.balance}, value=${account.balance}, parsed=${parsedBalance}`)
        
        return {
          ...account,
          balance: parsedBalance,
        }
      })

      console.log(`[useAccounts] Fetched ${parsedAccounts.length} accounts:`, parsedAccounts.map(acc => ({ type: acc.account_type, balance: acc.balance })))
      setAccounts(parsedAccounts)
      setLoading(false)
      setIsRefreshing(false)
    } catch (err: any) {
      console.error('Error fetching accounts:', err)
      setError(err.message || 'Failed to fetch accounts')
      setAccounts([])
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const refreshAccounts = () => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshing || loading) {
      return
    }
    setIsRefreshing(true)
    // Force a refresh by incrementing the key, which will trigger useEffect
    setRefreshKey(prev => prev + 1)
    // Reset refreshing flag after a short delay
    setTimeout(() => setIsRefreshing(false), 100)
  }

  return {
    accounts,
    loading,
    error,
    refreshAccounts,
  }
}

