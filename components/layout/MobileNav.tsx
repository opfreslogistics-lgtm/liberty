'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Send, History, MoreHorizontal, Plus } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/transfer', icon: Send, label: 'Transfer' },
  { href: '/history', icon: History, label: 'Activity' },
  { href: '/more', icon: MoreHorizontal, label: 'More' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Backdrop blur effect */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80 backdrop-blur-sm pointer-events-none md:hidden" />
      
      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-2xl border-t-2 border-gray-200/50 dark:border-gray-700/50 z-50 md:hidden shadow-2xl">
        {/* Top accent line with gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-600 to-transparent opacity-60" />
        
        {/* Subtle inner shadow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-gray-700/50" />
        
        <div className="flex justify-around items-center h-20 px-3 relative">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href === '/dashboard' && pathname === '/')
            const isTransfer = item.href === '/transfer'

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-2xl transition-all duration-300 flex-1 relative group',
                  isTransfer && 'mt-0',
                  !isTransfer && !isActive && 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                )}
              >
                {isTransfer ? (
                  // Special Transfer Button (Floating)
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-green-700 rounded-full blur-xl opacity-40 animate-pulse" />
                      {/* Button */}
                      <div className="relative w-16 h-16 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-800 hover:scale-110 active:scale-95 transition-transform">
                        <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </div>
                      {/* Pulse ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-green-700 animate-ping opacity-20" />
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white text-center mt-2">
                      {item.label}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Icon with enhanced background */}
                    <div className={clsx(
                      'relative transition-all duration-300',
                      isActive && 'scale-110'
                    )}>
                      {/* Glow effect for active state */}
                      {isActive && (
                        <div className="absolute inset-0 bg-green-700 rounded-2xl blur-lg opacity-40 animate-pulse" />
                      )}
                      
                      {/* Icon container with beautiful background */}
                      <div className={clsx(
                        'relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300',
                        isActive 
                          ? 'bg-gradient-to-br from-green-700 via-green-600 to-emerald-700 shadow-xl shadow-green-700/40 ring-2 ring-green-500/30' 
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-md hover:shadow-lg hover:scale-105'
                      )}>
                        {/* Inner glow for active */}
                        {isActive && (
                          <div className="absolute inset-0.5 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl opacity-80" />
                        )}
                        
                        {/* Icon */}
                        <Icon className={clsx(
                          'relative z-10 w-6 h-6 transition-all duration-300',
                          isActive 
                            ? 'text-white stroke-[2.5] drop-shadow-sm' 
                            : 'text-gray-600 dark:text-gray-300 stroke-[2]'
                        )} />
                      </div>
                    </div>
                    
                    {/* Label with better styling */}
                    <span className={clsx(
                      'text-xs font-bold transition-all duration-300 mt-0.5',
                      isActive 
                        ? 'text-green-700 dark:text-green-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    )}>
                      {item.label}
                    </span>
                    
                    {/* Enhanced active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-green-700 to-transparent rounded-full" />
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </div>

        {/* iPhone notch spacer */}
        <div className="h-safe-area-inset-bottom bg-white/98 dark:bg-gray-900/98 backdrop-blur-2xl" />
      </nav>
    </>
  )
}
