'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AuthGuidanceSidebar } from '@/components/auth/AuthGuidanceSidebar'
import AuthTopBar from '@/components/auth/AuthTopBar'
import Link from 'next/link'
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  CreditCard,
  Shield,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Heart,
  DollarSign,
  Globe,
  Award,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react'
import { generateAccountWithLast4 } from '@/lib/utils/accountGeneration'
import { generateCard } from '@/lib/utils/cardGeneration'

// Account types - 5 types, user can select up to 3
type AccountType = 'checking' | 'savings' | 'business' | 'fixed-deposit' | 'investment'
type Role = 'user' | 'superadmin'
type EmploymentStatus = 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired' | 'other'
type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say'
type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated'

// Step 1: Basic Auth Info
interface Step1Data {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

// Step 2: Personal Information
interface Step2Data {
  phone: string
  dateOfBirth: string
  gender: Gender
  maritalStatus: MaritalStatus
  ssn: string
  nationality: string
  idCardFront: File | null
  idCardBack: File | null
  idCardFrontPreview: string | null
  idCardBackPreview: string | null
}

// Step 3: Address Information
interface Step3Data {
  address: string
  addressLine2: string
  city: string
  state: string
  zipCode: string
  country: string
}

// Step 4: Employment & Financial
interface Step4Data {
  employmentStatus: EmploymentStatus
  employerName: string
  jobTitle: string
  employmentYears: string
  annualIncome: string
  monthlyIncome: string
  creditScore: string
  totalAssets: string
  monthlyExpenses: string
}

// Step 5: Security Questions
interface Step5Data {
  securityQuestion1: string
  securityAnswer1: string
  securityQuestion2: string
  securityAnswer2: string
  securityQuestion3: string
  securityAnswer3: string
  preferredLanguage: string
  referralSource: string
  marketingConsent: boolean
}

// Step 6: Account Types & Role
interface Step6Data {
  accountTypes: AccountType[]
  role: Role
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

// Credit Score Helper Functions
const getCreditScoreColor = (score: number): string => {
  if (score >= 750) return '#10b981' // Green - Excellent
  if (score >= 700) return '#22c55e' // Light Green - Very Good
  if (score >= 650) return '#84cc16' // Lime - Good
  if (score >= 600) return '#eab308' // Yellow - Fair
  if (score >= 550) return '#f59e0b' // Orange - Poor
  return '#ef4444' // Red - Very Poor
}

const getCreditScoreRating = (score: number): string => {
  if (score >= 750) return 'Excellent'
  if (score >= 700) return 'Very Good'
  if (score >= 650) return 'Good'
  if (score >= 600) return 'Fair'
  if (score >= 550) return 'Poor'
  return 'Very Poor'
}

export default function SignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userId, setUserId] = useState<string | null>(null) // Store user ID after Step 1

  // Step 1: Basic Auth Info
  const [step1Data, setStep1Data] = useState<Step1Data>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Step 2: Personal Information
  const [step2Data, setStep2Data] = useState<Step2Data>({
    phone: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    maritalStatus: 'single',
    ssn: '',
    nationality: 'United States',
    idCardFront: null,
    idCardBack: null,
    idCardFrontPreview: null,
    idCardBackPreview: null,
  })
  const [uploadingIdCards, setUploadingIdCards] = useState(false)

  // Step 3: Address Information
  const [step3Data, setStep3Data] = useState<Step3Data>({
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  })

  // Step 4: Employment & Financial
  const [step4Data, setStep4Data] = useState<Step4Data>({
    employmentStatus: 'employed',
    employerName: '',
    jobTitle: '',
    employmentYears: '',
    annualIncome: '',
    monthlyIncome: '',
    creditScore: '650', // Default credit score
    totalAssets: '',
    monthlyExpenses: '',
  })

  // Step 5: Security Questions
  const [step5Data, setStep5Data] = useState<Step5Data>({
    securityQuestion1: '',
    securityAnswer1: '',
    securityQuestion2: '',
    securityAnswer2: '',
    securityQuestion3: '',
    securityAnswer3: '',
    preferredLanguage: 'en',
    referralSource: '',
    marketingConsent: false,
  })

  // Step 6: Account Types & Role
  const [step6Data, setStep6Data] = useState<Step6Data>({
    accountTypes: [],
    role: 'user',
  })

  // Toggle account type selection
  const toggleAccountType = (type: AccountType) => {
    setStep6Data(prev => {
      const isSelected = prev.accountTypes.includes(type)
      
      if (isSelected) {
        // Allow deselecting if more than one is selected
        if (prev.accountTypes.length > 1) {
          return {
            ...prev,
            accountTypes: prev.accountTypes.filter(t => t !== type),
          }
        }
        return prev // Can't deselect if only one is selected
      } else {
        // Only allow selecting if less than 3 are selected
        if (prev.accountTypes.length < 3) {
          return {
            ...prev,
            accountTypes: [...prev.accountTypes, type],
          }
        }
        return prev
      }
    })
  }

  // Step 1: Create Auth Account
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!step1Data.firstName.trim() || !step1Data.lastName.trim()) {
      setError('Please enter your full name')
      return
    }

    if (!step1Data.username.trim() || step1Data.username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (!step1Data.email.trim() || !step1Data.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (step1Data.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (step1Data.password !== step1Data.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', step1Data.username.toLowerCase())
        .maybeSingle()

      if (existingUser) {
        setError('Username is already taken. Please choose another.')
        setLoading(false)
        return
      }

      // Create Supabase auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          data: {
            first_name: step1Data.firstName,
            last_name: step1Data.lastName,
            username: step1Data.username,
          },
        },
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Failed to create account')
      }

      // Create user profile with basic info
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: step1Data.email,
          first_name: step1Data.firstName,
          last_name: step1Data.lastName,
          username: step1Data.username.toLowerCase(),
          role: 'user', // Will be updated in Step 6
          signup_step: 2,
          signup_complete: false,
          account_status: 'active',
        })

      if (profileError) {
        // If profile already exists, update it
        if (profileError.code === '23505') {
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              email: step1Data.email,
              first_name: step1Data.firstName,
              last_name: step1Data.lastName,
              username: step1Data.username.toLowerCase(),
              signup_step: 2,
              signup_complete: false,
            })
            .eq('id', authData.user.id)

          if (updateError) throw updateError
        } else {
          throw profileError
        }
      }

      // Store user ID for next steps
      setUserId(authData.user.id)

      // Move to step 2
      setCurrentStep(2)
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          // Load existing profile data if signup incomplete
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('signup_step, signup_complete, role')
            .eq('id', user.id)
            .single()
          
          if (profile && !profile.signup_complete) {
            setCurrentStep(profile.signup_step || 2)
            loadSavedData(user.id, profile.signup_step || 2)
          } else if (profile?.signup_complete) {
            // Redirect if signup already complete
            if (profile.role === 'superadmin' || profile.role === 'admin') {
              router.push('/admin')
            } else {
              router.push('/dashboard')
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      }
    }
    checkSession()
  }, [router])

  // Update slider thumb color dynamically when credit score changes
  useEffect(() => {
    if (currentStep === 4) {
      const slider = document.getElementById('credit-score-range-input') as HTMLInputElement
      if (slider) {
        const score = parseInt(step4Data.creditScore || '650')
        const color = getCreditScoreColor(score)
        
        // Create or update style tag for slider thumb
        let styleTag = document.getElementById('credit-score-slider-styles')
        if (!styleTag) {
          styleTag = document.createElement('style')
          styleTag.id = 'credit-score-slider-styles'
          document.head.appendChild(styleTag)
        }
        
        styleTag.textContent = `
          #credit-score-range-input::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: ${color};
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transition: background 0.2s ease;
          }
          #credit-score-range-input::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: ${color};
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transition: background 0.2s ease;
          }
          #credit-score-range-input::-ms-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: ${color};
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
        `
      }
    }
  }, [step4Data.creditScore, currentStep])

  // Load saved data for incomplete signup
  const loadSavedData = async (userId: string, step: number) => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!profile) return

      // Load Step 2 data
      if (step >= 2) {
        setStep2Data({
          phone: profile.phone || '',
          dateOfBirth: profile.date_of_birth || '',
          gender: (profile.gender as Gender) || 'prefer-not-to-say',
          maritalStatus: (profile.marital_status as MaritalStatus) || 'single',
          ssn: profile.ssn || '',
          nationality: profile.nationality || 'United States',
          idCardFront: null,
          idCardBack: null,
          idCardFrontPreview: profile.driver_license_front_url || null,
          idCardBackPreview: profile.driver_license_back_url || null,
        })
      }

      // Load Step 3 data
      if (step >= 3) {
        setStep3Data({
          address: profile.address || '',
          addressLine2: profile.address_line_2 || '',
          city: profile.city || '',
          state: profile.state || '',
          zipCode: profile.zip_code || '',
          country: profile.country || 'United States',
        })
      }

      // Load Step 4 data
      if (step >= 4) {
        setStep4Data({
          employmentStatus: (profile.employment_status as EmploymentStatus) || 'employed',
          employerName: profile.employer_name || '',
          jobTitle: profile.job_title || '',
          employmentYears: profile.employment_years?.toString() || '',
          annualIncome: profile.annual_income?.toString() || '',
          monthlyIncome: profile.monthly_income?.toString() || '',
          creditScore: profile.credit_score?.toString() || '650',
          totalAssets: profile.total_assets?.toString() || '',
          monthlyExpenses: profile.monthly_expenses?.toString() || '',
        })
      }

      // Load Step 5 data
      if (step >= 5) {
        setStep5Data({
          securityQuestion1: profile.security_question_1 || '',
          securityAnswer1: profile.security_answer_1 || '',
          securityQuestion2: profile.security_question_2 || '',
          securityAnswer2: profile.security_answer_2 || '',
          securityQuestion3: profile.security_question_3 || '',
          securityAnswer3: profile.security_answer_3 || '',
          preferredLanguage: profile.preferred_language || 'en',
          referralSource: profile.referral_source || '',
          marketingConsent: profile.marketing_consent || false,
        })
      }

      // Load Step 6 data (account types from existing accounts)
      if (step >= 6) {
        const { data: accounts } = await supabase
          .from('accounts')
          .select('account_type')
          .eq('user_id', userId)

        const existingAccountTypes: AccountType[] = accounts?.map(acc => acc.account_type as AccountType) || []
        
        setStep6Data({
          accountTypes: existingAccountTypes,
          role: (profile.role as Role) || 'user',
        })
      }
    } catch (error) {
      console.error('Error loading saved data:', error)
    }
  }

  // Upload ID card images to Supabase Storage
  const uploadIdCard = async (file: File, type: 'front' | 'back'): Promise<string> => {
    if (!userId) throw new Error('User not authenticated')

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/id-cards/${type}_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    return publicUrl
  }

  // Handle ID card file selection
  const handleIdCardUpload = async (file: File | null, type: 'front' | 'back') => {
    if (!file) {
      if (type === 'front') {
        setStep2Data(prev => ({ ...prev, idCardFront: null, idCardFrontPreview: null }))
      } else {
        setStep2Data(prev => ({ ...prev, idCardBack: null, idCardBackPreview: null }))
      }
      return
    }

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, or WEBP image.')
      return
    }

    if (file.size > maxSize) {
      setError('File size exceeds 5MB limit.')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'front') {
        setStep2Data(prev => ({ ...prev, idCardFront: file, idCardFrontPreview: reader.result as string }))
      } else {
        setStep2Data(prev => ({ ...prev, idCardBack: file, idCardBackPreview: reader.result as string }))
      }
    }
    reader.readAsDataURL(file)
  }

  // Step 2: Save Personal Information
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!userId) {
      setError('Please complete Step 1 first')
      return
    }

    if (!step2Data.phone.trim()) {
      setError('Please enter your phone number')
      return
    }

    if (!step2Data.dateOfBirth) {
      setError('Please enter your date of birth')
      return
    }

    if (!step2Data.idCardFront) {
      setError('Please upload the front of your ID card')
      return
    }

    if (!step2Data.idCardBack) {
      setError('Please upload the back of your ID card')
      return
    }

    setLoading(true)
    setUploadingIdCards(true)

    try {
      // Upload ID card images
      const [frontUrl, backUrl] = await Promise.all([
        uploadIdCard(step2Data.idCardFront, 'front'),
        uploadIdCard(step2Data.idCardBack, 'back'),
      ])

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          phone: step2Data.phone,
          date_of_birth: step2Data.dateOfBirth,
          gender: step2Data.gender,
          marital_status: step2Data.maritalStatus,
          ssn: step2Data.ssn || null,
          nationality: step2Data.nationality,
          driver_license_front_url: frontUrl,
          driver_license_back_url: backUrl,
          signup_step: 3,
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setCurrentStep(3)
    } catch (err: any) {
      setError(err.message || 'Failed to save information. Please try again.')
    } finally {
      setLoading(false)
      setUploadingIdCards(false)
    }
  }

  // Step 3: Save Address Information
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!userId) {
      setError('Please complete Step 1 first')
      return
    }

    if (!step3Data.address.trim() || !step3Data.city.trim() || !step3Data.state.trim() || !step3Data.zipCode.trim()) {
      setError('Please complete all required address fields')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          address: step3Data.address,
          address_line_2: step3Data.addressLine2 || null,
          city: step3Data.city,
          state: step3Data.state,
          zip_code: step3Data.zipCode,
          country: step3Data.country,
          signup_step: 4,
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setCurrentStep(4)
    } catch (err: any) {
      setError(err.message || 'Failed to save address. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Save Employment & Financial Information
  const handleStep4 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!userId) {
      setError('Please complete Step 1 first')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          employment_status: step4Data.employmentStatus,
          employer_name: step4Data.employerName || null,
          job_title: step4Data.jobTitle || null,
          employment_years: step4Data.employmentYears ? parseInt(step4Data.employmentYears) : null,
          annual_income: step4Data.annualIncome ? parseFloat(step4Data.annualIncome) : null,
          monthly_income: step4Data.monthlyIncome ? parseFloat(step4Data.monthlyIncome) : null,
          credit_score: step4Data.creditScore ? parseInt(step4Data.creditScore) : 650,
          total_assets: step4Data.totalAssets ? parseFloat(step4Data.totalAssets) : null,
          monthly_expenses: step4Data.monthlyExpenses ? parseFloat(step4Data.monthlyExpenses) : null,
          signup_step: 5,
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setCurrentStep(5)
    } catch (err: any) {
      setError(err.message || 'Failed to save information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 5: Save Security Questions
  const handleStep5 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!userId) {
      setError('Please complete Step 1 first')
      return
    }

    if (!step5Data.securityQuestion1 || !step5Data.securityAnswer1) {
      setError('Please provide at least one security question and answer')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          security_question_1: step5Data.securityQuestion1,
          security_answer_1: step5Data.securityAnswer1,
          security_question_2: step5Data.securityQuestion2 || null,
          security_answer_2: step5Data.securityAnswer2 || null,
          security_question_3: step5Data.securityQuestion3 || null,
          security_answer_3: step5Data.securityAnswer3 || null,
          preferred_language: step5Data.preferredLanguage,
          referral_source: step5Data.referralSource || null,
          marketing_consent: step5Data.marketingConsent,
          signup_step: 6,
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setCurrentStep(6)
    } catch (err: any) {
      setError(err.message || 'Failed to save security information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 6: Create Accounts, Cards, and Complete Signup
  const handleStep6 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!userId) {
      setError('Please complete Step 1 first')
      return
    }

    if (step6Data.accountTypes.length === 0) {
      setError('Please select at least one account type')
      return
    }

    setLoading(true)

    try {
      // Get user profile for cardholder name
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single()

      if (!profile) throw new Error('User profile not found')

      const cardholderName = `${profile.first_name} ${profile.last_name}`.trim()

      // Check existing accounts
      const { data: existingAccounts } = await supabase
        .from('accounts')
        .select('account_type')
        .eq('user_id', userId)

      const existingAccountTypes = existingAccounts?.map(acc => acc.account_type) || []

      // Create accounts and cards for selected account types
      for (const accountType of step6Data.accountTypes) {
        // Skip if account already exists
        if (existingAccountTypes.includes(accountType)) {
          console.log(`Account type ${accountType} already exists, skipping...`)
          continue
        }

        // Generate account number
        const { accountNumber, last4 } = await generateAccountWithLast4()

        // Create account
        const { data: newAccount, error: accountError } = await supabase
          .from('accounts')
          .insert({
            user_id: userId,
            account_type: accountType,
            account_number: accountNumber,
            balance: 0.00,
            status: 'active',
            last4: last4,
          })
          .select()
          .single()

        if (accountError) {
          console.error(`Error creating ${accountType} account:`, accountError)
          continue
        }

        // Generate card for account
        const cardDetails = generateCard()
        const cardLast4 = cardDetails.cardNumber.slice(-4)

        // Create card
        const { error: cardError } = await supabase
          .from('cards')
          .insert({
            account_id: newAccount.id,
            user_id: userId,
            card_number: cardDetails.cardNumber,
            cardholder_name: cardholderName,
            expiry_month: parseInt(cardDetails.expirationMonth),
            expiry_year: 2000 + parseInt(cardDetails.expirationYear), // Convert YY to YYYY
            cvv: cardDetails.cvv,
            card_type: 'debit',
            status: 'active',
            last4: cardLast4,
            brand: cardDetails.cardNetwork === 'visa' ? 'Visa' : cardDetails.cardNetwork === 'mastercard' ? 'Mastercard' : 'Amex',
            card_network: cardDetails.cardNetwork, // Save card network for useCards hook
          })

        if (cardError) {
          console.error(`Error creating card for ${accountType} account:`, cardError)
        }
      }

      // Update user profile with role and complete signup
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          role: step6Data.role,
          signup_step: 6,
          signup_complete: true,
          account_status: 'active',
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // Redirect based on role
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (step6Data.role === 'superadmin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration. Please try again.')
      setLoading(false)
    }
  }

  // Render UI - will be added in next part
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <AuthTopBar />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <AuthGuidanceSidebar type="signup" currentStep={currentStep} />
        <div className="flex-1 flex items-start justify-start p-4 lg:p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-8">
          <div className="w-full max-w-4xl mx-auto">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex-1 h-2 rounded-full ${
                      currentStep >= step ? 'bg-green-700' : 'bg-gray-300 dark:bg-gray-700'
                    }`} />
                    {step < 6 && (
                      <div className={`flex-1 h-0.5 mx-1 ${
                        currentStep > step ? 'bg-green-700' : 'bg-gray-300 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span className={currentStep >= 1 ? 'text-green-700 dark:text-green-400 font-semibold' : ''}>Basic</span>
                <span className={currentStep >= 2 ? 'text-green-700 dark:text-green-400 font-semibold' : ''}>Personal</span>
                <span className={currentStep >= 3 ? 'text-green-700 dark:text-green-400 font-semibold' : ''}>Address</span>
                <span className={currentStep >= 4 ? 'text-green-700 dark:text-green-400 font-semibold' : ''}>Financial</span>
                <span className={currentStep >= 5 ? 'text-green-700 dark:text-green-400 font-semibold' : ''}>Security</span>
                <span className={currentStep >= 6 ? 'text-green-700 dark:text-green-400 font-semibold' : ''}>Accounts</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300 flex-1">{error}</p>
              </div>
            )}

            {/* Step 1: Basic Auth Info */}
            {currentStep === 1 && (
              <form onSubmit={handleStep1} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                    Create Your Account
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Step 1 of 6 - Basic Information</p>
                </div>

                <div className="space-y-6">
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={step1Data.firstName}
                          onChange={(e) => setStep1Data({ ...step1Data, firstName: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
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
                          value={step1Data.lastName}
                          onChange={(e) => setStep1Data({ ...step1Data, lastName: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Username *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={step1Data.username}
                        onChange={(e) => setStep1Data({ ...step1Data, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="johndoe"
                        required
                        minLength={3}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Only lowercase letters, numbers, and underscores</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={step1Data.email}
                        onChange={(e) => setStep1Data({ ...step1Data, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="john.doe@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={step1Data.password}
                        onChange={(e) => setStep1Data({ ...step1Data, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={step1Data.confirmPassword}
                        onChange={(e) => setStep1Data({ ...step1Data, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="Confirm your password"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Continue to Step 2
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <form onSubmit={handleStep2} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                    Personal Information
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Step 2 of 6</p>
                </div>

                <div className="space-y-6">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={step2Data.phone}
                        onChange={(e) => setStep2Data({ ...step2Data, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Date of Birth *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={step2Data.dateOfBirth}
                        onChange={(e) => setStep2Data({ ...step2Data, dateOfBirth: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Gender & Marital Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Gender
                      </label>
                      <select
                        value={step2Data.gender}
                        onChange={(e) => setStep2Data({ ...step2Data, gender: e.target.value as Gender })}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                      >
                        <option value="prefer-not-to-say">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Marital Status
                      </label>
                      <select
                        value={step2Data.maritalStatus}
                        onChange={(e) => setStep2Data({ ...step2Data, maritalStatus: e.target.value as MaritalStatus })}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                      >
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                        <option value="separated">Separated</option>
                      </select>
                    </div>
                  </div>

                  {/* SSN */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      SSN / Tax ID
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={step2Data.ssn}
                        onChange={(e) => setStep2Data({ ...step2Data, ssn: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="XXX-XX-XXXX"
                      />
                    </div>
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={step2Data.nationality}
                      onChange={(e) => setStep2Data({ ...step2Data, nationality: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                      placeholder="United States"
                    />
                  </div>

                  {/* ID Card Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ID Card Front */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        ID Card Front *
                      </label>
                      <div className="space-y-2">
                        {step2Data.idCardFrontPreview ? (
                          <div className="relative group">
                            <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                              <img
                                src={step2Data.idCardFrontPreview}
                                alt="ID Card Front Preview"
                                className="w-full h-full object-contain"
                              />
                              <button
                                type="button"
                                onClick={() => setStep2Data(prev => ({ ...prev, idCardFront: null, idCardFrontPreview: null }))}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-10 h-10 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP (MAX. 5MB)</p>
                            </div>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleIdCardUpload(file, 'front')
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* ID Card Back */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        ID Card Back *
                      </label>
                      <div className="space-y-2">
                        {step2Data.idCardBackPreview ? (
                          <div className="relative group">
                            <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                              <img
                                src={step2Data.idCardBackPreview}
                                alt="ID Card Back Preview"
                                className="w-full h-full object-contain"
                              />
                              <button
                                type="button"
                                onClick={() => setStep2Data(prev => ({ ...prev, idCardBack: null, idCardBackPreview: null }))}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-10 h-10 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP (MAX. 5MB)</p>
                            </div>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleIdCardUpload(file, 'back')
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Continue to Step 3
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Step 3: Address Information */}
            {currentStep === 3 && (
              <form onSubmit={handleStep3} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                    Address Information
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Step 3 of 6</p>
                </div>

                <div className="space-y-6">
                  {/* Address Line 1 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Street Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={step3Data.address}
                        onChange={(e) => setStep3Data({ ...step3Data, address: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="123 Main Street"
                        required
                      />
                    </div>
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={step3Data.addressLine2}
                      onChange={(e) => setStep3Data({ ...step3Data, addressLine2: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                      placeholder="Apartment, suite, etc."
                    />
                  </div>

                  {/* City, State, Zip */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={step3Data.city}
                        onChange={(e) => setStep3Data({ ...step3Data, city: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={step3Data.state}
                        onChange={(e) => setStep3Data({ ...step3Data, state: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="NY"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Zip Code *
                      </label>
                      <input
                        type="text"
                        value={step3Data.zipCode}
                        onChange={(e) => setStep3Data({ ...step3Data, zipCode: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="10001"
                        required
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={step3Data.country}
                      onChange={(e) => setStep3Data({ ...step3Data, country: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                      placeholder="United States"
                      required
                    />
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Continue to Step 4
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Step 4: Employment & Financial */}
            {currentStep === 4 && (
              <form onSubmit={handleStep4} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                    Employment & Financial
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Step 4 of 6</p>
                </div>

                <div className="space-y-6">
                  {/* Employment Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Employment Status *
                    </label>
                    <select
                      value={step4Data.employmentStatus}
                      onChange={(e) => {
                        const newStatus = e.target.value as EmploymentStatus
                        // Clear employment fields if selecting unemployed, student, or retired
                        if (['unemployed', 'student', 'retired'].includes(newStatus)) {
                          setStep4Data({ 
                            ...step4Data, 
                            employmentStatus: newStatus,
                            employerName: '',
                            jobTitle: '',
                            employmentYears: ''
                          })
                        } else {
                          setStep4Data({ ...step4Data, employmentStatus: newStatus })
                        }
                      }}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                    >
                      <option value="employed">Employed</option>
                      <option value="self-employed">Self-Employed</option>
                      <option value="unemployed">Unemployed</option>
                      <option value="student">Student</option>
                      <option value="retired">Retired</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Employer Name & Job Title - Only show if employed, self-employed, or other */}
                  {!['unemployed', 'student', 'retired'].includes(step4Data.employmentStatus) && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Employer Name
                          </label>
                          <input
                            type="text"
                            value={step4Data.employerName}
                            onChange={(e) => setStep4Data({ ...step4Data, employerName: e.target.value })}
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                            placeholder="Company Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Job Title
                          </label>
                          <input
                            type="text"
                            value={step4Data.jobTitle}
                            onChange={(e) => setStep4Data({ ...step4Data, jobTitle: e.target.value })}
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                            placeholder="Your Position"
                          />
                        </div>
                      </div>

                      {/* Employment Years */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Years of Employment
                        </label>
                        <input
                          type="number"
                          value={step4Data.employmentYears}
                          onChange={(e) => setStep4Data({ ...step4Data, employmentYears: e.target.value })}
                          className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </>
                  )}

                  {/* Income Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Annual Income ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={step4Data.annualIncome}
                          onChange={(e) => setStep4Data({ ...step4Data, annualIncome: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                          placeholder="50000"
                          min="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Monthly Income ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={step4Data.monthlyIncome}
                          onChange={(e) => setStep4Data({ ...step4Data, monthlyIncome: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                          placeholder="4000"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Credit Score - Slider */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Credit Score *
                    </label>
                    <div className="space-y-3">
                      {/* Credit Score Display */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold" style={{
                            color: getCreditScoreColor(parseInt(step4Data.creditScore || '650'))
                          }}>
                            {step4Data.creditScore || '650'}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/ 850</span>
                        </div>
                        <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{
                          backgroundColor: getCreditScoreColor(parseInt(step4Data.creditScore || '650')) + '20',
                          color: getCreditScoreColor(parseInt(step4Data.creditScore || '650'))
                        }}>
                          {getCreditScoreRating(parseInt(step4Data.creditScore || '650'))}
                        </span>
                      </div>
                      
                      {/* Credit Score Slider */}
                      <div className="relative">
                        <input
                          type="range"
                          min="300"
                          max="850"
                          step="1"
                          value={step4Data.creditScore || '650'}
                          onChange={(e) => setStep4Data({ ...step4Data, creditScore: e.target.value })}
                          className="credit-score-slider w-full h-3 rounded-lg appearance-none cursor-pointer"
                          id="credit-score-range-input"
                          style={{
                            background: `linear-gradient(to right, 
                              #ef4444 0%, 
                              #ef4444 25%, 
                              #f59e0b 25%, 
                              #f59e0b 45%, 
                              #eab308 45%, 
                              #eab308 65%, 
                              #84cc16 65%, 
                              #84cc16 85%, 
                              #22c55e 85%, 
                              #22c55e 95%, 
                              #10b981 95%, 
                              #10b981 100%)`
                          }}
                          required
                        />
                      </div>
                      
                      {/* Range Labels */}
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>300 (Poor)</span>
                        <span>850 (Excellent)</span>
                      </div>
                    </div>
                  </div>

                  {/* Assets & Expenses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Total Assets ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={step4Data.totalAssets}
                          onChange={(e) => setStep4Data({ ...step4Data, totalAssets: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Monthly Expenses ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={step4Data.monthlyExpenses}
                          onChange={(e) => setStep4Data({ ...step4Data, monthlyExpenses: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Continue to Step 5
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Step 5: Security Questions */}
            {currentStep === 5 && (
              <form onSubmit={handleStep5} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                    Security Questions
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Step 5 of 6 - Help us secure your account</p>
                </div>

                <div className="space-y-6">
                  {/* Security Question 1 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Security Question 1 *
                    </label>
                    <select
                      value={step5Data.securityQuestion1}
                      onChange={(e) => setStep5Data({ ...step5Data, securityQuestion1: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                      required
                    >
                      <option value="">Select a question</option>
                      {SECURITY_QUESTIONS.map((q, idx) => (
                        <option key={idx} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Answer 1 *
                    </label>
                    <input
                      type="text"
                      value={step5Data.securityAnswer1}
                      onChange={(e) => setStep5Data({ ...step5Data, securityAnswer1: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                      placeholder="Your answer"
                      required
                    />
                  </div>

                  {/* Security Question 2 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Security Question 2 (Optional)
                    </label>
                    <select
                      value={step5Data.securityQuestion2}
                      onChange={(e) => setStep5Data({ ...step5Data, securityQuestion2: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                    >
                      <option value="">Select a question</option>
                      {SECURITY_QUESTIONS.filter(q => q !== step5Data.securityQuestion1).map((q, idx) => (
                        <option key={idx} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  {step5Data.securityQuestion2 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Answer 2
                      </label>
                      <input
                        type="text"
                        value={step5Data.securityAnswer2}
                        onChange={(e) => setStep5Data({ ...step5Data, securityAnswer2: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="Your answer"
                      />
                    </div>
                  )}

                  {/* Security Question 3 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Security Question 3 (Optional)
                    </label>
                    <select
                      value={step5Data.securityQuestion3}
                      onChange={(e) => setStep5Data({ ...step5Data, securityQuestion3: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                    >
                      <option value="">Select a question</option>
                      {SECURITY_QUESTIONS.filter(q => q !== step5Data.securityQuestion1 && q !== step5Data.securityQuestion2).map((q, idx) => (
                        <option key={idx} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  {step5Data.securityQuestion3 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Answer 3
                      </label>
                      <input
                        type="text"
                        value={step5Data.securityAnswer3}
                        onChange={(e) => setStep5Data({ ...step5Data, securityAnswer3: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="Your answer"
                      />
                    </div>
                  )}

                  {/* Additional Preferences */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Preferred Language
                      </label>
                      <select
                        value={step5Data.preferredLanguage}
                        onChange={(e) => setStep5Data({ ...step5Data, preferredLanguage: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        How did you hear about us?
                      </label>
                      <input
                        type="text"
                        value={step5Data.referralSource}
                        onChange={(e) => setStep5Data({ ...step5Data, referralSource: e.target.value })}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="Friend, Google, etc."
                      />
                    </div>
                  </div>

                  {/* Marketing Consent */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="marketingConsent"
                      checked={step5Data.marketingConsent}
                      onChange={(e) => setStep5Data({ ...step5Data, marketingConsent: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-700 focus:ring-offset-0"
                    />
                    <label htmlFor="marketingConsent" className="text-sm text-gray-700 dark:text-gray-300">
                      I would like to receive marketing communications and updates
                    </label>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Continue to Step 6
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Step 6: Account Types & Role Selection */}
            {currentStep === 6 && (
              <form onSubmit={handleStep6} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                    Select Account Types
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Step 6 of 6 - Final Step!</p>
                </div>

                <div className="space-y-8">
                  {/* Account Type Selection */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-700 dark:text-green-400" />
                      Select Account Types (Choose up to 3) *
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Select up to 3 account types. Each account will automatically receive a unique account number and debit card.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {([
                        { id: 'checking', name: 'Checking Account', icon: CreditCard, desc: 'Daily transactions', color: 'from-blue-500 to-blue-600' },
                        { id: 'savings', name: 'Savings Account', icon: Building2, desc: 'Earn interest', color: 'from-green-500 to-green-600' },
                        { id: 'business', name: 'Business Account', icon: Briefcase, desc: 'Business banking', color: 'from-purple-500 to-purple-600' },
                        { id: 'fixed-deposit', name: 'Fixed Deposit', icon: FileText, desc: 'Fixed term savings', color: 'from-orange-500 to-orange-600' },
                        { id: 'investment', name: 'Investment Account', icon: Award, desc: 'Investment portfolio', color: 'from-indigo-500 to-indigo-600' },
                      ] as Array<{ id: AccountType, name: string, icon: any, desc: string, color: string }>).map((type) => {
                        const Icon = type.icon
                        const isSelected = step6Data.accountTypes.includes(type.id)
                        const isDisabled = !isSelected && step6Data.accountTypes.length >= 3
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => toggleAccountType(type.id)}
                            disabled={isDisabled}
                            className={`p-6 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                              isSelected
                                ? 'border-green-700 bg-green-50 dark:bg-green-900/20'
                                : isDisabled
                                ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-600'
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
                                  <CheckCircle2 className="w-6 h-6 text-green-700 dark:text-green-400" />
                                )}
                              </div>
                              <h4 className="font-bold text-gray-900 dark:text-white mb-1">{type.name}</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{type.desc}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      {step6Data.accountTypes.length}/3 selected
                    </p>
                  </div>

                  {/* Role Selection - Hidden, defaults to 'user' */}
                  <div className="hidden">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-700 dark:text-green-400" />
                      Select Your Role *
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setStep6Data({ ...step6Data, role: 'user' })}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          step6Data.role === 'user'
                            ? 'border-green-700 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          {step6Data.role === 'user' && (
                            <CheckCircle2 className="w-6 h-6 text-green-700 dark:text-green-400" />
                          )}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Regular User</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Access to user dashboard and banking features</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep6Data({ ...step6Data, role: 'superadmin' })}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          step6Data.role === 'superadmin'
                            ? 'border-green-700 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          {step6Data.role === 'superadmin' && (
                            <CheckCircle2 className="w-6 h-6 text-green-700 dark:text-green-400" />
                          )}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Super Admin</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Access to admin dashboard and system management</p>
                      </button>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || step6Data.accountTypes.length === 0}
                      className="px-6 py-3 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Completing Registration...
                        </>
                      ) : (
                        <>
                          Complete Registration
                          <CheckCircle2 className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
