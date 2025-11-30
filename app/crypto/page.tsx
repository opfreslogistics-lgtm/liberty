'use client'

import { useState, useEffect } from 'react'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { useCryptoPortfolio } from '@/lib/hooks/useCryptoPortfolio'
import { formatCurrency, generateReferenceNumber } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import NotificationModal from '@/components/NotificationModal'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Bitcoin,
  DollarSign,
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
  Clock,
  AlertCircle,
  Info,
  Zap,
  Shield,
  ChevronRight,
  Star,
  Plus,
  RefreshCw,
  X,
  Loader2,
} from 'lucide-react'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'

export default function CryptoPage() {
  const { accounts, refreshAccounts } = useAccounts()
  const { portfolio, refreshPortfolio, loading: portfolioLoading, error: portfolioError } = useCryptoPortfolio()
  // Separate state for buy and sell forms to prevent conflicts
  const [buyAmount, setBuyAmount] = useState('')
  const [buyAmountType, setBuyAmountType] = useState<'usd' | 'btc'>('usd')
  const [sellAmount, setSellAmount] = useState('')
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M')
  const [selectedCrypto, setSelectedCrypto] = useState('BTC')
  const [btcPrice, setBtcPrice] = useState(43250.00) // Default price, can be fetched from API
  const [showFundModal, setShowFundModal] = useState(false)
  const [fundAmount, setFundAmount] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false)
  const [notification, setNotification] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  })

  // Parse portfolio data - handle DECIMAL types from database
  const parseDecimal = (value: any): number => {
    if (value === null || value === undefined) return 0
    if (typeof value === 'string') return parseFloat(value) || 0
    if (typeof value === 'number') return value
    return 0
  }

  // Portfolio values from database
  const fundedAmount = portfolio ? parseDecimal(portfolio.funded_amount) : 0 // USD funded
  const cryptoBalance = portfolio ? parseDecimal(portfolio.crypto_balance) : 0 // BTC owned (in BTC units)
  const cryptoBalanceValueUsd = portfolio ? parseDecimal(portfolio.crypto_balance_value_usd) : 0 // USD value of BTC at purchase prices
  
  // Calculated values
  const btcMarketValue = cryptoBalance * btcPrice // Current BTC market value (display only)
  const portfolioBalance = fundedAmount + cryptoBalanceValueUsd // Total portfolio balance

  // Debug logging for balance display
  useEffect(() => {
    if (portfolio) {
      console.log('[CryptoPage] Balance Debug:', {
        portfolio_raw: portfolio,
        parsed: {
          fundedAmount,
          cryptoBalance,
          cryptoBalanceValueUsd,
          btcMarketValue,
          portfolioBalance,
        },
        btcPrice,
      })
    }
  }, [portfolio, fundedAmount, cryptoBalance, cryptoBalanceValueUsd, btcMarketValue, portfolioBalance, btcPrice])

  // Fetch BTC price (mock for now, can be replaced with real API)
  useEffect(() => {
    // In production, fetch from crypto API
    setBtcPrice(43250.00)
  }, [])

  // Auto-refresh portfolio periodically to get updates from admin approvals
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPortfolio()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [refreshPortfolio])

  // Cryptocurrencies - Only BTC for now
  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', price: btcPrice, change: 0, balance: cryptoBalance, icon: Bitcoin, color: '#F7931A' },
  ]

  // Price history data - Empty for new users
  // Generate mock price history based on current BTC price if no data available
  const generateMockPriceHistory = (timeframe: string, basePrice: number) => {
    const data: Array<{ time: string; price: number; volume: number }> = []
    const now = new Date()
    let points = 24 // Default for 1D
    
    switch (timeframe) {
      case '1D':
        points = 24
        break
      case '1W':
        points = 7
        break
      case '1M':
        points = 30
        break
      case '3M':
        points = 90
        break
      case '1Y':
        points = 12
        break
    }
    
    for (let i = points; i >= 0; i--) {
      const date = new Date(now)
      if (timeframe === '1D') {
        date.setHours(date.getHours() - i)
      } else if (timeframe === '1W') {
        date.setDate(date.getDate() - i)
      } else if (timeframe === '1M') {
        date.setDate(date.getDate() - i)
      } else if (timeframe === '3M') {
        date.setDate(date.getDate() - i * 3)
      } else if (timeframe === '1Y') {
        date.setMonth(date.getMonth() - i)
      }
      
      // Generate price with slight variation (±5%)
      const variation = (Math.random() - 0.5) * 0.1
      const price = basePrice * (1 + variation)
      const volume = Math.random() * 1000000 + 500000
      
      data.push({
        time: timeframe === '1D' 
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: parseFloat(price.toFixed(2)),
        volume: parseFloat(volume.toFixed(0)),
      })
    }
    
    return data
  }

  const priceHistory = {
    '1D': generateMockPriceHistory('1D', btcPrice),
    '1W': generateMockPriceHistory('1W', btcPrice),
    '1M': generateMockPriceHistory('1M', btcPrice),
    '3M': generateMockPriceHistory('3M', btcPrice),
    '1Y': generateMockPriceHistory('1Y', btcPrice),
  }

  const fee = 0.025 // 2.5% fee
  
  // Buy form calculations
  const buyAmountNum = parseFloat(buyAmount) || 0
  const buyBtcAmount = buyAmountType === 'usd' ? buyAmountNum / btcPrice : buyAmountNum
  const buyTotalCost = buyAmountType === 'usd' ? buyAmountNum * (1 + fee) : buyBtcAmount * btcPrice * (1 + fee)
  const buyFeeAmount = buyTotalCost - (buyAmountType === 'usd' ? buyAmountNum : buyBtcAmount * btcPrice)
  
  // Sell form calculations
  const sellAmountNum = parseFloat(sellAmount) || 0
  const sellBtcAmount = sellAmountNum // Sell is always in BTC
  const sellUsdValue = sellBtcAmount * btcPrice
  const sellTotalValue = sellUsdValue * (1 - fee) // After fee deduction
  const sellFeeAmount = sellUsdValue - sellTotalValue

  const handleFundCrypto = async () => {
    if (!selectedAccountId || !fundAmount || parseFloat(fundAmount) <= 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Input',
        message: 'Please select an account and enter a valid amount.',
      })
      return
    }

    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)
    if (!selectedAccount) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Account Not Found',
        message: 'Selected account not found.',
      })
      return
    }

    const amountNum = parseFloat(fundAmount)
    if (amountNum > selectedAccount.balance) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Insufficient Balance',
        message: `Your ${selectedAccount.account_type} account has insufficient funds.`,
      })
      return
    }

    setIsProcessing(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const referenceNumber = generateReferenceNumber()
      const transactionDate = new Date().toISOString()

      // Create transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            account_id: selectedAccountId,
            type: 'debit',
            category: 'Crypto Fund',
            amount: amountNum,
            description: `CRYPTO FUND – ${referenceNumber}`,
            status: 'completed',
            pending: false,
            date: transactionDate,
          },
        ])
        .select()
        .single()

      if (transactionError) throw transactionError

      // Fetch current portfolio to get accurate balance
      const { data: currentPortfolio, error: fetchError } = await supabase
        .from('crypto_portfolio')
        .select('funded_amount')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

      // Calculate new funded amount
      const currentFundedAmount = currentPortfolio 
        ? (typeof currentPortfolio.funded_amount === 'number'
            ? currentPortfolio.funded_amount
            : parseFloat(String(currentPortfolio.funded_amount || 0)) || 0)
        : 0
      const newFundedAmount = (currentFundedAmount + amountNum).toFixed(2)

      // Update crypto portfolio - increase funded_amount
      const { error: portfolioError } = await supabase
        .from('crypto_portfolio')
        .update({
          funded_amount: newFundedAmount,
        })
        .eq('user_id', user.id)

      if (portfolioError) {
        console.error('Error updating crypto portfolio:', portfolioError)
        throw portfolioError
      }

      // Create crypto transaction record
      await supabase
        .from('crypto_transactions')
        .insert([
          {
            user_id: user.id,
            account_id: selectedAccountId,
            transaction_type: 'crypto_fund',
            reference_number: referenceNumber,
            amount: amountNum,
            status: 'completed',
            transaction_id: transactionData.id,
          },
        ])

      // Create notification
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: user.id,
            type: 'transaction',
            title: 'Crypto Portfolio Funded',
            message: `Successfully funded your crypto portfolio with ${formatCurrency(amountNum)}. Reference: ${referenceNumber}`,
            read: false,
          },
        ])

      // Force refresh portfolio immediately and again after delay
      refreshPortfolio()
      await refreshAccounts()
      
      // Wait a moment and refresh again to ensure database update is reflected
      setTimeout(() => {
        refreshPortfolio()
      }, 1000)

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Portfolio Funded',
        message: `Successfully transferred ${formatCurrency(amountNum)} to your crypto portfolio. Your balance will update shortly.`,
      })

      setShowFundModal(false)
      setFundAmount('')
      setSelectedAccountId('')
    } catch (error: any) {
      console.error('Error funding crypto:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Funding Failed',
        message: error.message || 'Failed to fund crypto portfolio. Please try again.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Check KYC status
  const checkKYCStatus = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      // Check user profile KYC status
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('kyc_status')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error checking KYC status:', profileError)
        return false
      }

      // Check if KYC is approved
      if (userProfile?.kyc_status !== 'approved') {
        setNotification({
          isOpen: true,
          type: 'warning',
          title: 'KYC Verification Required',
          message: 'You must complete and have your KYC verification approved before you can buy or sell crypto. Please go to Settings > KYC Verification to submit your documents.',
        })
        return false
      }

      return true
    } catch (error) {
      console.error('Error checking KYC:', error)
      return false
    }
  }

  const handleTrade = async () => {
    // Check KYC status first
    const kycApproved = await checkKYCStatus()
    if (!kycApproved) {
      return
    }

    if (tradeType === 'buy') {
      // Check if user has enough funded amount
      if (buyTotalCost > fundedAmount) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Insufficient Balance',
          message: `You need ${formatCurrency(buyTotalCost)} in your crypto portfolio. Current funded amount: ${formatCurrency(fundedAmount)}`,
        })
        return
      }
      
      if (!buyAmount || buyAmountNum <= 0) {
        setNotification({
          isOpen: true,
          type: 'warning',
          title: 'Invalid Amount',
          message: 'Please enter a valid amount to buy.',
        })
        return
      }
    } else {
      // Sell - check BTC balance
      if (sellBtcAmount > cryptoBalance) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Insufficient BTC',
          message: `You don't have enough BTC. Available: ${cryptoBalance.toFixed(8)} BTC`,
        })
        return
      }
      
      if (!sellAmount || sellAmountNum <= 0) {
        setNotification({
          isOpen: true,
          type: 'warning',
          title: 'Invalid Amount',
          message: 'Please enter a valid BTC amount to sell.',
        })
        return
      }
    }

    setIsProcessing(true)
    setIsProcessingTransaction(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const referenceNumber = generateReferenceNumber()
      const transactionDate = new Date().toISOString()

      if (tradeType === 'buy') {
        // AUTO-APPROVE: Deduct from funded_amount and immediately add BTC to portfolio
        const parseDecimal = (value: any): number => {
          if (value === null || value === undefined) return 0
          if (typeof value === 'string') return parseFloat(value) || 0
          if (typeof value === 'number') return value
          return 0
        }

        // Fetch current portfolio
        const { data: currentPortfolio, error: fetchError } = await supabase
          .from('crypto_portfolio')
          .select('crypto_balance, crypto_balance_value_usd')
          .eq('user_id', user.id)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

        const currentBtcBalance = currentPortfolio ? parseDecimal(currentPortfolio.crypto_balance) : 0
        const currentCryptoBalanceValueUsd = currentPortfolio ? parseDecimal(currentPortfolio.crypto_balance_value_usd) : 0

        // Calculate new balances
        const purchasePrice = btcPrice // Price per BTC at time of purchase
        const btcValueUsd = buyBtcAmount * purchasePrice // USD value of BTC at purchase price
        const newBtcBalance = parseFloat((currentBtcBalance + buyBtcAmount).toFixed(8))
        const newCryptoBalanceValueUsd = parseFloat((currentCryptoBalanceValueUsd + btcValueUsd).toFixed(2))
        const newFundedAmount = parseFloat((fundedAmount - buyTotalCost).toFixed(2))

        // Update portfolio immediately (auto-approved)
        const { error: portfolioError } = await supabase
          .from('crypto_portfolio')
          .update({
            funded_amount: newFundedAmount.toString(),
            crypto_balance: newBtcBalance.toString(),
            crypto_balance_value_usd: newCryptoBalanceValueUsd.toString(),
          })
          .eq('user_id', user.id)

        if (portfolioError) {
          console.error('[CryptoPage] Error updating portfolio:', portfolioError)
          throw portfolioError
        }

        // Create completed crypto transaction (auto-approved)
        const { data: cryptoTransaction, error: cryptoError } = await supabase
          .from('crypto_transactions')
          .insert([
            {
              user_id: user.id,
              transaction_type: 'btc_buy',
              reference_number: referenceNumber,
              amount: buyTotalCost,
              amount_usd: buyTotalCost, // Also populate old column name
              btc_amount: buyBtcAmount,
              amount_crypto: buyBtcAmount, // Also populate old column name
              btc_price: btcPrice,
              crypto_price: btcPrice, // Also populate old column name
              status: 'completed', // Auto-approved
            },
          ])
          .select()
          .single()

        if (cryptoError) throw cryptoError

        // Create completed transaction record
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: user.id,
              type: 'debit',
              category: 'BTC Buy',
              amount: buyTotalCost,
              description: `BTC BUY – ${referenceNumber}`,
              status: 'completed', // Auto-approved
              pending: false,
              date: transactionDate,
            },
          ])
          .select()
          .single()

        if (transactionError) throw transactionError

        // Link transaction to crypto transaction
        await supabase
          .from('crypto_transactions')
          .update({ transaction_id: transactionData.id })
          .eq('id', cryptoTransaction.id)

        // Refresh portfolio to show updated balances
        refreshPortfolio()
        setBuyAmount('') // Clear buy form

        setNotification({
          isOpen: true,
          type: 'success',
          title: 'BTC Purchase Completed',
          message: `Successfully purchased ${buyBtcAmount.toFixed(8)} BTC (${formatCurrency(buyTotalCost)}) at ${formatCurrency(btcPrice)} per BTC. Reference: ${referenceNumber}`,
        })
      } else {
        // Sell - deduct BTC from balance (USD will be added by admin on approval)
        const { error: portfolioError } = await supabase
          .from('crypto_portfolio')
          .update({
            crypto_balance: (cryptoBalance - sellBtcAmount).toFixed(8),
            // Note: crypto_balance_value_usd will be updated by admin when approving
          })
          .eq('user_id', user.id)

        if (portfolioError) throw portfolioError

        // Create pending crypto transaction
        const { data: cryptoTransaction, error: cryptoError } = await supabase
          .from('crypto_transactions')
          .insert([
            {
              user_id: user.id,
              transaction_type: 'btc_sell',
              reference_number: referenceNumber,
              amount: sellTotalValue, // USD amount after fee
              amount_usd: sellTotalValue, // Also populate old column name
              btc_amount: sellBtcAmount,
              amount_crypto: sellBtcAmount, // Also populate old column name
              btc_price: btcPrice,
              crypto_price: btcPrice, // Also populate old column name
              status: 'pending',
            },
          ])
          .select()
          .single()

        if (cryptoError) throw cryptoError

        // Create transaction record
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: user.id,
              type: 'credit',
              category: 'BTC Sell',
              amount: sellTotalValue,
              description: `BTC SELL – ${referenceNumber}`,
              status: 'pending',
              pending: true,
              date: transactionDate,
            },
          ])
          .select()
          .single()

        if (transactionError) throw transactionError

        // Link transaction to crypto transaction
        await supabase
          .from('crypto_transactions')
          .update({ transaction_id: transactionData.id })
          .eq('id', cryptoTransaction.id)

        // Refresh portfolio to show updated BTC balance
        refreshPortfolio()
        setSellAmount('') // Clear sell form

        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Sell Order Placed',
          message: `Your BTC sell order for ${sellBtcAmount.toFixed(8)} BTC (${formatCurrency(sellTotalValue)} after fees) is pending admin approval. Reference: ${referenceNumber}`,
        })
      }

      refreshPortfolio()
    } catch (error: any) {
      console.error('Error processing trade:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Trade Failed',
        message: error.message || 'Failed to process trade. Please try again.',
      })
    } finally {
      setIsProcessing(false)
      setIsProcessingTransaction(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Investments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Trade and manage your cryptocurrency portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refreshPortfolio()}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-sm font-semibold"
            title="Refresh Portfolio"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button 
            onClick={() => setShowFundModal(true)}
            className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Fund Crypto Portfolio
          </button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/80 text-sm mb-1">Portfolio Balance</p>
              <p className="text-5xl font-bold mb-2">{formatCurrency(portfolioBalance)}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">+8.5%</span>
                </div>
                <span className="text-sm text-white/80">+{formatCurrency(portfolioBalance * 0.085)} (24h)</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-white/80 text-sm">Crypto Balance</p>
                <p className="text-2xl font-bold">{cryptoBalance.toFixed(8)} BTC</p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">BTC Value (Market)</p>
                <p className="text-2xl font-bold text-green-300">{formatCurrency(btcMarketValue)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crypto Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cryptos.map((crypto) => {
          const Icon = crypto.icon
          const value = crypto.balance * crypto.price
          return (
            <button
              key={crypto.symbol}
              onClick={() => setSelectedCrypto(crypto.symbol)}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border transition-all hover:shadow-xl ${
                selectedCrypto === crypto.symbol
                  ? 'border-green-700 ring-2 ring-green-700'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: crypto.color + '20' }}>
                    <Icon className="w-6 h-6" style={{ color: crypto.color }} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 dark:text-white">{crypto.symbol}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{crypto.name}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Balance</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {crypto.balance.toFixed(8)} {crypto.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Value</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(value)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">24h</span>
                  <span className={`text-sm font-semibold flex items-center gap-1 ${
                    crypto.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {crypto.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(crypto.change)}%
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Price Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Price Chart</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCrypto} / USD</p>
          </div>
          <div className="flex items-center gap-2">
            {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeframe === tf
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={priceHistory[timeframe]}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#047857" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value: any) => [formatCurrency(value), 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#047857"
              strokeWidth={3}
              fill="url(#priceGradient)"
            />
            </AreaChart>
          </ResponsiveContainer>

        {/* Volume Chart */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Trading Volume</h3>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={priceHistory[timeframe]}>
              <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(value: any) => [formatCurrency(value), 'Volume']}
              />
              <Bar dataKey="volume" fill="#047857" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Buy/Sell Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buy Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-green-700 dark:text-green-400" />
              </div>
              Buy {selectedCrypto}
            </h2>
            <button
              onClick={() => setTradeType('buy')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                tradeType === 'buy'
                  ? 'bg-green-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Buy
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Amount Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBuyAmountType('usd')}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    buyAmountType === 'usd'
                      ? 'bg-green-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  onClick={() => setBuyAmountType('btc')}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    buyAmountType === 'btc'
                      ? 'bg-green-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {selectedCrypto}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {buyAmountType === 'usd' ? 'Amount (USD)' : `Amount (${selectedCrypto})`}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-gray-400">
                  {buyAmountType === 'usd' ? '$' : '₿'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder={buyAmountType === 'usd' ? '0.00' : '0.0000'}
                  className="input-field pl-10 text-xl font-bold"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 5000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setBuyAmount(quickAmount.toString())}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 rounded-lg text-sm font-semibold transition-all"
                >
                  ${quickAmount}
                </button>
              ))}
            </div>

            {buyAmount && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {buyAmountType === 'usd' ? `${selectedCrypto} Amount` : 'USD Amount'}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {buyAmountType === 'usd'
                      ? `${buyBtcAmount.toFixed(8)} ${selectedCrypto}`
                      : formatCurrency(buyBtcAmount * btcPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fee (2.5%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(buyFeeAmount)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                  <span className="font-bold text-gray-900 dark:text-white">Total Cost</span>
                  <span className="text-xl font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(buyTotalCost)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Funded Amount</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(fundedAmount)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-xs">Rate: {formatCurrency(btcPrice)} / {selectedCrypto}</span>
            </div>

            <button
              onClick={() => {
                setTradeType('buy')
                handleTrade()
              }}
              disabled={!buyAmount || buyAmountNum <= 0 || isProcessing || buyTotalCost > fundedAmount}
              className="w-full py-4 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Buy ${selectedCrypto}`
              )}
            </button>
          </div>
        </div>

        {/* Sell Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-red-700 dark:text-red-400" />
              </div>
              Sell {selectedCrypto}
            </h2>
            <button
              onClick={() => setTradeType('sell')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                tradeType === 'sell'
                  ? 'bg-red-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Sell
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Amount ({selectedCrypto})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-gray-400">
                  ₿
                </span>
                <input
                  type="number"
                  step="0.00000001"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder="0.0000"
                  max={cryptoBalance}
                  className="input-field pl-10 text-xl font-bold"
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Available: {cryptoBalance.toFixed(8)} {selectedCrypto}
              </p>
            </div>

            {/* Quick Percentage Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => setSellAmount((cryptoBalance * (percentage / 100)).toString())}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 rounded-lg text-sm font-semibold transition-all"
                >
                  {percentage}%
                </button>
              ))}
            </div>

            {sellAmount && sellAmountNum > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">USD Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(sellUsdValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fee (2.5%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(sellFeeAmount)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                  <span className="font-bold text-gray-900 dark:text-white">You'll Receive</span>
                  <span className="text-xl font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(sellTotalValue)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-900 dark:text-red-300">
                Selling crypto may have tax implications. Consult with a tax professional.
              </p>
            </div>

            <button
              onClick={() => {
                setTradeType('sell')
                handleTrade()
              }}
              disabled={!sellAmount || sellAmountNum <= 0 || sellAmountNum > cryptoBalance || isProcessing}
              className="w-full py-4 bg-red-700 hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Sell ${selectedCrypto}`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Secure Trading</p>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            All cryptocurrency transactions are secured with bank-grade encryption. BTC buy/sell orders require admin approval.
          </p>
        </div>
      </div>

      {/* Fund Crypto Portfolio Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Fund Crypto Portfolio
                </h2>
                <button
                  onClick={() => {
                    setShowFundModal(false)
                    setFundAmount('')
                    setSelectedAccountId('')
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Select Account
                </label>
                <div className="space-y-2">
                  {accounts.map((account) => {
                    const accountTypeLabel = account.account_type === 'fixed-deposit' 
                      ? 'Fixed Deposit' 
                      : account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)
                    
                    return (
                      <button
                        key={account.id}
                        onClick={() => setSelectedAccountId(account.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          selectedAccountId === account.id
                            ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {accountTypeLabel} Account
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ••••{account.last4}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatCurrency(account.balance)}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field pl-12 text-xl font-bold"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Current Funded Amount: {formatCurrency(fundedAmount)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFundModal(false)
                    setFundAmount('')
                    setSelectedAccountId('')
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFundCrypto}
                  disabled={!selectedAccountId || !fundAmount || isProcessing}
                  className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Fund Portfolio'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />

      {/* Processing Transaction Animation */}
      {isProcessingTransaction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-16 h-16 text-green-600 dark:text-green-400 animate-spin mb-4" />
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Processing Transaction
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Please wait while we process your {tradeType === 'buy' ? 'purchase' : 'sale'}...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
