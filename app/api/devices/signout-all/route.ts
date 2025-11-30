import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current device ID from localStorage (we'll pass it in the request)
    const body = await request.json().catch(() => ({}))
    const currentDeviceId = body.deviceId

    // Delete all devices except the current one
    let query = supabase
      .from('user_devices')
      .delete()
      .eq('user_id', user.id)

    if (currentDeviceId) {
      query = query.neq('device_id', currentDeviceId) as any
    } else {
      // If no device ID provided, delete all non-current devices
      query = query.eq('is_current', false) as any
    }

    const { error: deleteError } = await query

    if (deleteError) {
      console.error('Error signing out devices:', deleteError)
      return NextResponse.json({ error: 'Failed to sign out devices' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error signing out devices:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

