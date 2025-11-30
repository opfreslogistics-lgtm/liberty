'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  type: NotificationType
  title: string
  message: string
  autoClose?: boolean
  autoCloseDelay?: number
}

export default function NotificationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 4000,
}: NotificationModalProps) {
  // Auto close after delay
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    const iconClass = 'w-8 h-8'
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />
      case 'error':
        return <XCircle className={`${iconClass} text-red-500`} />
      case 'warning':
        return <AlertCircle className={`${iconClass} text-yellow-500`} />
      case 'info':
        return <Info className={`${iconClass} text-blue-500`} />
      default:
        return <Info className={`${iconClass} text-blue-500`} />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-600 to-emerald-700',
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          button: 'bg-green-600 hover:bg-green-700',
        }
      case 'error':
        return {
          bg: 'from-red-600 to-rose-700',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          button: 'bg-red-600 hover:bg-red-700',
        }
      case 'warning':
        return {
          bg: 'from-yellow-600 to-amber-700',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          button: 'bg-yellow-600 hover:bg-yellow-700',
        }
      case 'info':
        return {
          bg: 'from-blue-600 to-cyan-700',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          button: 'bg-blue-600 hover:bg-blue-700',
        }
      default:
        return {
          bg: 'from-gray-600 to-gray-700',
          iconBg: 'bg-gray-100 dark:bg-gray-900/30',
          button: 'bg-gray-600 hover:bg-gray-700',
        }
    }
  }

  const colors = getColors()

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className={`bg-gradient-to-r ${colors.bg} p-6`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${colors.iconBg} rounded-full flex items-center justify-center`}>
              {getIcon()}
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 text-center leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full px-6 py-3 ${colors.button} text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

