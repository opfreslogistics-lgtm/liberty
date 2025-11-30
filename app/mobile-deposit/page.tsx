'use client'

import { useState, useRef } from 'react'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import NotificationModal from '@/components/NotificationModal'
import {
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  ChevronRight,
  FileText,
  Shield,
  Clock,
  DollarSign,
  Image as ImageIcon,
  RotateCw,
  Check,
  AlertTriangle,
  Download,
  Eye,
  Smartphone,
  Banknote,
  Scan,
} from 'lucide-react'
import clsx from 'clsx'

type DepositStep = 'account' | 'amount' | 'front' | 'back' | 'review' | 'processing' | 'complete'

export default function MobileDepositPage() {
  const { accounts, loading: accountsLoading, refreshAccounts } = useAccounts()
  const [currentStep, setCurrentStep] = useState<DepositStep>('account')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [backImage, setBackImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [showLimits, setShowLimits] = useState(false)
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
  
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  const depositLimits = {
    perCheque: 5000,
    daily: 10000,
    monthly: 25000,
    dailyUsed: 0,
    monthlyUsed: 0,
  }

  const steps = [
    { id: 'account', label: 'Account', icon: Banknote },
    { id: 'amount', label: 'Amount', icon: DollarSign },
    { id: 'front', label: 'Front', icon: Camera },
    { id: 'back', label: 'Back', icon: Camera },
    { id: 'review', label: 'Review', icon: Eye },
  ]

  const getStepIndex = (step: DepositStep) => {
    const stepOrder: DepositStep[] = ['account', 'amount', 'front', 'back', 'review', 'processing', 'complete']
    return stepOrder.indexOf(step)
  }

  const currentStepIndex = getStepIndex(currentStep)

  const handleImageUpload = (type: 'front' | 'back', file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'front') {
        setFrontImage(reader.result as string)
      } else {
        setBackImage(reader.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!selectedAccount || !amount || !frontImage || !backImage) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Missing Information',
        message: 'Please complete all steps before submitting.',
      })
      return
    }

    setCurrentStep('processing')
    setIsProcessing(true)
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Generate reference number
      const refNum = `REF${Math.floor(100000 + Math.random() * 900000)}`
      setReferenceNumber(refNum)

      // Generate deposit_id (format: MD-YYYYMMDD-XXXXXX)
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const randomPart = Math.floor(100000 + Math.random() * 900000).toString()
      const depositId = `MD-${year}${month}${day}-${randomPart}`

      // Create mobile deposit record
      const { data: depositData, error: depositError } = await supabase
        .from('mobile_deposits')
        .insert([
          {
            user_id: user.id,
            account_id: selectedAccount,
            deposit_id: depositId,
            reference_number: refNum,
            amount: parseFloat(amount),
            front_image_url: frontImage, // Store as base64 for now
            back_image_url: backImage, // Store as base64 for now
            status: 'pending',
          },
        ])
        .select()
        .single()

      if (depositError) throw depositError

      // Create transaction record with MD format
      const transactionDate = new Date().toISOString()
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            account_id: selectedAccount,
            type: 'credit',
            category: 'Mobile Deposit',
            amount: parseFloat(amount),
            description: `MD – ${refNum}`,
            status: 'pending', // Will be updated when admin approves
            pending: true, // Pending until admin approval
            date: transactionDate,
          },
        ])
        .select()
        .single()

      if (transactionError) {
        console.error('Error creating transaction:', transactionError)
        // Don't fail the deposit if transaction creation fails, but log it
      } else {
        // Link transaction to deposit
        await supabase
          .from('mobile_deposits')
          .update({ transaction_id: transactionData.id })
          .eq('id', depositData.id)
      }

      // Create notification
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: user.id,
            type: 'transaction',
            title: 'Mobile Deposit Submitted',
            message: `Your mobile deposit of ${formatCurrency(parseFloat(amount))} has been submitted and is pending review. Reference: ${refNum}`,
            read: false,
          },
        ])

      // Send email notifications (non-blocking)
      const { sendMobileDepositNotification } = await import('@/lib/utils/emailNotifications')
      const selectedAccountData = accounts.find(acc => acc.id === selectedAccount)
      const accountType = selectedAccountData?.account_type || 'account'
      
      sendMobileDepositNotification(
        user.id,
        parseFloat(amount),
        accountType,
        refNum,
        depositId
      ).catch(error => {
        console.error('Error sending mobile deposit email notification:', error)
        // Don't fail the deposit if email fails
      })

      setIsProcessing(false)
      setCurrentStep('complete')
    } catch (error: any) {
      console.error('Error submitting deposit:', error)
      setIsProcessing(false)
      setCurrentStep('review')
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Deposit Failed',
        message: error.message || 'Failed to submit deposit. Please try again.',
      })
    }
  }

  const resetDeposit = () => {
    setCurrentStep('account')
    setSelectedAccount('')
    setAmount('')
    setFrontImage(null)
    setBackImage(null)
    setReferenceNumber('')
  }

  const selectedAcc = accounts.find(acc => acc.id === selectedAccount)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Mobile Cheque Deposit
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Deposit cheques instantly from your phone
          </p>
        </div>
        <button
          onClick={() => setShowLimits(true)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-sm font-semibold"
        >
          <Info className="w-4 h-4" />
          Deposit Limits
        </button>
      </div>

      {/* Info Banner */}
      {currentStep !== 'complete' && currentStep !== 'processing' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                Quick & Secure Deposits
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Deposit cheques 24/7 without visiting a branch. Funds typically available within 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      {currentStep !== 'complete' && currentStep !== 'processing' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = getStepIndex(step.id as DepositStep) < currentStepIndex
              const isCurrent = step.id === currentStep
              const isLast = index === steps.length - 1

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={clsx(
                        'w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all mb-2',
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isCurrent
                          ? 'bg-green-700 text-white scale-110'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <p
                      className={clsx(
                        'text-xs font-semibold text-center',
                        isCurrent
                          ? 'text-green-700 dark:text-green-400'
                          : isCompleted
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {step.label}
                    </p>
                  </div>
                  {!isLast && (
                    <div
                      className={clsx(
                        'h-1 flex-1 mx-2 rounded transition-all',
                        isCompleted
                          ? 'bg-green-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Step 1: Select Account */}
        {currentStep === 'account' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Select Deposit Account
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose which account to deposit the cheque into
              </p>
            </div>

            <div className="space-y-3">
              {accountsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Loading accounts...</p>
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No accounts available</p>
                </div>
              ) : (
                accounts.map((account) => {
                  const accountTypeLabel = account.account_type === 'fixed-deposit' 
                    ? 'Fixed Deposit' 
                    : account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)
                  
                  return (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccount(account.id)}
                  className={clsx(
                    'w-full p-4 rounded-xl border-2 transition-all text-left',
                    selectedAccount === account.id
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
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
                })
              )}
            </div>

            <button
              onClick={() => setCurrentStep('amount')}
              disabled={!selectedAccount}
              className="w-full px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Enter Amount */}
        {currentStep === 'amount' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Enter Cheque Amount
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter the exact amount shown on the cheque
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Cheque Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-3xl font-bold text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={depositLimits.perCheque}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field pl-12 pr-4 py-4 text-3xl font-bold"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Maximum per cheque: {formatCurrency(depositLimits.perCheque)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Depositing to:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedAcc ? (selectedAcc.account_type === 'fixed-deposit' ? 'Fixed Deposit' : selectedAcc.account_type.charAt(0).toUpperCase() + selectedAcc.account_type.slice(1)) + ' Account' : ''} • ••••{selectedAcc?.last4}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('account')}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('front')}
                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > depositLimits.perCheque}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Front Image */}
        {currentStep === 'front' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Capture Front of Cheque
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Take a clear photo of the front of your cheque
              </p>
            </div>

            {!frontImage ? (
              <div>
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload('front', file)
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => frontInputRef.current?.click()}
                  className="w-full aspect-[3/2] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-green-600 dark:hover:border-green-500 transition-all flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-green-700 dark:text-green-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      Take Photo or Upload
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tap to capture or select from gallery
                    </p>
                  </div>
                </button>

                {/* Tips */}
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Tips for best results:
                  </p>
                  <div className="space-y-2">
                    {[
                      'Place cheque on a dark, flat surface',
                      'Ensure all four corners are visible',
                      'Use good lighting (avoid shadows)',
                      'Keep camera steady and focused',
                      'Make sure all text is readable',
                    ].map((tip, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border-2 border-green-600">
                  <img src={frontImage} alt="Front of cheque" className="w-full" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => setFrontImage(null)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                    Image captured successfully
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('amount')}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('back')}
                disabled={!frontImage}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Back Image */}
        {currentStep === 'back' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Capture Back of Cheque
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Endorse and photograph the back of your cheque
              </p>
            </div>

            {!backImage ? (
              <div>
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload('back', file)
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => backInputRef.current?.click()}
                  className="w-full aspect-[3/2] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-green-600 dark:hover:border-green-500 transition-all flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-green-700 dark:text-green-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      Take Photo or Upload
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tap to capture or select from gallery
                    </p>
                  </div>
                </button>

                {/* Endorsement Instructions */}
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                        Important: Endorse Your Cheque
                      </p>
                      <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-3">
                        Before taking the photo, write on the back:
                      </p>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-300 dark:border-yellow-700">
                        <p className="text-sm font-mono text-gray-900 dark:text-white">
                          [Your Signature]
                        </p>
                        <p className="text-sm font-mono text-gray-900 dark:text-white">
                          For Mobile Deposit Only
                        </p>
                        <p className="text-sm font-mono text-gray-900 dark:text-white">
                          Liberty Bank
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border-2 border-green-600">
                  <img src={backImage} alt="Back of cheque" className="w-full" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => setBackImage(null)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                    Image captured successfully
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('front')}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('review')}
                disabled={!backImage}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 'review' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Review Deposit
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Verify all information before submitting
              </p>
            </div>

            <div className="space-y-4">
              {/* Deposit Details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Deposit to:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedAcc ? (selectedAcc.account_type === 'fixed-deposit' ? 'Fixed Deposit' : selectedAcc.account_type.charAt(0).toUpperCase() + selectedAcc.account_type.slice(1)) + ' Account' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Account:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ••••{selectedAcc?.last4}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(parseFloat(amount))}
                  </span>
                </div>
              </div>

              {/* Images Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Front
                  </p>
                  <img
                    src={frontImage!}
                    alt="Front"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Back
                  </p>
                  <img
                    src={backImage!}
                    alt="Back"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              {/* Important Notice */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      Keep Your Cheque
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      Please keep the physical cheque for 15 days after deposit. Do not destroy it until the deposit is fully processed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('back')}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Scan className="w-5 h-5" />
                Submit Deposit
              </button>
            </div>
          </div>
        )}

        {/* Processing */}
        {currentStep === 'processing' && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Scan className="w-10 h-10 text-green-700 dark:text-green-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Processing Your Deposit
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please wait while we verify your cheque...
            </p>
            <div className="max-w-md mx-auto space-y-3">
              {[
                'Verifying cheque authenticity',
                'Checking image quality',
                'Processing MICR data',
                'Validating endorsement',
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete */}
        {currentStep === 'complete' && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-700 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Deposit Submitted Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your cheque has been received and is being processed
            </p>

            <div className="max-w-md mx-auto space-y-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reference Number:</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">
                    {referenceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(parseFloat(amount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Account:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedAcc ? (selectedAcc.account_type === 'fixed-deposit' ? 'Fixed Deposit' : selectedAcc.account_type.charAt(0).toUpperCase() + selectedAcc.account_type.slice(1)) + ' Account' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold">
                    Pending Credit
                  </span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-left">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      Funds Availability
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      Funds will typically be available within 1-2 business days. You'll receive a notification once processed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 max-w-md mx-auto">
              <button
                onClick={resetDeposit}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all"
              >
                Make Another Deposit
              </button>
              <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all flex items-center gap-2">
                <Download className="w-5 h-5" />
                Receipt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Limits Modal */}
      {showLimits && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Deposit Limits</h2>
              <button
                onClick={() => setShowLimits(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Per Cheque</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(depositLimits.perCheque)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Daily Limit</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(depositLimits.daily)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(depositLimits.dailyUsed / depositLimits.daily) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Used: {formatCurrency(depositLimits.dailyUsed)} today
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Limit</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(depositLimits.monthly)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(depositLimits.monthlyUsed / depositLimits.monthly) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Used: {formatCurrency(depositLimits.monthlyUsed)} this month
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLimits(false)}
              className="w-full px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all"
            >
              Got It
            </button>
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
    </div>
  )
}

