'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SecuritySettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [globalOTPEnabled, setGlobalOTPEnabled] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          router.push('/login')
          return
        }

        setUserId(session.user.id)

        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('two_factor_enabled, role')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setTwoFactorEnabled(profile.two_factor_enabled || false)
        }

        // Get global OTP setting (only for admins)
        if (profile?.role === 'admin' || profile?.role === 'superadmin') {
          try {
            const globalResponse = await fetch('/api/admin/global-otp-setting', {
              method: 'GET',
            })
            const globalData = await globalResponse.json()
            if (globalData.success) {
              setGlobalOTPEnabled(globalData.enabled)
            }
          } catch (error) {
            console.error('Error fetching global OTP setting:', error)
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        setError('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [router])

  const handleToggle2FA = async () => {
    if (!userId) return

    const newValue = !twoFactorEnabled
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/settings/update-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, enabled: newValue }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update 2FA setting')
      }

      setTwoFactorEnabled(newValue)
      setSuccess(`Two-factor authentication ${newValue ? 'enabled' : 'disabled'} successfully`)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      console.error('Error updating 2FA:', error)
      setError(error.message || 'Failed to update two-factor authentication')
      setTwoFactorEnabled(!newValue) // Revert on error
    } finally {
      setSaving(false)
    }
  }

  const handleToggleGlobalOTP = async () => {
    if (!userId) return

    const newValue = !globalOTPEnabled
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/global-otp-setting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUserId: userId, enabled: newValue }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update global OTP setting')
      }

      setGlobalOTPEnabled(newValue)
      setSuccess(`Global OTP verification ${newValue ? 'enabled' : 'disabled'} successfully`)
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      console.error('Error updating global OTP:', error)
      setError(error.message || 'Failed to update global OTP setting')
      setGlobalOTPEnabled(!newValue)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-700" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Security Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account security and two-factor authentication
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300 flex-1">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-300 flex-1">{success}</p>
        </div>
      )}

      {/* Two-Factor Authentication Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-700 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Email-based OTP verification for enhanced security
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Email OTP Verification
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {twoFactorEnabled
                    ? 'You will receive a 6-digit code via email every time you log in.'
                    : 'Enable to receive a verification code via email when logging in.'}
                </p>
                {twoFactorEnabled && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Note: This requires the global OTP setting to be enabled by an administrator.
                  </p>
                )}
              </div>
              <button
                onClick={handleToggle2FA}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2 ${
                  twoFactorEnabled ? 'bg-green-700' : 'bg-gray-300 dark:bg-gray-600'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Section - Global OTP Setting */}
      {userId && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Global OTP Setting
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Administrator control for system-wide OTP verification
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  Enable OTP Verification System-Wide
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {globalOTPEnabled
                    ? 'OTP verification is enabled globally. Users with 2FA enabled will be required to verify via email.'
                    : 'OTP verification is disabled globally. No users will be required to verify via OTP.'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  When enabled, users with personal 2FA toggle ON will be required to verify via email OTP.
                </p>
              </div>
              <button
                onClick={handleToggleGlobalOTP}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 ${
                  globalOTPEnabled ? 'bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    globalOTPEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          How It Works
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>
              When enabled, you'll receive a 6-digit code via email every time you log in.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>
              The code is valid for 5 minutes and can only be used once.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>
              You can request a new code up to 5 times per hour if needed.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>
              Superadmin accounts always bypass OTP verification for security reasons.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

