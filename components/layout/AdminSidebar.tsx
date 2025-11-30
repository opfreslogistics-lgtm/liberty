'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  DollarSign,
  Activity,
  FileText,
  Bell,
  Shield,
  BarChart3,
  Settings,
  Landmark,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Smartphone,
  Bitcoin,
  CreditCard,
} from 'lucide-react'
import clsx from 'clsx'
import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from '../ThemeProvider'

const navSections = [
  {
    title: 'Overview',
    items: [
      { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    title: 'User Management',
    items: [
      { href: '/admin/users', icon: Users, label: 'All Users' },
      { href: '/admin/kyc', icon: UserCheck, label: 'KYC Verification' },
    ],
  },
  {
    title: 'Financial Operations',
    items: [
      { href: '/admin/mobile-deposits', icon: Smartphone, label: 'Mobile Deposits' },
      { href: '/admin/crypto', icon: Bitcoin, label: 'Crypto Management' },
      { href: '/admin/loans', icon: DollarSign, label: 'Loans' },
      { href: '/admin/bills', icon: FileText, label: 'Bills & Charges' },
      { href: '/admin/cards', icon: CreditCard, label: 'Card Spender' },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/support', icon: Bell, label: 'Support Tickets' },
      { href: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

interface AdminSidebarProps {
  isMobileOpen?: boolean
  onClose?: () => void
}

export function AdminSidebar({ isMobileOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const themeContext = useContext(ThemeContext)
  const theme = themeContext?.theme || 'light'
  const toggleTheme = themeContext?.toggleTheme || (() => {})
  const [expandedSections, setExpandedSections] = useState<string[]>(['Overview', 'User Management', 'Financial Operations', 'System'])

  // Effect to prevent body scrolling when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm w-64 transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Logo and Close Button for Mobile */}
          <div className="flex items-center justify-between flex-shrink-0 px-6 mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Liberty Bank</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Admin Info */}
          <div className="px-6 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  Administrator
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  admin@libertybank.com
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 px-3 space-y-1">
            {navSections.map((section) => (
              <div key={section.title} className="mb-4">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <span>{section.title}</span>
                  {expandedSections.includes(section.title) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {expandedSections.includes(section.title) && (
                  <div className="space-y-1 mt-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href || (item.href === '/admin' && pathname === '/admin')

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={clsx(
                            'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                            isActive
                              ? 'bg-red-600 text-white shadow-lg'
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
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            
            <Link href="/dashboard">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors">
                <Landmark className="w-4 h-4" />
                User Portal
              </button>
            </Link>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

