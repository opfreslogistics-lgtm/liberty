import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Mark route as dynamic since it uses searchParams
export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get device ID from query params
    const searchParams = request.nextUrl.searchParams
    const deviceId = searchParams.get('id')

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 })
    }

    // Delete device (only if it belongs to the user)
    const { error: deleteError } = await supabase
      .from('user_devices')
      .delete()
      .eq('id', deviceId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting device:', deleteError)
      return NextResponse.json({ error: 'Failed to delete device' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting device:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

