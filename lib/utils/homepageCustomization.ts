import { supabase } from '@/lib/supabase'

export interface HomepageItem {
  section: string
  field_name: string
  image_url: string | null
  content: string | null
  display_order: number
  is_active: boolean
}

/**
 * Get all homepage customization data
 */
export async function getHomepageCustomization(): Promise<Record<string, Record<string, any>>> {
  try {
    const { data, error } = await supabase
      .from('homepage_customization')
      .select('*')
      .eq('is_active', true)
      .order('section', { ascending: true })
      .order('display_order', { ascending: true })

    // If table doesn't exist or error, return empty - components have defaults
    if (error) {
      // Table might not exist yet - that's okay, components have defaults
      return {}
    }

    // If no data, return empty object (components have defaults)
    if (!data || data.length === 0) {
      return {}
    }

    // Group by section and field_name
    const grouped: Record<string, Record<string, any>> = {}
    
    data.forEach((item) => {
      if (!grouped[item.section]) {
        grouped[item.section] = {}
      }
      
      // Extract slide/step/service number if exists
      const match = item.field_name.match(/(\d+)/)
      if (match) {
        const index = parseInt(match[1])
        const baseName = item.field_name.replace(/\d+/, '').replace(/_$/, '')
        
        if (!grouped[item.section][index]) {
          grouped[item.section][index] = {}
        }
        
        grouped[item.section][index][baseName] = item.image_url || item.content || ''
      } else {
        grouped[item.section][item.field_name] = item.image_url || item.content || ''
      }
    })

    return grouped
  } catch (error) {
    console.error('Error fetching homepage customization:', error)
    return {}
  }
}

/**
 * Get specific section data
 */
export async function getSectionData(section: string): Promise<Record<string, any>> {
  try {
    const { data, error } = await supabase
      .from('homepage_customization')
      .select('*')
      .eq('section', section)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error(`Error fetching ${section} data:`, error)
      return {}
    }

    const sectionData: Record<string, any> = {}
    
    data?.forEach((item) => {
      const match = item.field_name.match(/(\d+)/)
      if (match) {
        const index = parseInt(match[1])
        const baseName = item.field_name.replace(/\d+/, '').replace(/_$/, '')
        
        if (!sectionData[index]) {
          sectionData[index] = {}
        }
        
        sectionData[index][baseName] = item.image_url || item.content || ''
      } else {
        sectionData[item.field_name] = item.image_url || item.content || ''
      }
    })

    return sectionData
  } catch (error) {
    console.error(`Error fetching ${section} data:`, error)
    return {}
  }
}

/**
 * Update homepage customization item
 */
export async function updateHomepageItem(
  section: string,
  fieldName: string,
  imageUrl: string | null,
  content: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('homepage_customization')
      .update({
        image_url: imageUrl,
        content: content,
        updated_at: new Date().toISOString(),
      })
      .eq('section', section)
      .eq('field_name', fieldName)

    if (error) {
      console.error('Error updating homepage item:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error updating homepage item:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadHomepageImage(
  file: File,
  path: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `homepage/${path}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return { success: false, error: uploadError.message }
    }

    const { data } = supabase.storage.from('public').getPublicUrl(filePath)
    
    return { success: true, url: data.publicUrl }
  } catch (error: any) {
    console.error('Error uploading image:', error)
    return { success: false, error: error.message }
  }
}

