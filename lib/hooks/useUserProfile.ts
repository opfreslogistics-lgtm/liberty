'use client'

import { useState, useEffect } from 'react'
import { supabase, getCurrentUser } from '@/lib/supabase'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  username?: string | null
  phone: string | null
  date_of_birth?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  country?: string | null
  employment_status?: string | null
  employer_name?: string | null
  annual_income?: number | null
  credit_score?: number | null
  profile_picture_url?: string | null
  role: 'user' | 'admin' | 'superadmin'
  kyc_status: string
  created_at: string
  notification_preferences?: any
  two_factor_enabled?: boolean
  biometric_enabled?: boolean
  password_changed_at?: string
  preferred_language?: string
  preferred_currency?: string
  date_format?: string
  timezone?: string
  account_status?: string
  deleted_at?: string
  freeze_reason?: string
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
    
    // Listen for auth state changes to refresh profile
    const { supabase } = require('@/lib/supabase')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      // Try to get current user
      let user
      try {
        user = await getCurrentUser()
      } catch (authError) {
        // User not authenticated
        setProfile(null)
        setLoading(false)
        return
      }
      
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      // Fetch user profile from database
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        // If profile doesn't exist yet (just signed up), wait and retry once
        if (fetchError.code === 'PGRST116') {
          console.log('Profile not found yet, will retry once...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          // Retry once
          const { data: retryData, error: retryError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (retryError) {
            console.error('Profile still not found after retry:', retryError)
            setProfile(null)
            setLoading(false)
            return
          }
          
          setProfile(retryData)
          setError(null)
          setLoading(false)
          return
        }
        console.error('Error fetching profile:', fetchError)
        setError(fetchError.message)
        setProfile(null)
        setLoading(false)
        return
      }
      
      setProfile(data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching user profile:', err)
      setError(err.message)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    if (!profile) return 'U'
    const first = profile.first_name?.charAt(0).toUpperCase() || ''
    const last = profile.last_name?.charAt(0).toUpperCase() || ''
    return first + last || 'U'
  }

  const getFullName = () => {
    if (!profile) return 'User'
    return `${profile.first_name} ${profile.last_name}`.trim()
  }

  const isAdmin = () => {
    return profile?.role === 'admin' || profile?.role === 'superadmin'
  }

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
    initials: getInitials(),
    fullName: getFullName(),
    isAdmin: isAdmin(),
  }
}

