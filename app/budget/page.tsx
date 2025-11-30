'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { formatCurrency, formatDate, generateReferenceNumber } from '@/lib/utils'
import NotificationModal from '@/components/NotificationModal'
import {
  Receipt,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  X,
  CreditCard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Eye,
  Zap,
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from 'recharts'
import clsx from 'clsx'

type BillStatus = 'all' | 'pending' | 'paid' | 'overdue' | 'cancelled'

const COLORS = {
  pending: '#f59e0b',
  paid: '#10b981',
  overdue: '#ef4444',
  cancelled: '#6b7280',
}

export default function BillsPage() {
  const { profile } = useUserProfile()
  const { accounts } = useAccounts()
  const [bills, setBills] = useState<Array<{
    id: string
    bill_name: string
    amount: number
    due_date: string
    bill_logo_url: string | null
    description: string | null
    status: string
    created_at: string
    paid_at: string | null
  }>>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BillStatus>('all')
  const [selectedBill, setSelectedBill] = useState<string | null>(null)
  const [showBillModal, setShowBillModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [payingBillId, setPayingBillId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  // Fetch bills
  useEffect(() => {
    if (profile?.id) {
      fetchBills()
    }
  }, [profile?.id])

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      const checkingAccount = accounts.find(a => a.account_type === 'checking')
      if (checkingAccount) {
        setSelectedAccountId(checkingAccount.id)
      } else {
        setSelectedAccountId(accounts[0].id)
      }
    }
  }, [accounts, selectedAccountId])

  const fetchBills = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })

      if (error) throw error

      setBills((data || []).map(bill => ({
        ...bill,
        amount: parseFloat(bill.amount.toString()),
      })))
    } catch (error) {
      console.error('Error fetching bills:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to load bills. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter bills
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchesSearch = 
        bill.bill_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bill.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || bill.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [bills, searchQuery, statusFilter])

  // Statistics
  const stats = useMemo(() => {
    const pending = bills.filter(b => b.status === 'pending')
    const paid = bills.filter(b => b.status === 'paid')
    const overdue = bills.filter(b => b.status === 'overdue')
    
    return {
      total: bills.length,
      pending: pending.length,
      paid: paid.length,
      overdue: overdue.length,
      totalAmount: bills.reduce((sum, b) => sum + b.amount, 0),
      pendingAmount: pending.reduce((sum, b) => sum + b.amount, 0),
      paidAmount: paid.reduce((sum, b) => sum + b.amount, 0),
      overdueAmount: overdue.reduce((sum, b) => sum + b.amount, 0),
    }
  }, [bills])

  // Chart data
  const paymentTrendData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        paid: bills
          .filter(b => b.status === 'paid' && b.paid_at)
          .filter(b => {
            const paidDate = new Date(b.paid_at!)
            return paidDate.getMonth() === date.getMonth() && paidDate.getFullYear() === date.getFullYear()
          })
          .reduce((sum, b) => sum + b.amount, 0),
        pending: bills
          .filter(b => b.status === 'pending')
          .filter(b => {
            const dueDate = new Date(b.due_date)
            return dueDate.getMonth() === date.getMonth() && dueDate.getFullYear() === date.getFullYear()
          })
          .reduce((sum, b) => sum + b.amount, 0),
      }
    })
    return last6Months
  }, [bills])

  const statusDistributionData = useMemo(() => {
    return [
      { name: 'Paid', value: stats.paid, color: COLORS.paid },
      { name: 'Pending', value: stats.pending, color: COLORS.pending },
      { name: 'Overdue', value: stats.overdue, color: COLORS.overdue },
    ].filter(item => item.value > 0)
  }, [stats])

  const handlePayBill = async (billId: string) => {
    if (!selectedAccountId) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Warning',
        message: 'Please select an account to pay from',
      })
      return
    }

    const bill = bills.find(b => b.id === billId)
    if (!bill) return

    const selectedAccount = accounts.find(a => a.id === selectedAccountId)
    if (!selectedAccount) return

    const billAmount = bill.amount
    const accountBalance = parseFloat(selectedAccount.balance.toString())

    if (accountBalance < billAmount) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Insufficient Funds',
        message: `Your ${selectedAccount.account_type} account has insufficient balance.`,
      })
      return
    }

    try {
      setPayingBillId(billId)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const referenceNumber = generateReferenceNumber()

      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: selectedAccountId,
          type: 'debit',
          amount: billAmount,
          description: `BILL – ${referenceNumber}`,
          category: 'bills',
          date: new Date().toISOString(),
          pending: false,
          status: 'completed',
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Create bill payment record
      const { error: paymentError } = await supabase
        .from('bill_payments')
        .insert({
          bill_id: billId,
          user_id: user.id,
          account_id: selectedAccountId,
          payment_amount: billAmount,
          payment_method: 'manual',
          transaction_id: transaction.id,
          reference_number: referenceNumber,
        })

      if (paymentError) throw paymentError

      // Update bill status
      const { error: billUpdateError } = await supabase
        .from('bills')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', billId)

      if (billUpdateError) throw billUpdateError

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Payment Successful',
        message: `Bill "${bill.bill_name}" has been paid successfully.`,
      })

      // Send email notifications (non-blocking)
      const { sendBillPaymentNotification } = await import('@/lib/utils/emailNotifications')
      const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)
      const accountDisplay = selectedAccount?.account_number 
        ? `****${selectedAccount.account_number.slice(-4)}` 
        : selectedAccount?.last4 
        ? `****${selectedAccount.last4}` 
        : 'Account'
      
      sendBillPaymentNotification(
        user.id,
        bill.bill_name,
        billAmount,
        accountDisplay,
        referenceNumber
      ).catch(error => {
        console.error('Error sending bill payment email notification:', error)
        // Don't fail the payment if email fails
      })

      setShowPaymentModal(false)
      await fetchBills()
    } catch (error: any) {
      console.error('Error paying bill:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Payment Failed',
        message: error.message || 'Failed to process payment. Please try again.',
      })
    } finally {
      setPayingBillId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'cancelled':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
    }
  }

  const selectedBillData = bills.find(b => b.id === selectedBill)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Bills & Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and pay your bills in one place
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBills}
            disabled={loading}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">
              Total
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.total}</p>
          <p className="text-sm text-blue-100">Total Bills</p>
          <p className="text-lg font-semibold mt-2">{formatCurrency(stats.totalAmount)}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">
              Pending
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.pending}</p>
          <p className="text-sm text-yellow-100">Pending Payment</p>
          <p className="text-lg font-semibold mt-2">{formatCurrency(stats.pendingAmount)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">
              Paid
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.paid}</p>
          <p className="text-sm text-green-100">Paid Bills</p>
          <p className="text-lg font-semibold mt-2">{formatCurrency(stats.paidAmount)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">
              Overdue
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.overdue}</p>
          <p className="text-sm text-red-100">Overdue Bills</p>
          <p className="text-lg font-semibold mt-2">{formatCurrency(stats.overdueAmount)}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Trend</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={paymentTrendData}>
                <defs>
                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                dataKey="paid"
                stroke="#10b981"
                  fillOpacity={1}
                fill="url(#colorPaid)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                dataKey="pending"
                stroke="#f59e0b"
                  fillOpacity={1}
                fill="url(#colorPending)"
                  strokeWidth={2}
                />
              <Legend />
              </AreaChart>
            </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Status Distribution</h2>
              <PieChartIcon className="w-5 h-5 text-gray-400" />
            </div>
          {statusDistributionData.length > 0 ? (
            <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                    data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                    dataKey="value"
                >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                    formatter={(value: any) => `${value} bills`}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
                {statusDistributionData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-gray-700 dark:text-gray-300">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                      {entry.value} bills
                  </span>
                </div>
              ))}
            </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <PieChartIcon className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No bills data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bills by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BillStatus)}
            className="input-field md:w-48"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading bills...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <Receipt className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-semibold">No bills found</p>
            <p className="text-sm mt-1">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'You have no bills assigned yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredBills.map((bill) => {
              const dueDate = new Date(bill.due_date)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              const isOverdue = daysLeft < 0 && bill.status === 'pending'
              const isUrgent = daysLeft <= 3 && daysLeft >= 0 && bill.status === 'pending'

            return (
              <div
                  key={bill.id}
                  className={`p-6 rounded-2xl border-2 transition-all hover:shadow-xl cursor-pointer ${
                    bill.status === 'paid'
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                      : isOverdue
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                      : isUrgent
                      ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                  }`}
                  onClick={() => {
                    setSelectedBill(bill.id)
                    setShowBillModal(true)
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {bill.bill_logo_url ? (
                        <img
                          src={bill.bill_logo_url}
                          alt={bill.bill_name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                          <Receipt className="w-6 h-6 text-gray-400" />
                </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {bill.bill_name}
                </h3>
                        <span className={clsx('text-xs px-2 py-1 rounded-full font-semibold border', getStatusColor(bill.status))}>
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                  </div>
                </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(bill.amount)}
                      </p>
                    </div>

                  <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</p>
                        <p className={`text-sm font-semibold ${
                          isOverdue ? 'text-red-600 dark:text-red-400' :
                          isUrgent ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-gray-900 dark:text-white'
                        }`}>
                          {formatDate(dueDate)}
                        </p>
                      </div>
                      {bill.status === 'pending' && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Days Left</p>
                          <p className={`text-sm font-bold ${
                            isOverdue ? 'text-red-600 dark:text-red-400' :
                            isUrgent ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-gray-900 dark:text-white'
                          }`}>
                            {isOverdue ? `${Math.abs(daysLeft)} overdue` : `${daysLeft} days`}
                          </p>
                        </div>
                      )}
                    </div>

                    {bill.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {bill.description}
                      </p>
                    )}

                    {bill.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedBill(bill.id)
                          setShowPaymentModal(true)
                        }}
                        className="w-full mt-4 px-4 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-5 h-5" />
                        Pay Now
                      </button>
                    )}

                    {bill.status === 'paid' && bill.paid_at && (
                      <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-semibold">Paid on {formatDate(new Date(bill.paid_at))}</span>
                        </div>
                  </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bill Details Modal */}
      {showBillModal && selectedBillData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bill Details</h2>
                <button
                  onClick={() => {
                    setShowBillModal(false)
                    setSelectedBill(null)
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
          </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                {selectedBillData.bill_logo_url ? (
                  <img
                    src={selectedBillData.bill_logo_url}
                    alt={selectedBillData.bill_name}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <Receipt className="w-10 h-10 text-gray-400" />
          </div>
        )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedBillData.bill_name}
                  </h3>
                  <span className={clsx('text-sm px-3 py-1 rounded-full font-semibold border mt-2 inline-block', getStatusColor(selectedBillData.status))}>
                    {selectedBillData.status.charAt(0).toUpperCase() + selectedBillData.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-700 to-emerald-600 rounded-2xl p-8 text-white text-center">
                <p className="text-sm opacity-90 mb-2">Bill Amount</p>
                <p className="text-5xl font-bold">
                  {formatCurrency(selectedBillData.amount)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(new Date(selectedBillData.due_date))}
                  </p>
            </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(new Date(selectedBillData.created_at))}
                  </p>
        </div>
                {selectedBillData.paid_at && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paid Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(new Date(selectedBillData.paid_at))}
                    </p>
      </div>
                )}
              </div>

              {selectedBillData.description && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                  <p className="font-semibold text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedBillData.description}
                  </p>
                </div>
              )}

              {selectedBillData.status === 'pending' && (
              <button
                onClick={() => {
                    setShowBillModal(false)
                    setShowPaymentModal(true)
                  }}
                  className="w-full px-6 py-4 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-lg"
                >
                  <CreditCard className="w-6 h-6" />
                  Pay This Bill
              </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBillData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pay Bill</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedBillData.bill_name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-green-700 to-emerald-600 rounded-xl p-6 text-white text-center">
                <p className="text-sm opacity-90 mb-2">Amount to Pay</p>
                <p className="text-4xl font-bold">{formatCurrency(selectedBillData.amount)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Pay From Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="input-field"
                  disabled={payingBillId === selectedBillData.id}
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)} - {formatCurrency(parseFloat(account.balance.toString()))}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handlePayBill(selectedBillData.id)}
                disabled={payingBillId === selectedBillData.id || !selectedAccountId}
                className="w-full px-6 py-4 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-lg"
              >
                {payingBillId === selectedBillData.id ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    Confirm Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
    </div>
  )
}
