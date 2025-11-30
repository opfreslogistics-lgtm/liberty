import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Transaction {
  id: string
  user_id: string
  account_id: string | null
  card_id: string | null
  type: 'credit' | 'debit' | 'transfer'
  category: string | null
  amount: number
  description: string | null
  merchant: string | null
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  pending: boolean
  date: string
  created_at: string
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let channel: any = null

    const setupSubscription = async () => {
      await fetchTransactions()

      // Set up real-time subscription for transaction updates
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (user && !userError) {
        channel = supabase
          .channel(`transactions_changes_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
              schema: 'public',
              table: 'transactions',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log('Transaction change detected:', payload)
              // Refresh transactions when any change occurs
              // Use a small delay to ensure database has updated
              setTimeout(() => {
                fetchTransactions()
              }, 100)
            }
          )
          .subscribe()

        console.log('Real-time subscription set up for transactions')
      }
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
        console.log('Real-time subscription removed')
      }
    }
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      // Fetch transactions from database
      const { data, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(100) // Limit to last 100 transactions

      if (transactionsError) {
        throw transactionsError
      }

      const formattedTransactions = (data || []).map(txn => ({
        ...txn,
        amount: parseFloat(txn.amount.toString()),
        card_id: txn.card_id || null,
        pending: txn.pending === true, // Ensure boolean
        status: txn.status || (txn.pending ? 'pending' : 'completed'), // Ensure status is set
      }))

      setTransactions(formattedTransactions as Transaction[])
    } catch (err: any) {
      console.error('Error fetching transactions:', err)
      setError(err.message || 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const refreshTransactions = () => {
    fetchTransactions()
  }

  return {
    transactions,
    loading,
    error,
    refreshTransactions,
  }
}



