import { supabase } from '@/lib/supabase'

export interface RequiredCode {
  type: 'IMF' | 'COT' | 'TAN'
  value: string
  enabled: boolean
}

/**
 * Fetch enabled transaction codes for the current user
 */
export async function getUserTransactionCodes(userId?: string): Promise<RequiredCode[]> {
  try {
    let targetUserId = userId

    // If no userId provided, get current user
    if (!targetUserId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return []
      }
      targetUserId = user.id
    }

    // Fetch user profile with codes
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('imf_code, cot_code, tan_code, imf_code_enabled, cot_code_enabled, tan_code_enabled')
      .eq('id', targetUserId)
      .single()

    if (error || !profile) {
      console.error('Error fetching user transaction codes:', error)
      return []
    }

    const codes: RequiredCode[] = []

    // Add IMF code if enabled
    if (profile.imf_code_enabled && profile.imf_code) {
      codes.push({
        type: 'IMF',
        value: profile.imf_code,
        enabled: true,
      })
    }

    // Add COT code if enabled
    if (profile.cot_code_enabled && profile.cot_code) {
      codes.push({
        type: 'COT',
        value: profile.cot_code,
        enabled: true,
      })
    }

    // Add TAN code if enabled
    if (profile.tan_code_enabled && profile.tan_code) {
      codes.push({
        type: 'TAN',
        value: profile.tan_code,
        enabled: true,
      })
    }

    return codes
  } catch (error) {
    console.error('Error in getUserTransactionCodes:', error)
    return []
  }
}

/**
 * Check if user has any enabled transaction codes
 */
export async function hasTransactionCodes(userId?: string): Promise<boolean> {
  const codes = await getUserTransactionCodes(userId)
  return codes.length > 0
}


