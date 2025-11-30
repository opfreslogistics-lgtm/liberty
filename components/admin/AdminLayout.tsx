'use client'

import { ReactNode } from 'react'
import AdminSidebar from './AdminSidebar'
import Navbar from '@/components/Navbar'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex pt-20">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}


