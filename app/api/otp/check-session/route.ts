/**
 * Check OTP Verified Session API Route
 * Checks if user has a valid verified OTP session
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hasVerifiedOTPSession } from '@/lib/utils/otp'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user has verified session
    const verified = await hasVerifiedOTPSession(userId)

    return NextResponse.json({
      success: true,
      verified,
    })
  } catch (error: any) {
    console.error('Error in check OTP session route:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

