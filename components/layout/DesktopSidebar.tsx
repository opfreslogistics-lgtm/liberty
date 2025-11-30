'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Send,
  History,
  Settings,
  DollarSign,
  HelpCircle,
  TrendingUp,
  Wallet,
  Landmark,
  X,
  Smartphone,
  CreditCard,
} from 'lucide-react'
import clsx from 'clsx'
import { useContext } from 'react'
import { ThemeContext } from '../ThemeProvider'
import { useAppSettings } from '@/lib/hooks/useAppSettings'
import Image from 'next/image'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/transfer', icon: Send, label: 'Transfer' },
  { href: '/mobile-deposit', icon: Smartphone, label: 'Mobile Deposit' },
  { href: '/history', icon: History, label: 'Transactions' },
  { href: '/cards', icon: CreditCard, label: 'Cards' },
  { href: '/crypto', icon: TrendingUp, label: 'Investments' },
  { href: '/loans', icon: DollarSign, label: 'Loans' },
  { href: '/budget', icon: Wallet, label: 'Bills' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/support', icon: HelpCircle, label: 'Support' },
]

interface DesktopSidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function DesktopSidebar({ isMobileOpen = false, onMobileClose }: DesktopSidebarProps) {
  const pathname = usePathname()
  const themeContext = useContext(ThemeContext)
  const theme = themeContext?.theme || 'light'
  const toggleTheme = themeContext?.toggleTheme || (() => {})
  const { settings } = useAppSettings()
  const appName = settings.app_name || 'Liberty Bank'

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl z-50 transition-transform duration-300 ease-in-out',
          'md:translate-x-0 md:shadow-sm',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex-1 flex flex-col h-full pt-5 pb-4 overflow-y-auto">
          {/* Logo with Mobile Close Button */}
          <div className="flex items-center justify-between px-6 mb-8">
            {(() => {
              // Get logo URL - prioritize uploaded logos with proper fallback
              const logoDark = settings.app_logo_dark || settings.app_logo || ''
              const logoLight = settings.app_logo_light || settings.app_logo || ''
              const logoUrl = (theme === 'dark' && logoDark) ? logoDark : (logoLight || logoDark || '')
              
              return logoUrl ? (
                // Show uploaded landscape logo (replaces entire logo section)
                <div className="flex-1 flex items-center min-w-0">
                  <Image
                    src={logoUrl}
                    alt={`${appName} Logo`}
                    width={180}
                    height={40}
                    className="h-10 w-auto max-w-full object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                // Fallback: Show default logo with text
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center mr-3">
                    <Landmark className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{appName}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Online Banking</p>
                  </div>
                </div>
              )
            })()}
            {/* Close button - only visible on mobile */}
            <button
              onClick={onMobileClose}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href === '/dashboard' && pathname === '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onMobileClose?.()}
                  className={clsx(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-green-700 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon
                    className={clsx(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                    )}
                  />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
