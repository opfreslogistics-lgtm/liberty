'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { getAppSettings } from '@/lib/utils/appSettings'

interface AppSettings {
  app_name: string
  app_logo: string | null
  app_logo_light: string | null
  app_logo_dark: string | null
  footer_logo_light: string | null
  footer_logo_dark: string | null
  app_favicon: string | null
  contact_phone: string
  contact_email: string
  contact_address: string
  social_facebook_url: string | null
  social_twitter_url: string | null
  social_instagram_url: string | null
  social_linkedin_url: string | null
  support_email: string
  support_phone: string
  support_hours: string
  timezone: string
  currency: string
  date_format: string
}

const defaultSettings: AppSettings = {
  app_name: 'Liberty National Bank',
  app_logo: null,
  app_logo_light: null,
  app_logo_dark: null,
  footer_logo_light: null,
  footer_logo_dark: null,
  app_favicon: null,
  contact_phone: '+1 (555) 123-4567',
  contact_email: 'info@libertybank.com',
  contact_address: '123 Bank Street, Financial District, NY 10004',
  social_facebook_url: null,
  social_twitter_url: null,
  social_instagram_url: null,
  social_linkedin_url: null,
  support_email: 'support@libertybank.com',
  support_phone: '+1 (555) 123-4567',
  support_hours: '24/7',
  timezone: 'America/New_York',
  currency: 'USD',
  date_format: 'MM/DD/YYYY',
}

interface AppSettingsContextType {
  settings: AppSettings
  loading: boolean
  refresh: () => Promise<void>
}

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refresh: async () => {},
})

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const appSettings = await getAppSettings()
      setSettings({
        app_name: appSettings.app_name || defaultSettings.app_name,
        app_logo: appSettings.app_logo || null,
        app_logo_light: appSettings.app_logo_light || null,
        app_logo_dark: appSettings.app_logo_dark || null,
        footer_logo_light: appSettings.footer_logo_light || null,
        footer_logo_dark: appSettings.footer_logo_dark || null,
        app_favicon: appSettings.app_favicon || null,
        contact_phone: appSettings.contact_phone || defaultSettings.contact_phone,
        contact_email: appSettings.contact_email || defaultSettings.contact_email,
        contact_address: appSettings.contact_address || defaultSettings.contact_address,
        social_facebook_url: appSettings.social_facebook_url || null,
        social_twitter_url: appSettings.social_twitter_url || null,
        social_instagram_url: appSettings.social_instagram_url || null,
        social_linkedin_url: appSettings.social_linkedin_url || null,
        support_email: appSettings.support_email || defaultSettings.support_email,
        support_phone: appSettings.support_phone || defaultSettings.support_phone,
        support_hours: appSettings.support_hours || defaultSettings.support_hours,
        timezone: appSettings.timezone || defaultSettings.timezone,
        currency: appSettings.currency || defaultSettings.currency,
        date_format: appSettings.date_format || defaultSettings.date_format,
      })
    } catch (error) {
      console.error('Error fetching app settings:', error)
      // Use default settings if fetch fails
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let channel: any = null
    
    const initialize = async () => {
      try {
        await fetchSettings()

        // Set up real-time subscription for app_settings changes
        try {
          channel = supabase
            .channel('app_settings_changes')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'app_settings',
              },
              () => {
                // Refresh settings when any change occurs
                fetchSettings()
              }
            )
            .subscribe()
        } catch (subError) {
          console.error('Error setting up real-time subscription:', subError)
          // Continue without real-time updates if subscription fails
        }
      } catch (error) {
        console.error('Error initializing app settings:', error)
        // Ensure loading is set to false even on error
        setLoading(false)
      }
    }

    initialize()

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel)
        } catch (error) {
          console.error('Error removing channel:', error)
        }
      }
    }
  }, [])

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        loading,
        refresh: fetchSettings,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext)
  // Return default context if not within provider (graceful degradation)
  if (!context) {
    console.warn('useAppSettings used outside AppSettingsProvider, using defaults')
    return {
      settings: defaultSettings,
      loading: false,
      refresh: async () => {},
    }
  }
  return context
}

