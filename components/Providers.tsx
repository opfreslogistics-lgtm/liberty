'use client'

import { ThemeProvider } from './ThemeProvider'
import { AppSettingsProvider } from '@/lib/hooks/useAppSettings'
import React from 'react'

// Error boundary component to catch any provider errors
class ProviderErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Provider Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI - just render children without providers
      return <>{this.props.children}</>
    }

    return this.props.children
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProviderErrorBoundary>
      <ThemeProvider>
        <AppSettingsProvider>
          {children}
        </AppSettingsProvider>
      </ThemeProvider>
    </ProviderErrorBoundary>
  )
}


