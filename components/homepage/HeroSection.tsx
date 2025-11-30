'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  Globe, 
  TrendingUp, 
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Users,
  Building2,
  CreditCard,
  Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface HeroSectionProps {
  data: Record<string, any>
}

export default function HeroSection({ data }: HeroSectionProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [pendingRole, setPendingRole] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        setLoading(false)
        return
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Failed to sign in')
      }

      // Get user profile to check role, account status, and OTP settings
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, account_status, freeze_reason, otp_enabled_login, first_name, last_name')
        .eq('id', authData.user.id)
        .single()

      if (profileError) throw profileError

      // Check if account is deleted
      if (profile?.account_status === 'deleted') {
        await supabase.auth.signOut()
        setError('Your account has been deleted. Please contact support.')
        setLoading(false)
        return
      }

      // Check if account is frozen
      if (profile?.account_status === 'frozen') {
        await supabase.auth.signOut()
        setError(profile.freeze_reason || 'Your account has been frozen. Please contact support.')
        setLoading(false)
        return
      }

      // Check if OTP is enabled
      // Skip OTP for superadmin role
      if (profile?.otp_enabled_login && profile?.role !== 'superadmin') {
        // Generate 6-digit OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

        // Save OTP to user profile
        const { error: otpSaveError } = await supabase
          .from('user_profiles')
          .update({
            otp_code: generatedOtp,
            otp_generated_at: new Date().toISOString(),
            otp_expires_at: expiresAt.toISOString(),
          })
          .eq('id', authData.user.id)

        if (otpSaveError) throw otpSaveError

        // Send OTP email
        const recipientName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Valued Customer'
        
        try {
          const emailResponse = await fetch('/api/otp/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientEmail: email,
              recipientName: recipientName,
              otpCode: generatedOtp,
            }),
          })

          if (!emailResponse.ok) {
            console.warn('Failed to send OTP email, but OTP was generated')
          }
        } catch (emailError) {
          console.error('Error sending OTP email:', emailError)
          // Continue anyway - OTP is saved in database
        }

        // Show OTP verification modal
        setPendingUserId(authData.user.id)
        setPendingRole(profile?.role || 'user')
        setShowOTPModal(true)
        setLoading(false)
        setOtpCode(['', '', '', '', '', ''])
        setOtpError(null)
      } else {
        // OTP disabled, redirect directly
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (profile?.role === 'admin' || profile?.role === 'superadmin') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.')
      setLoading(false)
    }
  }

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=1080&fit=crop"
          alt="Banking Background"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/85 to-emerald-900/90 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95"></div>
        {/* Pattern overlay for texture */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT SIDEBAR - Quick Stats & Features */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Shield className="w-5 h-5 text-green-600 mr-2" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Customers</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">10M+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Countries</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">150+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Assets</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">$2.5T</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Years Serving</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">75+</span>
                </div>
              </div>
            </div>

            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                Key Features
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">256-bit SSL Encryption</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Globe className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Global Money Transfers</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">24/7 Customer Support</span>
                </li>
                <li className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Investment Solutions</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-4 text-white shadow-xl">
              <div className="flex items-center justify-center">
                <Building2 className="w-5 h-5 mr-2" />
                <h3 className="text-base font-bold">FDIC Insured</h3>
              </div>
            </div>
          </div>

          {/* CENTER CONTENT */}
          <div className="lg:col-span-5 flex items-center">
            <div className="w-full">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold mb-6">
                <Shield className="w-4 h-4" />
                <span>Secure Banking Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Your Trusted Partner for{' '}
                <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                  Global Banking
                </span>
              </h1>
              
              <p className="text-xl text-white/90 mb-6 leading-relaxed">
                Experience world-class financial services with security you can trust. Join millions of customers worldwide who trust Liberty National Bank.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {['24/7 Banking', 'Global Transfers', 'Enterprise Security', 'Investment Plans'].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-sm"
                  >
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    <span className="text-sm font-medium text-white">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <span>Open Account</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Login Form */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700 sticky top-24">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Sign In
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Access your account securely
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800 dark:text-red-300 flex-1">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 dark:text-white transition-all text-sm"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 dark:text-white transition-all text-sm"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold transition-colors">
                    Forgot?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Sign Up Link */}
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <OTPModal
          otpCode={otpCode}
          setOtpCode={setOtpCode}
          otpError={otpError}
          setOtpError={setOtpError}
          otpLoading={otpLoading}
          setOtpLoading={setOtpLoading}
          pendingUserId={pendingUserId}
          pendingRole={pendingRole}
          onCancel={async () => {
            await supabase.auth.signOut()
            setShowOTPModal(false)
            setOtpCode(['', '', '', '', '', ''])
            setOtpError(null)
            setPendingUserId(null)
            setPendingRole(null)
          }}
        />
      )}
    </section>
  )
}

// OTP Modal Component
function OTPModal({
  otpCode,
  setOtpCode,
  otpError,
  setOtpError,
  otpLoading,
  setOtpLoading,
  pendingUserId,
  pendingRole,
  onCancel,
}: {
  otpCode: string[]
  setOtpCode: (code: string[]) => void
  otpError: string | null
  setOtpError: (error: string | null) => void
  otpLoading: boolean
  setOtpLoading: (loading: boolean) => void
  pendingUserId: string | null
  pendingRole: string | null
  onCancel: () => void
}) {
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus first input when modal opens
    setTimeout(() => {
      firstInputRef.current?.focus()
    }, 100)
  }, [])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Decorative gradient header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700"></div>
        
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
            Enter Verification Code
          </h2>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
            We've sent a 6-digit code to your email. Please enter it below to complete your login.
          </p>

          {/* OTP Error */}
          {otpError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300 flex-1">{otpError}</p>
            </div>
          )}

          {/* OTP Input Fields */}
          <div className="flex justify-center gap-3 mb-6">
            {otpCode.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  if (value.length <= 1) {
                    const newCode = [...otpCode]
                    newCode[index] = value
                    setOtpCode(newCode)
                    setOtpError(null)
                    
                    // Auto-focus next input
                    if (value && index < 5) {
                      const nextInput = document.getElementById(`hero-otp-input-${index + 1}`) as HTMLInputElement
                      nextInput?.focus()
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
                    const prevInput = document.getElementById(`hero-otp-input-${index - 1}`) as HTMLInputElement
                    prevInput?.focus()
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault()
                  const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, 6)
                  const newCode = [...otpCode]
                  for (let i = 0; i < 6; i++) {
                    newCode[i] = pastedData[i] || ''
                  }
                  setOtpCode(newCode)
                  setOtpError(null)
                }}
                id={`hero-otp-input-${index}`}
                className="w-14 h-14 text-center text-2xl font-bold bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 text-gray-900 dark:text-white transition-all"
                ref={index === 0 ? firstInputRef : undefined}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={async () => {
              const enteredOtp = otpCode.join('')
              if (enteredOtp.length !== 6) {
                setOtpError('Please enter the complete 6-digit code')
                return
              }

              if (!pendingUserId) {
                setOtpError('Session expired. Please login again.')
                return
              }

              setOtpLoading(true)
              setOtpError(null)

              try {
                // Get user profile to check OTP
                const { data: profile, error: profileError } = await supabase
                  .from('user_profiles')
                  .select('otp_code, otp_expires_at')
                  .eq('id', pendingUserId)
                  .single()

                if (profileError) throw profileError

                // Check if OTP exists and hasn't expired
                if (!profile?.otp_code) {
                  throw new Error('OTP code has expired. Please login again.')
                }

                const now = new Date()
                const expiresAt = profile.otp_expires_at ? new Date(profile.otp_expires_at) : null

                if (expiresAt && now > expiresAt) {
                  throw new Error('OTP code has expired. Please login again.')
                }

                // Verify OTP
                if (profile.otp_code !== enteredOtp) {
                  throw new Error('Invalid verification code. Please try again.')
                }

                // Clear OTP from database
                await supabase
                  .from('user_profiles')
                  .update({
                    otp_code: null,
                    otp_expires_at: null,
                    otp_generated_at: null,
                  })
                  .eq('id', pendingUserId)

                // Redirect based on role
                await new Promise(resolve => setTimeout(resolve, 500))
                
                if (pendingRole === 'admin' || pendingRole === 'superadmin') {
                  window.location.href = '/admin'
                } else {
                  window.location.href = '/dashboard'
                }
              } catch (err: any) {
                setOtpError(err.message || 'Verification failed. Please try again.')
                setOtpLoading(false)
              }
            }}
            disabled={otpLoading || otpCode.join('').length !== 6}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
          >
            {otpLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Cancel Button */}
          <button
            onClick={async () => {
              // Sign out the user when they cancel OTP
              await supabase.auth.signOut()
              onCancel()
            }}
            className="w-full mt-3 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
          >
            Cancel
          </button>

          {/* Info */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Didn't receive the code? Check your spam folder or try logging in again.
          </p>
        </div>
      </div>
    </div>
  )
}
