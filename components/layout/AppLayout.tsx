'use client'

import { useState } from 'react'
import { MobileNav } from './MobileNav'
import { DesktopSidebar } from './DesktopSidebar'
import { RightSidebar } from './RightSidebar'
import { TopBar } from './TopBar'
import { MobileTopBar } from './MobileTopBar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DesktopSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <TopBar />
      <MobileTopBar onMenuClick={toggleMobileSidebar} />
      <main className="md:pl-64 xl:pr-80 md:pt-16">
        <div className="pb-24 md:pb-8 px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <RightSidebar />
      <MobileNav />
    </div>
  )
}
