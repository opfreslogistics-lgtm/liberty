'use client'

import { useState, useEffect } from 'react'
import { X, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

type CodeType = 'IMF' | 'COT' | 'TAN'

interface RequiredCode {
  type: CodeType
  value: string
  enabled: boolean
}

interface TransactionCodeValidatorProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  requiredCodes: RequiredCode[]
}

export default function TransactionCodeValidator({
  isOpen,
  onClose,
  onSuccess,
  requiredCodes,
}: TransactionCodeValidatorProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [validatedCodes, setValidatedCodes] = useState<string[]>([])

  // Filter only enabled codes
  const enabledCodes = requiredCodes.filter(code => code.enabled)

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setInputValue('')
      setError('')
      setValidatedCodes([])
    }
  }, [isOpen])

  // Auto-focus input when step changes
  useEffect(() => {
    if (isOpen && enabledCodes.length > 0) {
      const input = document.getElementById('code-input')
      if (input) {
        setTimeout(() => input.focus(), 100)
      }
    }
  }, [currentStep, isOpen, enabledCodes.length])

  const currentCode = enabledCodes[currentStep]

  const handleValidate = async () => {
    if (!currentCode) return

    setError('')
    
    if (!inputValue.trim()) {
      setError(`Please enter your ${currentCode.type} code`)
      return
    }

    // Always show loading animation first (even for wrong codes)
    setIsLoading(true)
    
    // Wait a bit to show loading animation
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Validate the code after loading animation
    if (inputValue.trim() !== currentCode.value) {
      setIsLoading(false)
      setError(`Invalid ${currentCode.type} code. Please try again.`)
      setInputValue('')
      return
    }

    // Code is valid - continue with success flow
    setValidatedCodes(prev => [...prev, currentCode.type])
    
    // Show success for valid code
    await new Promise(resolve => setTimeout(resolve, 800))

    setIsLoading(false)

    // Check if there are more codes to validate
    if (currentStep < enabledCodes.length - 1) {
      // Move to next code
      setCurrentStep(prev => prev + 1)
      setInputValue('')
      setError('')
    } else {
      // All codes validated - success!
      await new Promise(resolve => setTimeout(resolve, 300))
      onSuccess()
      onClose()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleValidate()
    }
  }

  if (!isOpen || enabledCodes.length === 0) {
    // If no codes required, immediately call onSuccess
    if (isOpen && enabledCodes.length === 0) {
      onSuccess()
      return null
    }
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Transaction Verification</h2>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            {enabledCodes.map((code, index) => (
              <div
                key={code.type}
                className={`flex-1 flex items-center ${
                  index < enabledCodes.length - 1 ? 'mr-2' : ''
                }`}
              >
                <div
                  className={`flex-1 h-2 rounded-full ${
                    validatedCodes.includes(code.type)
                      ? 'bg-green-500'
                      : index === currentStep
                      ? 'bg-red-600'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
                {index < enabledCodes.length - 1 && (
                  <div
                    className={`w-2 h-2 rounded-full mx-1 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
                <CheckCircle className="w-8 h-8 text-green-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                Verifying {currentCode?.type} Code...
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Please wait while we validate your code
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Enter Your {currentCode?.type} Code
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentStep === 0
                    ? 'Please enter your verification code to proceed with this transaction.'
                    : 'Please enter the next verification code to continue.'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {currentCode?.type} Code *
                  </label>
                  <input
                    id="code-input"
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value)
                      setError('')
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={`Enter your ${currentCode?.type} code`}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900 dark:text-white text-center text-lg font-mono tracking-wider ${
                      error
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                    autoFocus
                    disabled={isLoading}
                  />
                  {error && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleValidate}
                    disabled={!inputValue.trim() || isLoading}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Verify & Continue
                  </button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
                  <strong>Security:</strong> Your verification codes are encrypted and secure. Never share them with anyone.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

