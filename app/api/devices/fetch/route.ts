import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's devices
    const { data: devices, error: devicesError } = await supabase
      .from('user_devices')
      .select('*')
      .eq('user_id', user.id)
      .order('last_active_at', { ascending: false })

    if (devicesError) {
      console.error('Error fetching devices:', devicesError)
      return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 })
    }

    // Format devices for frontend
    const formattedDevices = (devices || []).map((device) => {
      const lastActive = new Date(device.last_active_at)
      const now = new Date()
      const diffMs = now.getTime() - lastActive.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      let lastActiveText = 'Just now'
      if (diffMins > 0 && diffMins < 60) {
        lastActiveText = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
      } else if (diffHours > 0 && diffHours < 24) {
        lastActiveText = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
      } else if (diffDays > 0 && diffDays < 7) {
        lastActiveText = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
      } else if (diffDays >= 7) {
        lastActiveText = lastActive.toLocaleDateString()
      }

      return {
        id: device.id,
        name: device.device_name,
        location: device.location || 'Unknown Location',
        lastActive: lastActiveText,
        current: device.is_current,
        deviceType: device.device_type,
        browser: device.browser,
        os: device.os,
      }
    })

    return NextResponse.json({ devices: formattedDevices })
  } catch (error: any) {
    console.error('Error fetching devices:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

