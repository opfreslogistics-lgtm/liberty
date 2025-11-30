'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Globe, ArrowRightLeft, Plane, TrendingUp, Wallet } from 'lucide-react'

interface CurrencyAccount {
  id: string
  currency: string
  symbol: string
  balance: number
  exchangeRate: number
}

export default function MultiCurrencyPage() {
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [amount, setAmount] = useState('')
  const [travelMode, setTravelMode] = useState(false)

  const currencyAccounts: CurrencyAccount[] = [
    { id: '1', currency: 'USD', symbol: '$', balance: 12450.75, exchangeRate: 1.0 },
    { id: '2', currency: 'EUR', symbol: '€', balance: 8500.50, exchangeRate: 0.92 },
    { id: '3', currency: 'GBP', symbol: '£', balance: 7200.25, exchangeRate: 0.79 },
    { id: '4', currency: 'JPY', symbol: '¥', balance: 1500000, exchangeRate: 149.5 },
  ]

  const currentRates = {
    USD: { EUR: 0.92, GBP: 0.79, JPY: 149.5 },
    EUR: { USD: 1.09, GBP: 0.86, JPY: 162.5 },
    GBP: { USD: 1.27, EUR: 1.16, JPY: 189.2 },
    JPY: { USD: 0.0067, EUR: 0.0062, GBP: 0.0053 },
  }

  const fromAccount = currencyAccounts.find((acc) => acc.currency === fromCurrency)
  const toAccount = currencyAccounts.find((acc) => acc.currency === toCurrency)
  const rate = currentRates[fromCurrency as keyof typeof currentRates]?.[toCurrency as keyof typeof currentRates[typeof fromCurrency]] || 1
  const spread = 0.02 // 2% spread
  const finalRate = fromCurrency === 'USD' ? rate * (1 - spread) : rate / (1 + spread)
  const convertedAmount = parseFloat(amount) * finalRate || 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Multi-Currency Accounts
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage accounts in multiple currencies and convert between them
        </p>
      </div>

      {/* Currency Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currencyAccounts.map((account) => (
          <div key={account.id} className="card hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-accent-teal rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {account.currency}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {account.symbol}
              {account.balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ≈ {formatCurrency(account.balance * account.exchangeRate)}
            </p>
          </div>
        ))}
      </div>

      {/* Travel Mode */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Travel Mode
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Optimize account and card controls for foreign travel
              </p>
            </div>
          </div>
          <button
            onClick={() => setTravelMode(!travelMode)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              travelMode ? 'bg-accent-teal' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                travelMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {travelMode && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Travel mode is active. Geographical limits on card use have been temporarily removed.
            </p>
          </div>
        )}
      </div>

      {/* Currency Conversion */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <ArrowRightLeft className="w-6 h-6 text-accent-teal" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Currency Converter
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* From Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="input-field mb-4"
            >
              {currencyAccounts.map((acc) => (
                <option key={acc.id} value={acc.currency}>
                  {acc.currency} - {acc.symbol}
                  {acc.balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-field"
            />
          </div>

          {/* To Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="input-field mb-4"
            >
              {currencyAccounts.map((acc) => (
                <option key={acc.id} value={acc.currency}>
                  {acc.currency} - {acc.symbol}
                  {acc.balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </option>
              ))}
            </select>
            <div className="input-field bg-gray-50 dark:bg-gray-700">
              {convertedAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        {/* Rate Information */}
        {amount && parseFloat(amount) > 0 && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Interbank Rate
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Our Rate (with {spread * 100}% spread)
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                1 {fromCurrency} = {finalRate.toFixed(4)} {toCurrency}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Exchange rates are indicative and may vary at the time of conversion.
                The final rate includes our standard spread.
              </p>
            </div>
          </div>
        )}

        <button
          className="btn-primary w-full mt-6"
          disabled={!amount || parseFloat(amount) <= 0 || fromCurrency === toCurrency}
        >
          Convert Currency
        </button>
      </div>

      {/* Exchange Rate Trends */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-accent-teal" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Exchange Rate Trends
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(currentRates.USD).map(([currency, rate]) => (
            <div
              key={currency}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                USD / {currency}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rate.toFixed(4)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +0.12% (24h)
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}




