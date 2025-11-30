'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import {
  Home,
  CreditCard,
  Send,
  History,
  Settings,
  DollarSign,
  TrendingUp,
  Wallet,
  HelpCircle,
  Shield,
  Bell,
  Landmark,
  User,
  FileText,
  PieChart,
  Target,
  Globe,
  BarChart3,
  Briefcase,
  Calculator,
  Receipt,
  Lock,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Zap,
  Award,
  Gift,
} from 'lucide-react'
import clsx from 'clsx'

const menuSections = [
  {
    title: 'Main Features',
    items: [
      {
        title: 'Dashboard',
        icon: Home,
        href: '/dashboard',
        description: 'Account overview',
        color: '#047857',
      },
      {
        title: 'Cards',
        icon: CreditCard,
        href: '/cards',
        description: 'Manage your cards',
        color: '#3b82f6',
      },
      {
        title: 'Transfer',
        icon: Send,
        href: '/transfer',
        description: 'Send money',
        color: '#8b5cf6',
      },
      {
        title: 'History',
        icon: History,
        href: '/history',
        description: 'Transaction history',
        color: '#f59e0b',
      },
    ],
  },
  {
    title: 'Financial Tools',
    items: [
      {
        title: 'Investments',
        icon: TrendingUp,
        href: '/crypto',
        description: 'Trade & invest',
        color: '#f97316',
      },
      {
        title: 'Loans',
        icon: DollarSign,
        href: '/loans',
        description: 'Apply for loans',
        color: '#10b981',
      },
      {
        title: 'Budget',
        icon: Wallet,
        href: '/budget',
        description: 'Track spending',
        color: '#06b6d4',
      },
      {
        title: 'Multi-Currency',
        icon: Globe,
        href: '/multi-currency',
        description: 'Foreign exchange',
        color: '#6366f1',
      },
    ],
  },
  {
    title: 'Account & Support',
    items: [
      {
        title: 'Settings',
        icon: Settings,
        href: '/settings',
        description: 'Account settings',
        color: '#64748b',
      },
      {
        title: 'Support',
        icon: HelpCircle,
        href: '/support',
        description: 'Help center',
        color: '#ec4899',
      },
    ],
  },
]

export default function MorePage() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { profile, loading, fullName, initials } = useUserProfile()

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">More</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Explore all features and settings
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-600 rounded-2xl p-6 shadow-lg text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold">
            {loading ? '...' : initials}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{loading ? 'Loading...' : fullName}</h2>
            <p className="text-green-100">{loading ? 'Loading...' : (profile?.email || 'No email')}</p>
            <div className="flex items-center gap-2 mt-2">
              <Award className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {profile?.role === 'superadmin' || profile?.role === 'admin' ? 'Admin Member' : 'Premium Member'}
              </span>
            </div>
          </div>
          <Link href="/settings">
            <button className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all">
              <ChevronRight className="w-6 h-6" />
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={toggleTheme}
          className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all active:scale-95"
        >
          <div className="flex flex-col items-center gap-2">
            {theme === 'dark' ? (
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Sun className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <Moon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </div>
        </button>

        <button className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all active:scale-95">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Sign Out</span>
          </div>
        </button>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">
            {section.title}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={clsx(
                      'p-4 rounded-2xl shadow-lg border transition-all active:scale-95',
                      isActive
                        ? 'bg-green-700 border-green-600 shadow-xl'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-xl'
                    )}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div
                        className={clsx(
                          'w-14 h-14 rounded-xl flex items-center justify-center transition-all',
                          isActive
                            ? 'bg-white/20 backdrop-blur-sm'
                            : ''
                        )}
                        style={{
                          backgroundColor: isActive ? undefined : item.color + '20',
                        }}
                      >
                        <Icon
                          className="w-7 h-7"
                          style={{
                            color: isActive ? 'white' : item.color,
                          }}
                        />
                      </div>
                      <div>
                        <h3
                          className={clsx(
                            'font-bold mb-1',
                            isActive
                              ? 'text-white'
                              : 'text-gray-900 dark:text-white'
                          )}
                        >
                          {item.title}
                        </h3>
                        <p
                          className={clsx(
                            'text-xs',
                            isActive
                              ? 'text-green-100'
                              : 'text-gray-600 dark:text-gray-400'
                          )}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 gap-3 mt-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Your account is secure
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                2FA enabled • Last login: 2 hours ago
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Refer friends, earn rewards
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Get $50 for each referral
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center py-6 space-y-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Liberty Bank</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Version 2.5.0</p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-500">
          <button className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
            Privacy Policy
          </button>
          <span>•</span>
          <button className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
            Terms of Service
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
          © 2024 Liberty Bank. All rights reserved.
        </p>
      </div>
    </div>
  )
}
