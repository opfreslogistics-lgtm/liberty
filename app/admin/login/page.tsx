'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  Building2,
} from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Check if user is already logged in as admin
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Check if user is admin
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (profile && (profile.role === 'admin' || profile.role === 'superadmin')) {
            // Already logged in as admin, redirect to admin dashboard
            window.location.href = '/admin'
            return
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [])

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

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError) throw profileError

      // Check if user is admin or superadmin
      if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
        setError('Access denied. This login is for administrators only.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // Admin login bypasses OTP and goes directly to /admin
      // (Superadmin always bypasses, admin using admin login form also bypasses)
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = '/admin'
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.')
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Checking session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-lg mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100 dark:border-gray-700">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300 flex-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white transition-all"
                  placeholder="admin@libertybank.com"
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
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white transition-all"
                  placeholder="Enter your password"
                  required
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-600 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In to Admin Panel
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                  Admin Access Only
                </p>
                <p className="text-xs text-red-800 dark:text-red-400">
                  This portal is restricted to administrators and super administrators only.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            Regular user?{' '}
            <Link href="/login" className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold transition-colors">
              User Login
            </Link>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

