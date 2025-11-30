import { supabase } from '@/lib/supabase'

export interface WireBeneficiary {
  id: string
  user_id: string
  nickname: string | null
  beneficiary_name: string
  beneficiary_address?: string
  beneficiary_city?: string
  beneficiary_country?: string
  beneficiary_phone?: string
  beneficiary_email?: string
  bank_name: string
  bank_branch?: string
  bank_address?: string
  account_number: string
  iban?: string
  swift_code?: string
  routing_number?: string
  sort_code?: string
  intermediary_bank_name?: string
  intermediary_swift?: string
  intermediary_aba?: string
  transfer_type: 'domestic' | 'international'
  currency: string
  created_at: string
  updated_at: string
}

/**
 * Get wire transaction PIN for current user
 */
export async function getWireTransactionPin(userId?: string): Promise<{ pin: string | null; enabled: boolean }> {
  try {
    let targetUserId = userId

    if (!targetUserId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { pin: null, enabled: false }
      }
      targetUserId = user.id
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('wire_transaction_pin, wire_transaction_pin_enabled')
      .eq('id', targetUserId)
      .single()

    if (error || !profile) {
      return { pin: null, enabled: false }
    }

    return {
      pin: profile.wire_transaction_pin || null,
      enabled: profile.wire_transaction_pin_enabled || false,
    }
  } catch (error) {
    console.error('Error fetching wire transaction PIN:', error)
    return { pin: null, enabled: false }
  }
}

/**
 * Fetch saved beneficiaries for current user
 */
export async function getWireBeneficiaries(): Promise<WireBeneficiary[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return []
    }

    const { data: beneficiaries, error } = await supabase
      .from('wire_beneficiaries')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching beneficiaries:', error)
      return []
    }

    return beneficiaries || []
  } catch (error) {
    console.error('Error in getWireBeneficiaries:', error)
    return []
  }
}

/**
 * Search beneficiaries by name or nickname
 */
export async function searchBeneficiaries(query: string): Promise<WireBeneficiary[]> {
  if (!query.trim()) {
    return await getWireBeneficiaries()
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return []
    }

    const searchLower = query.trim().toLowerCase()
    
    const { data: beneficiaries, error } = await supabase
      .from('wire_beneficiaries')
      .select('*')
      .eq('user_id', user.id)
      .or(`beneficiary_name.ilike.%${searchLower}%,nickname.ilike.%${searchLower}%`)
      .order('updated_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error searching beneficiaries:', error)
      return []
    }

    return beneficiaries || []
  } catch (error) {
    console.error('Error in searchBeneficiaries:', error)
    return []
  }
}

/**
 * Save a new beneficiary
 */
export async function saveWireBeneficiary(beneficiary: Omit<WireBeneficiary, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Check if beneficiary with same nickname already exists
    if (beneficiary.nickname) {
      const { data: existing } = await supabase
        .from('wire_beneficiaries')
        .select('id')
        .eq('user_id', user.id)
        .eq('nickname', beneficiary.nickname)
        .single()

      if (existing) {
        // Update existing beneficiary
        const { data, error } = await supabase
          .from('wire_beneficiaries')
          .update(beneficiary)
          .eq('id', existing.id)
          .select('id')
          .single()

        if (error) throw error
        return data?.id || null
      }
    }

    // Create new beneficiary
    const { data, error } = await supabase
      .from('wire_beneficiaries')
      .insert([{
        user_id: user.id,
        ...beneficiary,
      }])
      .select('id')
      .single()

    if (error) throw error
    return data?.id || null
  } catch (error: any) {
    console.error('Error saving beneficiary:', error)
    throw error
  }
}

