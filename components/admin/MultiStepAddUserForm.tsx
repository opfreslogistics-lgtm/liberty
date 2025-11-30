'use client'

import { useState } from 'react'
import {
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  CreditCard,
  Shield,
  FileText,
  Building2,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Upload,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react'

type EmploymentStatus = 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired' | 'other'
type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say'
type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated'
type AccountType = 'checking' | 'savings' | 'business' | 'fixed-deposit' | 'investment'

interface MultiStepAddUserFormProps {
  onSubmit: (formData: any) => Promise<void>
  onCancel: () => void
  loading: boolean
  currentUserRole: 'user' | 'admin' | 'superadmin' | null
}

const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What city were you born in?',
  'What was your mother\'s maiden name?',
  'What was the name of your elementary school?',
  'What was your childhood nickname?',
  'What was the make of your first car?',
  'What is your favorite movie?',
  'What is your favorite book?',
]

export default function MultiStepAddUserForm({
  onSubmit,
  onCancel,
  loading,
  currentUserRole,
}: MultiStepAddUserFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data matching signup form structure
  const [formData, setFormData] = useState({
    // Step 1: Basic Auth Info
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Personal Information
    phone: '',
    dateOfBirth: '',
    gender: '' as Gender | '',
    maritalStatus: '' as MaritalStatus | '',
    ssn: '',
    nationality: '',
    idCardFront: null as File | null,
    idCardBack: null as File | null,
    idCardFrontPreview: null as string | null,
    idCardBackPreview: null as string | null,
    // Step 3: Address Information
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    // Step 4: Employment & Financial
    employmentStatus: '' as EmploymentStatus | '',
    employerName: '',
    jobTitle: '',
    employmentYears: '',
    annualIncome: '',
    monthlyIncome: '',
    creditScore: '650',
    totalAssets: '',
    monthlyExpenses: '',
    // Step 5: Security Questions
    securityQuestion1: '',
    securityAnswer1: '',
    securityQuestion2: '',
    securityAnswer2: '',
    securityQuestion3: '',
    securityAnswer3: '',
    preferredLanguage: 'en',
    referralSource: '',
    marketingConsent: false,
    // Step 6: Account Types & Role
    role: 'user' as 'user' | 'admin',
    createAccounts: true,
    accountTypes: [] as AccountType[],
  })

  const [profilePicFile, setProfilePicFile] = useState<File | null>(null)
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null)

  // Handle step navigation
  const handleNext = () => {
    setError(null)
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
    }
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setError(null)
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinalSubmit = async () => {
    setError(null)
    
    if (formData.createAccounts && formData.accountTypes.length === 0) {
      setError('Please select at least one account type or disable account creation')
      return
    }

    if (formData.createAccounts && formData.accountTypes.length > 3) {
      setError('You can select a maximum of 3 account types')
      return
    }

    try {
      await onSubmit({
        ...formData,
        profilePicFile,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    }
  }

  const toggleAccountType = (type: AccountType) => {
    if (formData.accountTypes.includes(type)) {
      setFormData({ ...formData, accountTypes: formData.accountTypes.filter(t => t !== type) })
    } else {
      if (formData.accountTypes.length < 3) {
        setFormData({ ...formData, accountTypes: [...formData.accountTypes, type] })
      }
    }
  }

  // Credit score helpers
  const getCreditScoreColor = (score: number): string => {
    if (score >= 750) return '#10b981'
    if (score >= 700) return '#22c55e'
    if (score >= 650) return '#84cc16'
    if (score >= 600) return '#eab308'
    if (score >= 550) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New User</h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex-1 h-2 rounded-full ${
                    currentStep >= step ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`} />
                  {step < 6 && (
                    <div className={`flex-1 h-0.5 mx-1 ${
                      currentStep > step ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span className={currentStep >= 1 ? 'text-red-600 font-semibold' : ''}>Basic</span>
              <span className={currentStep >= 2 ? 'text-red-600 font-semibold' : ''}>Personal</span>
              <span className={currentStep >= 3 ? 'text-red-600 font-semibold' : ''}>Address</span>
              <span className={currentStep >= 4 ? 'text-red-600 font-semibold' : ''}>Financial</span>
              <span className={currentStep >= 5 ? 'text-red-600 font-semibold' : ''}>Security</span>
              <span className={currentStep >= 6 ? 'text-red-600 font-semibold' : ''}>Accounts</span>
            </div>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300 flex-1">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Auth Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Basic Information</h3>
                <p className="text-gray-600 dark:text-gray-400">Step 1 of 6 - Create user credentials</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900 dark:text-white"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900 dark:text-white"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900 dark:text-white"
                      placeholder="johndoe"
                      required
                      minLength={3}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and underscores</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900 dark:text-white"
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900 dark:text-white"
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900 dark:text-white"
                      placeholder="Confirm your password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information - Placeholder for now */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personal Information</h3>
                <p className="text-gray-600 dark:text-gray-400">Step 2 of 6</p>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Personal information form fields will go here...</p>
            </div>
          )}

          {/* Step 6: Account Types & Role */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Account Types</h3>
                <p className="text-gray-600 dark:text-gray-400">Step 6 of 6 - Final Step!</p>
              </div>

              {/* Account Type Selection */}
              <div>
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.createAccounts}
                    onChange={(e) => setFormData({ ...formData, createAccounts: e.target.checked, accountTypes: e.target.checked ? [] : [] })}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                  />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Create bank accounts for this user
                  </span>
                </label>

                {formData.createAccounts && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select up to 3 account types. Each account will automatically receive a unique account number and debit card.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {([
                        { id: 'checking' as AccountType, name: 'Checking Account', icon: CreditCard, desc: 'Daily transactions', color: 'from-blue-500 to-blue-600' },
                        { id: 'savings' as AccountType, name: 'Savings Account', icon: Building2, desc: 'Earn interest', color: 'from-green-500 to-green-600' },
                        { id: 'business' as AccountType, name: 'Business Account', icon: Briefcase, desc: 'Business banking', color: 'from-purple-500 to-purple-600' },
                        { id: 'fixed-deposit' as AccountType, name: 'Fixed Deposit', icon: FileText, desc: 'Fixed term savings', color: 'from-orange-500 to-orange-600' },
                        { id: 'investment' as AccountType, name: 'Investment Account', icon: Award, desc: 'Investment portfolio', color: 'from-indigo-500 to-indigo-600' },
                      ]).map((type) => {
                        const Icon = type.icon
                        const isSelected = formData.accountTypes.includes(type.id)
                        const isDisabled = !isSelected && formData.accountTypes.length >= 3
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => toggleAccountType(type.id)}
                            disabled={isDisabled}
                            className={`p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                              isSelected
                                ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                                : isDisabled
                                ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                                : 'border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-600'
                            }`}
                          >
                            {isSelected && (
                              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${type.color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
                            )}
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-3">
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                                )}
                              </div>
                              <h4 className="font-bold text-gray-900 dark:text-white mb-1">{type.name}</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{type.desc}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {formData.accountTypes.length}/3 selected
                    </p>
                  </div>
                )}

                {/* Role Selection */}
                {(currentUserRole === 'superadmin' || currentUserRole === 'admin') && (
                  <div className="mt-8">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">User Role</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'user' })}
                        className={`p-5 rounded-xl border-2 transition-all text-left ${
                          formData.role === 'user'
                            ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          {formData.role === 'user' && (
                            <CheckCircle2 className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Regular User</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Standard user access</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'admin' })}
                        className={`p-5 rounded-xl border-2 transition-all text-left ${
                          formData.role === 'admin'
                            ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                          {formData.role === 'admin' && (
                            <CheckCircle2 className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Admin</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Admin dashboard access</p>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Navigation */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={currentStep === 1 ? onCancel : handlePrevious}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {currentStep === 1 ? (
                <>Cancel</>
              ) : (
                <>
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </>
              )}
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading || (formData.createAccounts && formData.accountTypes.length === 0)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create User
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

