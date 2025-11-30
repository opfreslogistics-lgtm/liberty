'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface SavedRecipient {
  id: string
  recipient_user_id: string | null
  recipient_email: string
  recipient_phone: string | null
  recipient_name: string | null
  recipient_profile_picture: string | null
  last_account_type: string | null
  last_transferred_at: string | null
  total_transactions: number
  total_amount: number
  created_at: string
  updated_at: string
}

export function useSavedRecipients() {
  const [recipients, setRecipients] = useState<SavedRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecipients()
  }, [])

  const fetchRecipients = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      const { data, error: recipientsError } = await supabase
        .from('saved_recipients')
        .select('*')
        .eq('user_id', user.id)
        .order('last_transferred_at', { ascending: false })

      if (recipientsError) {
        throw recipientsError
      }

      setRecipients((data || []) as SavedRecipient[])
    } catch (err: any) {
      console.error('Error fetching saved recipients:', err)
      setError(err.message || 'Failed to fetch saved recipients')
    } finally {
      setLoading(false)
    }
  }

  const refreshRecipients = () => {
    fetchRecipients()
  }

  return {
    recipients,
    loading,
    error,
    refreshRecipients,
  }
}

