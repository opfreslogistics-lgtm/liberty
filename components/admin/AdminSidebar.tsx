'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Image,
  Home,
  DollarSign,
  Shield,
} from 'lucide-react'
import clsx from 'clsx'

export default function AdminSidebar() {
  const pathname = usePathname()

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin',
      active: pathname === '/admin',
    },
    {
      title: 'Users',
      icon: Users,
      href: '/admin/users',
      active: pathname === '/admin/users',
    },
    {
      title: 'Mobile Deposits',
      icon: FileText,
      href: '/admin/mobile-deposits',
      active: pathname === '/admin/mobile-deposits',
    },
    {
      divider: true,
    },
    {
      title: 'Homepage Customization',
      icon: Image,
      href: '/admin/customize/home',
      active: pathname === '/admin/customize/home',
      badge: 'NEW',
    },
    {
      divider: true,
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/admin/settings',
      active: pathname === '/admin/settings',
    },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen fixed left-0 top-0 pt-20 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-4 border-t border-gray-200 dark:border-gray-800"
                />
              )
            }

            const Icon = item.icon!
            const isActive = item.active

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Icon
                  className={clsx(
                    'w-5 h-5 transition-colors',
                    isActive
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  )}
                />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}


