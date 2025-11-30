// Device Detection Utility
// Detects device information from browser environment

export interface DeviceInfo {
  deviceId: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  browserVersion: string
  os: string
  osVersion: string
  userAgent: string
}

/**
 * Generate a unique device fingerprint
 */
function generateDeviceId(): string {
  // Use localStorage to persist device ID
  let deviceId = localStorage.getItem('device_id')
  
  if (!deviceId) {
    // Generate a device ID based on available browser information
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Device fingerprint', 2, 2)
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.platform,
    ].join('|')
    
    // Simple hash function
    deviceId = btoa(fingerprint)
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32)
    
    localStorage.setItem('device_id', deviceId)
  }
  
  return deviceId
}

/**
 * Detect device type
 */
function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  const ua = navigator.userAgent.toLowerCase()
  
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet'
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    return 'mobile'
  }
  
  return 'desktop'
}

/**
 * Parse browser information from user agent
 */
function parseBrowser(ua: string): { name: string; version: string } {
  const uaLower = ua.toLowerCase()
  
  if (uaLower.includes('edg/')) {
    const match = ua.match(/edg\/(\d+)/i)
    return { name: 'Edge', version: match ? match[1] : 'Unknown' }
  }
  
  if (uaLower.includes('chrome/') && !uaLower.includes('edg/')) {
    const match = ua.match(/chrome\/(\d+)/i)
    return { name: 'Chrome', version: match ? match[1] : 'Unknown' }
  }
  
  if (uaLower.includes('firefox/')) {
    const match = ua.match(/firefox\/(\d+)/i)
    return { name: 'Firefox', version: match ? match[1] : 'Unknown' }
  }
  
  if (uaLower.includes('safari/') && !uaLower.includes('chrome/')) {
    const match = ua.match(/version\/(\d+)/i)
    return { name: 'Safari', version: match ? match[1] : 'Unknown' }
  }
  
  if (uaLower.includes('opera/') || uaLower.includes('opr/')) {
    const match = ua.match(/(?:opera|opr)\/(\d+)/i)
    return { name: 'Opera', version: match ? match[1] : 'Unknown' }
  }
  
  return { name: 'Unknown', version: 'Unknown' }
}

/**
 * Parse OS information from user agent
 */
function parseOS(ua: string): { name: string; version: string } {
  const uaLower = ua.toLowerCase()
  
  if (uaLower.includes('windows nt')) {
    const match = ua.match(/windows nt (\d+\.\d+)/i)
    const version = match ? match[1] : 'Unknown'
    let osName = 'Windows'
    if (version === '10.0') osName = 'Windows 10/11'
    else if (version === '6.3') osName = 'Windows 8.1'
    else if (version === '6.2') osName = 'Windows 8'
    else if (version === '6.1') osName = 'Windows 7'
    return { name: osName, version }
  }
  
  if (uaLower.includes('mac os x') || uaLower.includes('macintosh')) {
    const match = ua.match(/mac os x ([\d_]+)/i)
    return { name: 'macOS', version: match ? match[1].replace(/_/g, '.') : 'Unknown' }
  }
  
  if (uaLower.includes('linux')) {
    return { name: 'Linux', version: 'Unknown' }
  }
  
  if (uaLower.includes('android')) {
    const match = ua.match(/android ([\d.]+)/i)
    return { name: 'Android', version: match ? match[1] : 'Unknown' }
  }
  
  if (uaLower.includes('iphone') || uaLower.includes('ipod')) {
    const match = ua.match(/os ([\d_]+)/i)
    return { name: 'iOS', version: match ? match[1].replace(/_/g, '.') : 'Unknown' }
  }
  
  if (uaLower.includes('ipad')) {
    const match = ua.match(/os ([\d_]+)/i)
    return { name: 'iPadOS', version: match ? match[1].replace(/_/g, '.') : 'Unknown' }
  }
  
  return { name: 'Unknown', version: 'Unknown' }
}

/**
 * Generate a human-readable device name
 */
function generateDeviceName(
  deviceType: 'desktop' | 'mobile' | 'tablet',
  browser: string,
  os: string
): string {
  const typeNames = {
    desktop: browser === 'Safari' && os.includes('macOS') ? 'Mac' : 
              os.includes('Windows') ? 'Windows PC' : 
              os.includes('Linux') ? 'Linux PC' : 'Desktop',
    mobile: browser === 'Safari' && os.includes('iOS') ? 'iPhone' :
            os.includes('Android') ? 'Android Phone' : 'Mobile',
    tablet: browser === 'Safari' && os.includes('iPadOS') ? 'iPad' :
            os.includes('Android') ? 'Android Tablet' : 'Tablet',
  }
  
  return typeNames[deviceType] || 'Device'
}

/**
 * Get device information
 */
export function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent
  const deviceId = generateDeviceId()
  const deviceType = detectDeviceType()
  const browser = parseBrowser(userAgent)
  const os = parseOS(userAgent)
  const deviceName = generateDeviceName(deviceType, browser.name, os.name)
  
  return {
    deviceId,
    deviceName,
    deviceType,
    browser: browser.name,
    browserVersion: browser.version,
    os: os.name,
    osVersion: os.version,
    userAgent,
  }
}

/**
 * Register or update device in the database
 */
export async function registerDevice(): Promise<void> {
  try {
    const deviceInfo = getDeviceInfo()
    
    // Fetch IP and location (using a free service)
    let ipAddress = ''
    let location = 'Unknown Location'
    
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json')
      const ipData = await ipResponse.json()
      ipAddress = ipData.ip || ''
      
      // Try to get location from IP
      try {
        const locationResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`)
        const locationData = await locationResponse.json()
        if (locationData.city && locationData.region && locationData.country_code) {
          location = `${locationData.city}, ${locationData.region}, ${locationData.country_code}`
        }
      } catch (e) {
        // Location lookup failed, use default
        console.warn('Could not fetch location:', e)
      }
    } catch (e) {
      console.warn('Could not fetch IP address:', e)
    }
    
    // Get auth token
    const { supabase } = await import('@/lib/supabase')
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.warn('No session found, skipping device registration')
      return
    }
    
    // Register device via API
    const response = await fetch('/api/devices/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        ...deviceInfo,
        ipAddress,
        location,
      }),
    })
    
    if (!response.ok) {
      console.error('Failed to register device:', await response.text())
    }
  } catch (error) {
    console.error('Error registering device:', error)
    // Don't throw - device registration failure shouldn't break the app
  }
}

