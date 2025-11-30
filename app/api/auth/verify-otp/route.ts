/**
 * Verify OTP API Route
 * Verifies the OTP code and returns a temporary token for login
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Maximum verification attempts
const MAX_ATTEMPTS = 5

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otpCode } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    if (!otpCode || otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: 'Invalid OTP code format. Please enter a 6-digit code.' },
        { status: 400 }
      )
    }

    // Find user
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, otp_enabled')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Invalid email or OTP code.' },
        { status: 401 }
      )
    }

    // Check if OTP is enabled
    if (!userProfile.otp_enabled) {
      return NextResponse.json(
        { error: 'OTP is not enabled for this account.' },
        { status: 403 }
      )
    }

    // Find the most recent unused OTP code for this user
    const { data: otpRecord, error: otpError } = await supabase
      .from('login_otp_codes')
      .select('*')
      .eq('user_id', userProfile.id)
      .eq('used', false)
      .eq('email', email.toLowerCase().trim())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code. Please request a new code.' },
        { status: 401 }
      )
    }

    // Check if OTP has expired
    const expiresAt = new Date(otpRecord.expires_at)
    const now = new Date()
    if (now > expiresAt) {
      // Mark as used
      await supabase
        .from('login_otp_codes')
        .update({ used: true })
        .eq('id', otpRecord.id)

      return NextResponse.json(
        { error: 'OTP code has expired. Please request a new code.' },
        { status: 401 }
      )
    }

    // Check attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      // Mark as used after max attempts
      await supabase
        .from('login_otp_codes')
        .update({ used: true })
        .eq('id', otpRecord.id)

      return NextResponse.json(
        { error: 'Maximum verification attempts exceeded. Please request a new code.' },
        { status: 401 }
      )
    }

    // Verify OTP code
    if (otpRecord.code !== otpCode) {
      // Increment attempts
      await supabase
        .from('login_otp_codes')
        .update({ attempts: otpRecord.attempts + 1 })
        .eq('id', otpRecord.id)

      const remainingAttempts = MAX_ATTEMPTS - (otpRecord.attempts + 1)
      return NextResponse.json(
        { 
          error: 'Invalid OTP code.',
          remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0,
        },
        { status: 401 }
      )
    }

    // OTP is valid - mark as used
    await supabase
      .from('login_otp_codes')
      .update({ used: true })
      .eq('id', otpRecord.id)

    // Return success with user ID (frontend will use this to complete login)
    return NextResponse.json({
      success: true,
      userId: userProfile.id,
      message: 'OTP verified successfully.',
    })
  } catch (error: any) {
    console.error('Error in verify OTP route:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

