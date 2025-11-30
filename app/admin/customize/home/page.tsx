'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getHomepageCustomization, updateHomepageItem, uploadHomepageImage } from '@/lib/utils/homepageCustomization'
import { X, Upload, Image as ImageIcon, Save, Loader2 } from 'lucide-react'
import NotificationModal from '@/components/NotificationModal'
import AdminLayout from '@/components/admin/AdminLayout'

interface CustomizationItem {
  section: string
  fieldName: string
  label: string
  type: 'image' | 'text'
  value?: string
  currentImage?: string
}

export default function HomeCustomizationPage() {
  const [customization, setCustomization] = useState<Record<string, Record<string, any>>>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  })

  useEffect(() => {
    loadCustomization()
  }, [])

  const loadCustomization = async () => {
    setLoading(true)
    const data = await getHomepageCustomization()
    setCustomization(data)
    setLoading(false)
  }

  const handleImageUpload = async (
    section: string,
    fieldName: string,
    file: File
  ) => {
    const uploadKey = `${section}_${fieldName}`
    setUploading(uploadKey)

    try {
      const { success, url, error } = await uploadHomepageImage(file, section)
      
      if (!success || !url) {
        throw new Error(error || 'Failed to upload image')
      }

      const { success: updateSuccess, error: updateError } = await updateHomepageItem(
        section,
        fieldName,
        url,
        null
      )

      if (!updateSuccess) {
        throw new Error(updateError || 'Failed to update customization')
      }

      await loadCustomization()
      
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Image Updated',
        message: 'The image has been successfully updated and will appear on the homepage.',
      })
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Upload Failed',
        message: error.message || 'Failed to upload image. Please try again.',
      })
    } finally {
      setUploading(null)
    }
  }

  const handleTextUpdate = async (
    section: string,
    fieldName: string,
    value: string
  ) => {
    setSaving(true)

    try {
      const { success, error } = await updateHomepageItem(
        section,
        fieldName,
        null,
        value
      )

      if (!success) {
        throw new Error(error || 'Failed to update text')
      }

      await loadCustomization()
      
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Text Updated',
        message: 'The text has been successfully updated.',
      })
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update text. Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  const customizationItems: CustomizationItem[] = [
    // Hero Slider
    { section: 'hero_slider', fieldName: 'slide_1_image', label: 'Hero Slider 1 Image', type: 'image' },
    { section: 'hero_slider', fieldName: 'slide_1_heading', label: 'Hero Slider 1 Heading', type: 'text' },
    { section: 'hero_slider', fieldName: 'slide_1_subheading', label: 'Hero Slider 1 Subheading', type: 'text' },
    { section: 'hero_slider', fieldName: 'slide_2_image', label: 'Hero Slider 2 Image', type: 'image' },
    { section: 'hero_slider', fieldName: 'slide_2_heading', label: 'Hero Slider 2 Heading', type: 'text' },
    { section: 'hero_slider', fieldName: 'slide_2_subheading', label: 'Hero Slider 2 Subheading', type: 'text' },
    { section: 'hero_slider', fieldName: 'slide_3_image', label: 'Hero Slider 3 Image', type: 'image' },
    { section: 'hero_slider', fieldName: 'slide_3_heading', label: 'Hero Slider 3 Heading', type: 'text' },
    { section: 'hero_slider', fieldName: 'slide_3_subheading', label: 'Hero Slider 3 Subheading', type: 'text' },
    
    // Quick Services
    { section: 'quick_services', fieldName: 'service_1_icon', label: 'Quick Service 1 Icon', type: 'image' },
    { section: 'quick_services', fieldName: 'service_1_title', label: 'Quick Service 1 Title', type: 'text' },
    { section: 'quick_services', fieldName: 'service_2_icon', label: 'Quick Service 2 Icon', type: 'image' },
    { section: 'quick_services', fieldName: 'service_2_title', label: 'Quick Service 2 Title', type: 'text' },
    { section: 'quick_services', fieldName: 'service_3_icon', label: 'Quick Service 3 Icon', type: 'image' },
    { section: 'quick_services', fieldName: 'service_3_title', label: 'Quick Service 3 Title', type: 'text' },
    { section: 'quick_services', fieldName: 'service_4_icon', label: 'Quick Service 4 Icon', type: 'image' },
    { section: 'quick_services', fieldName: 'service_4_title', label: 'Quick Service 4 Title', type: 'text' },
    { section: 'quick_services', fieldName: 'service_5_icon', label: 'Quick Service 5 Icon', type: 'image' },
    { section: 'quick_services', fieldName: 'service_5_title', label: 'Quick Service 5 Title', type: 'text' },
    
    // About Section
    { section: 'about', fieldName: 'about_image', label: 'About Section Image', type: 'image' },
    { section: 'about', fieldName: 'about_title', label: 'About Title', type: 'text' },
    { section: 'about', fieldName: 'about_content', label: 'About Content', type: 'text' },
    
    // Features
    { section: 'features', fieldName: 'feature_1_icon', label: 'Feature 1 Icon', type: 'image' },
    { section: 'features', fieldName: 'feature_1_title', label: 'Feature 1 Title', type: 'text' },
    { section: 'features', fieldName: 'feature_2_icon', label: 'Feature 2 Icon', type: 'image' },
    { section: 'features', fieldName: 'feature_2_title', label: 'Feature 2 Title', type: 'text' },
    { section: 'features', fieldName: 'feature_3_icon', label: 'Feature 3 Icon', type: 'image' },
    { section: 'features', fieldName: 'feature_3_title', label: 'Feature 3 Title', type: 'text' },
    { section: 'features', fieldName: 'feature_4_icon', label: 'Feature 4 Icon', type: 'image' },
    { section: 'features', fieldName: 'feature_4_title', label: 'Feature 4 Title', type: 'text' },
    
    // Promo Banner
    { section: 'promo_banner', fieldName: 'promo_image', label: 'Promotional Banner Image', type: 'image' },
    { section: 'promo_banner', fieldName: 'promo_title', label: 'Promo Title', type: 'text' },
    { section: 'promo_banner', fieldName: 'promo_description', label: 'Promo Description', type: 'text' },
    
    // Account Steps
    { section: 'account_steps', fieldName: 'step_1_icon', label: 'Step 1 Icon', type: 'image' },
    { section: 'account_steps', fieldName: 'step_1_title', label: 'Step 1 Title', type: 'text' },
    { section: 'account_steps', fieldName: 'step_2_icon', label: 'Step 2 Icon', type: 'image' },
    { section: 'account_steps', fieldName: 'step_2_title', label: 'Step 2 Title', type: 'text' },
    { section: 'account_steps', fieldName: 'step_3_icon', label: 'Step 3 Icon', type: 'image' },
    { section: 'account_steps', fieldName: 'step_3_title', label: 'Step 3 Title', type: 'text' },
    
    // Testimonials
    { section: 'testimonials', fieldName: 'testimonial_1_image', label: 'Testimonial 1 Image', type: 'image' },
    { section: 'testimonials', fieldName: 'testimonial_1_name', label: 'Testimonial 1 Name', type: 'text' },
    { section: 'testimonials', fieldName: 'testimonial_1_content', label: 'Testimonial 1 Content', type: 'text' },
    { section: 'testimonials', fieldName: 'testimonial_2_image', label: 'Testimonial 2 Image', type: 'image' },
    { section: 'testimonials', fieldName: 'testimonial_2_name', label: 'Testimonial 2 Name', type: 'text' },
    { section: 'testimonials', fieldName: 'testimonial_2_content', label: 'Testimonial 2 Content', type: 'text' },
    { section: 'testimonials', fieldName: 'testimonial_3_image', label: 'Testimonial 3 Image', type: 'image' },
    { section: 'testimonials', fieldName: 'testimonial_3_name', label: 'Testimonial 3 Name', type: 'text' },
    { section: 'testimonials', fieldName: 'testimonial_3_content', label: 'Testimonial 3 Content', type: 'text' },
    
    // Blog
    { section: 'blog', fieldName: 'blog_1_image', label: 'Blog Post 1 Image', type: 'image' },
    { section: 'blog', fieldName: 'blog_1_title', label: 'Blog Post 1 Title', type: 'text' },
    { section: 'blog', fieldName: 'blog_2_image', label: 'Blog Post 2 Image', type: 'image' },
    { section: 'blog', fieldName: 'blog_2_title', label: 'Blog Post 2 Title', type: 'text' },
    { section: 'blog', fieldName: 'blog_3_image', label: 'Blog Post 3 Image', type: 'image' },
    { section: 'blog', fieldName: 'blog_3_title', label: 'Blog Post 3 Title', type: 'text' },
    
    // Partners
    { section: 'partners', fieldName: 'partner_1_logo', label: 'Partner 1 Logo', type: 'image' },
    { section: 'partners', fieldName: 'partner_2_logo', label: 'Partner 2 Logo', type: 'image' },
    { section: 'partners', fieldName: 'partner_3_logo', label: 'Partner 3 Logo', type: 'image' },
    { section: 'partners', fieldName: 'partner_4_logo', label: 'Partner 4 Logo', type: 'image' },
    
    // App Download
    { section: 'app_download', fieldName: 'app_mockup_image', label: 'App Mockup Image', type: 'image' },
    { section: 'app_download', fieldName: 'google_play_badge', label: 'Google Play Badge', type: 'image' },
    { section: 'app_download', fieldName: 'apple_store_badge', label: 'Apple Store Badge', type: 'image' },
    { section: 'app_download', fieldName: 'app_title', label: 'App Title', type: 'text' },
    { section: 'app_download', fieldName: 'app_description', label: 'App Description', type: 'text' },
    
    // Footer
    { section: 'footer', fieldName: 'footer_logo', label: 'Footer Logo', type: 'image' },
    { section: 'footer', fieldName: 'social_facebook', label: 'Facebook Icon', type: 'image' },
    { section: 'footer', fieldName: 'social_twitter', label: 'Twitter Icon', type: 'image' },
    { section: 'footer', fieldName: 'social_instagram', label: 'Instagram Icon', type: 'image' },
    { section: 'footer', fieldName: 'social_linkedin', label: 'LinkedIn Icon', type: 'image' },
  ]

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Homepage Customization
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload images and update content for your homepage
            </p>
          </div>

          <div className="space-y-8">
            {customizationItems.map((item, index) => {
              const sectionData = customization[item.section] || {}
              const currentValue = item.type === 'image'
                ? (sectionData[item.fieldName] || item.currentImage || '/images/placeholder.png')
                : (sectionData[item.fieldName] || '')

              return (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-6"
                >
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {item.label}
                  </label>

                  {item.type === 'image' ? (
                    <div className="space-y-4">
                      <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        {currentValue && !currentValue.includes('placeholder') && (
                          <img
                            src={currentValue}
                            alt={item.label}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {(!currentValue || currentValue.includes('placeholder')) && (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleImageUpload(item.section, item.fieldName, file)
                            }
                          }}
                        />
                        <div className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          {uploading === `${item.section}_${item.fieldName}` ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>Upload Image</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {item.label.includes('Content') || item.label.includes('Description') ? (
                        <textarea
                          value={currentValue}
                          onChange={(e) => {
                            const newValue = e.target.value
                            setCustomization((prev) => ({
                              ...prev,
                              [item.section]: {
                                ...prev[item.section],
                                [item.fieldName]: newValue,
                              },
                            }))
                          }}
                          onBlur={() => handleTextUpdate(item.section, item.fieldName, currentValue)}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      ) : (
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => {
                            const newValue = e.target.value
                            setCustomization((prev) => ({
                              ...prev,
                              [item.section]: {
                                ...prev[item.section],
                                [item.fieldName]: newValue,
                              },
                            }))
                          }}
                          onBlur={() => handleTextUpdate(item.section, item.fieldName, currentValue)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={true}
        autoCloseDelay={4000}
      />
    </AdminLayout>
  )
}

