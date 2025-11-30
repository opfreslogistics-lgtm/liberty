import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface CryptoPortfolio {
  id: string
  user_id: string
  funded_amount: number // Total USD funded into crypto portfolio
  crypto_balance: number // Total BTC owned (in BTC units)
  crypto_balance_value_usd: number // USD value of BTC at purchase prices
  created_at: string
  updated_at: string
}

export function useCryptoPortfolio() {
  const [portfolio, setPortfolio] = useState<CryptoPortfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchPortfolio()

    // Set up real-time subscription for portfolio updates
    let channel: any = null

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        channel = supabase
          .channel(`crypto_portfolio_changes_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'crypto_portfolio',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              // Refresh portfolio when it's updated
              console.log('[useCryptoPortfolio] Real-time update received:', payload)
              fetchPortfolio()
            }
          )
          .subscribe()
      }
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [refreshKey])

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('User not authenticated')
        setPortfolio(null)
        setLoading(false)
        return
      }

      // Fetch or create portfolio
      let { data, error: fetchError } = await supabase
        .from('crypto_portfolio')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code === 'PGRST116') {
        // Portfolio doesn't exist, create it
        const { data: newPortfolio, error: createError } = await supabase
          .from('crypto_portfolio')
          .insert([
            {
              user_id: user.id,
              funded_amount: 0.00,
              crypto_balance: 0.00000000,
              crypto_balance_value_usd: 0.00,
            },
          ])
          .select()
          .single()

        if (createError) {
          throw createError
        }
        data = newPortfolio
      } else if (fetchError) {
        throw fetchError
      }

      if (data) {
        // Ensure proper parsing of DECIMAL types from database
        // DECIMAL types from Supabase come as strings
        const parseDecimal = (value: any): number => {
          if (value === null || value === undefined) return 0
          if (typeof value === 'string') return parseFloat(value) || 0
          if (typeof value === 'number') return value
          return 0
        }

        const parsedFundedAmount = parseDecimal(data.funded_amount)
        const parsedCryptoBalance = parseDecimal(data.crypto_balance)
        const parsedCryptoBalanceValueUsd = parseDecimal(data.crypto_balance_value_usd)

        console.log('[useCryptoPortfolio] Fetched portfolio:', {
          raw_data: data,
          parsed: {
            funded_amount: parsedFundedAmount,
            crypto_balance: parsedCryptoBalance,
            crypto_balance_value_usd: parsedCryptoBalanceValueUsd,
          },
        })

        setPortfolio({
          ...data,
          funded_amount: parsedFundedAmount,
          crypto_balance: parsedCryptoBalance,
          crypto_balance_value_usd: parsedCryptoBalanceValueUsd,
        })
      } else {
        console.warn('[useCryptoPortfolio] No portfolio data returned')
        setPortfolio(null)
      }
    } catch (err: any) {
      console.error('Error fetching crypto portfolio:', err)
      setError(err.message || 'Failed to fetch crypto portfolio')
      setPortfolio(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshPortfolio = () => {
    setRefreshKey(prev => prev + 1)
  }

  return {
    portfolio,
    loading,
    error,
    refreshPortfolio,
  }
}

