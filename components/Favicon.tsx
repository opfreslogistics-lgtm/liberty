'use client'

import { useEffect } from 'react'
import { useAppSettings } from '@/lib/hooks/useAppSettings'

export function Favicon() {
  const { settings, loading } = useAppSettings()

  useEffect(() => {
    // Wait for settings to load and DOM to be ready
    if (loading || typeof window === 'undefined' || !document.head) return

    const updateFavicon = () => {
      try {
        // Remove ALL existing favicon links
        const existingLinks = document.querySelectorAll("link[rel*='icon'], link[rel*='shortcut'], link[rel*='apple-touch-icon']")
        existingLinks.forEach(link => {
          if (link.parentNode) {
            link.parentNode.removeChild(link)
          }
        })

        // Use custom favicon if available, otherwise use default
        const faviconUrl = settings.app_favicon || '/favicon.ico'
        
        // Determine MIME type based on file extension
        const faviconUrlLower = faviconUrl.toLowerCase()
        let mimeType = 'image/x-icon'
        if (faviconUrlLower.includes('.png')) mimeType = 'image/png'
        else if (faviconUrlLower.includes('.svg')) mimeType = 'image/svg+xml'
        else if (faviconUrlLower.includes('.jpg') || faviconUrlLower.includes('.jpeg')) mimeType = 'image/jpeg'
        else if (faviconUrlLower.includes('.webp')) mimeType = 'image/webp'
        else if (faviconUrlLower.includes('.ico')) mimeType = 'image/x-icon'

        // Add cache-busting parameter to force browser reload
        const separator = faviconUrl.includes('?') ? '&' : '?'
        const faviconWithCache = `${faviconUrl}${separator}v=${Date.now()}`

        // Add primary favicon
        const link = document.createElement('link')
        link.rel = 'icon'
        link.type = mimeType
        link.href = faviconWithCache
        link.sizes = 'any'
        document.head.appendChild(link)

        // Add shortcut icon for older browsers
        const shortcutLink = document.createElement('link')
        shortcutLink.rel = 'shortcut icon'
        shortcutLink.type = mimeType
        shortcutLink.href = faviconWithCache
        document.head.appendChild(shortcutLink)

        // Add apple-touch-icon for better mobile support
        const appleLink = document.createElement('link')
        appleLink.rel = 'apple-touch-icon'
        appleLink.href = faviconWithCache
        document.head.appendChild(appleLink)

        console.log('Favicon updated:', faviconWithCache)
      } catch (error) {
        console.error('Error updating favicon:', error)
      }
    }

    // Run immediately
    updateFavicon()
    
    // Also run after a short delay to ensure everything is ready
    const timeoutId = setTimeout(updateFavicon, 200)

    return () => clearTimeout(timeoutId)
  }, [settings.app_favicon, loading])

  return null // This component doesn't render anything
}

