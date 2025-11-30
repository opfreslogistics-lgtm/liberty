'use client'

import { CheckCircle, X, Copy, Clock, Building2, User, Wallet, Mail, Phone, Globe, DollarSign } from 'lucide-react'
import { formatCurrency, maskAccountNumber } from '@/lib/utils'
import { useState } from 'react'

interface TransferSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  transferType: 'internal' | 'external' | 'p2p' | 'wire'
  transferDetails: {
    amount: number
    fees?: number
    totalAmount?: number
    fromAccount: {
      name: string
      number: string
      type: string
    }
    toAccount?: {
      name: string
      number: string
      type?: string
    }
    recipientEmail?: string
    recipientPhone?: string
    routingNumber?: string
    accountNumber?: string
    bankName?: string
    swiftCode?: string
    referenceNumber: string
    date: string
    memo?: string
    purpose?: string
    currency?: string
    transferType?: string
    beneficiaryName?: string
  }
}

export default function TransferSuccessModal({
  isOpen,
  onClose,
  transferType,
  transferDetails,
}: TransferSuccessModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTransferTypeLabel = () => {
    switch (transferType) {
      case 'internal':
        return 'Internal Transfer'
      case 'external':
        return 'External Transfer'
      case 'p2p':
        return 'Peer-to-Peer Transfer'
      case 'wire':
        return 'Wire Transfer'
      default:
        return 'Transfer'
    }
  }

  const getTransferTypeIcon = () => {
    switch (transferType) {
      case 'internal':
        return <Wallet className="w-6 h-6" />
      case 'external':
        return <Building2 className="w-6 h-6" />
      case 'p2p':
        return <User className="w-6 h-6" />
      case 'wire':
        return <Globe className="w-6 h-6" />
      default:
        return <Wallet className="w-6 h-6" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{getTransferTypeLabel()} Successful!</h2>
              <p className="text-sm text-white/80">Transaction completed successfully</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Amount */}
          <div className="text-center py-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {transferType === 'wire' && transferDetails.fees ? 'Total Amount (incl. fees)' : 'Transfer Amount'}
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(transferDetails.totalAmount || transferDetails.amount)}
            </p>
            {transferType === 'wire' && transferDetails.fees && (
              <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Transfer:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(transferDetails.amount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Fees:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(transferDetails.fees)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Transfer Details */}
          <div className="space-y-3">
            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">From Account</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{transferDetails.fromAccount.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {transferDetails.fromAccount.number}
                  </p>
                </div>
              </div>
            </div>

            {/* To Account/Recipient */}
            {transferType === 'internal' && transferDetails.toAccount && (
              <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">To Account</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{transferDetails.toAccount.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transferDetails.toAccount.number}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {transferType === 'p2p' && (
              <div className="space-y-2">
                {transferDetails.recipientEmail && (
                  <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Recipient Email</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{transferDetails.recipientEmail}</p>
                      </div>
                    </div>
                  </div>
                )}
                {transferDetails.recipientPhone && (
                  <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Recipient Phone</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{transferDetails.recipientPhone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(transferType === 'external' || transferType === 'wire') && (
              <div className="space-y-2">
                {transferType === 'wire' && transferDetails.beneficiaryName && (
                  <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Beneficiary Name</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{transferDetails.beneficiaryName}</p>
                      </div>
                    </div>
                  </div>
                )}
                {transferDetails.bankName && (
                  <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Bank Name</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{transferDetails.bankName}</p>
                      </div>
                    </div>
                  </div>
                )}
                {transferDetails.accountNumber && (
                  <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Account Number</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {maskAccountNumber(transferDetails.accountNumber)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {transferDetails.routingNumber && (
                  <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Routing Number</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {maskAccountNumber(transferDetails.routingNumber)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {transferType === 'wire' && transferDetails.swiftCode && (
                  <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">SWIFT Code</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{transferDetails.swiftCode}</p>
                      </div>
                    </div>
                  </div>
                )}
                {transferType === 'wire' && transferDetails.currency && (
                  <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Currency</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{transferDetails.currency}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reference Number */}
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Reference Number</p>
                  <p className="font-mono font-semibold text-blue-900 dark:text-blue-300">
                    {transferDetails.referenceNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(transferDetails.referenceNumber)}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Copy reference number"
              >
                <Copy className={`w-4 h-4 ${copied ? 'text-green-600' : 'text-blue-600 dark:text-blue-400'}`} />
              </button>
            </div>

            {/* Date */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Transaction Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(transferDetails.date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Memo */}
            {transferDetails.memo && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Memo</p>
                <p className="text-sm text-gray-900 dark:text-white">{transferDetails.memo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

