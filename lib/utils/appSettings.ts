import { supabase } from '@/lib/supabase'

export interface AppSetting {
  id: string
  setting_key: string
  setting_value: string | null
  setting_type: 'text' | 'image_url' | 'json'
  description: string | null
  created_at: string
  updated_at: string
}

/**
 * Get all app settings as a key-value object
 */
export async function getAppSettings(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value')
      .order('setting_key')

    if (error) {
      console.error('Error fetching app settings:', error)
      return {}
    }

    const settings: Record<string, string> = {}
    data?.forEach((item) => {
      settings[item.setting_key] = item.setting_value || ''
    })

    return settings
  } catch (error) {
    console.error('Error fetching app settings:', error)
    return {}
  }
}

/**
 * Get a single app setting by key
 */
export async function getAppSetting(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single()

    if (error) {
      console.error(`Error fetching app setting ${key}:`, error)
      return null
    }

    return data?.setting_value || null
  } catch (error) {
    console.error(`Error fetching app setting ${key}:`, error)
    return null
  }
}

/**
 * Update a single app setting (upsert - insert if not exists, update if exists)
 */
export async function updateAppSetting(
  key: string,
  value: string | null,
  settingType: 'text' | 'image_url' | 'json' = 'text',
  description?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    // First check if the setting exists
    const { data: existing } = await supabase
      .from('app_settings')
      .select('id')
      .eq('setting_key', key)
      .single()

    if (existing) {
      // Update existing setting
      const { error } = await supabase
        .from('app_settings')
        .update({
          setting_value: value,
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', key)

      if (error) {
        console.error(`Error updating app setting ${key}:`, error)
        return { success: false, error: error.message }
      }
    } else {
      // Insert new setting
      const { error } = await supabase
        .from('app_settings')
        .insert({
          setting_key: key,
          setting_value: value,
          setting_type: settingType,
          description: description || null,
        })

      if (error) {
        console.error(`Error inserting app setting ${key}:`, error)
        return { success: false, error: error.message }
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error(`Error upserting app setting ${key}:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Upload image for logo, favicon, or footer logo
 */
export async function uploadAppImage(
  file: File,
  settingKey: 'app_logo' | 'app_favicon' | 'app_logo_light' | 'app_logo_dark' | 'footer_logo_light' | 'footer_logo_dark'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: 'No file selected' }
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 10MB limit' }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'image/x-icon']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please upload an image (JPEG, PNG, WebP, SVG, GIF, or ICO)' }
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated. Please log in again.' }
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'Unable to verify admin access' }
    }

    if (profile.role !== 'admin' && profile.role !== 'superadmin') {
      return { success: false, error: 'Only administrators can upload app settings images' }
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${settingKey}_${timestamp}_${randomStr}.${fileExt}`
    const filePath = `app-settings/${fileName}`

    // Upload file to storage (use app-images bucket)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('app-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      
      // Provide more specific error messages
      if (uploadError.message.includes('Bucket not found')) {
        return { success: false, error: 'Storage bucket "app-images" not found. Please run database_fix_all_issues.sql to create it.' }
      }
      if (uploadError.message.includes('new row violates row-level security')) {
        return { success: false, error: 'Permission denied. Please ensure you have admin access and storage policies are configured.' }
      }
      
      return { success: false, error: uploadError.message || 'Failed to upload image. Please try again.' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('app-images').getPublicUrl(filePath)
    
    if (!urlData?.publicUrl) {
      return { success: false, error: 'Failed to generate image URL' }
    }
    
    // Update the setting with the new URL
    const updateResult = await updateAppSetting(settingKey, urlData.publicUrl, 'image_url')
    if (!updateResult.success) {
      // Try to delete the uploaded file if setting update fails
      await supabase.storage.from('app-images').remove([filePath])
      return { success: false, error: updateResult.error || 'Failed to save image URL to settings' }
    }
    
    return { success: true, url: urlData.publicUrl }
  } catch (error: any) {
    console.error('Error uploading app image:', error)
    return { success: false, error: error.message || 'An unexpected error occurred during upload' }
  }
}


