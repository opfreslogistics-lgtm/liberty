/**
 * Generate a card for a newly created account
 * This function is called after an account is created
 */

import { supabase } from '@/lib/supabase'
import { generateCard, CardDetails } from './cardGeneration'

export interface GenerateCardParams {
  userId: string
  accountId: string
  accountType: string
}

/**
 * Generate and save a card for an account
 */
export async function generateCardForAccount({
  userId,
  accountId,
  accountType,
}: GenerateCardParams): Promise<{ success: boolean; error?: string; cardId?: string }> {
  try {
    // Fetch user profile for cardholder name and billing address
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, address, city, state, country, zip_code')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      return { success: false, error: 'User profile not found' }
    }

    // Check if card already exists for this account
    const { data: existingCard } = await supabase
      .from('cards')
      .select('id')
      .eq('account_id', accountId)
      .single()

    if (existingCard) {
      return { success: true, cardId: existingCard.id } // Card already exists
    }

    // Generate card details using Luhn algorithm
    const cardDetails: CardDetails = generateCard()

    // Cardholder name
    const cardholderName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()

    // Billing address
    const billingAddress = [
      userProfile.address,
      userProfile.city,
      userProfile.state,
      userProfile.zip_code,
      userProfile.country,
    ]
      .filter(Boolean)
      .join(', ')

    // Extract last 4 digits
    const last4 = cardDetails.cardNumber.slice(-4)

    // Insert card into database
    const { data: newCard, error: cardError } = await supabase
      .from('cards')
      .insert([
        {
          user_id: userId,
          account_id: accountId,
          card_number: cardDetails.cardNumber,
          card_network: cardDetails.cardNetwork,
          cardholder_name: cardholderName,
          expiration_month: cardDetails.expirationMonth,
          expiration_year: cardDetails.expirationYear,
          cvv: cardDetails.cvv,
          billing_address: billingAddress || null,
          status: 'active',
          is_virtual: true,
          last4: last4,
        },
      ])
      .select('id')
      .single()

    if (cardError) {
      console.error('Error creating card:', cardError)
      return { success: false, error: cardError.message }
    }

    return { success: true, cardId: newCard.id }
  } catch (error: any) {
    console.error('Error generating card:', error)
    return { success: false, error: error.message || 'Failed to generate card' }
  }
}

/**
 * Generate cards for all existing accounts (migration function)
 */
export async function generateCardsForExistingAccounts(): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    // Fetch all accounts without cards
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, user_id, account_type')
      .order('created_at', { ascending: true })

    if (accountsError) {
      return { success: false, error: accountsError.message }
    }

    let successCount = 0
    let errorCount = 0

    for (const account of accounts || []) {
      // Check if card already exists
      const { data: existingCard } = await supabase
        .from('cards')
        .select('id')
        .eq('account_id', account.id)
        .single()

      if (existingCard) {
        continue // Skip if card already exists
      }

      const result = await generateCardForAccount({
        userId: account.user_id,
        accountId: account.id,
        accountType: account.account_type,
      })

      if (result.success) {
        successCount++
      } else {
        errorCount++
        console.error(`Failed to generate card for account ${account.id}:`, result.error)
      }
    }

    return {
      success: true,
      count: successCount,
      error: errorCount > 0 ? `${errorCount} cards failed to generate` : undefined,
    }
  } catch (error: any) {
    console.error('Error generating cards for existing accounts:', error)
    return { success: false, error: error.message || 'Failed to generate cards' }
  }
}

