'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, Search, ArrowLeft, HelpCircle, Mail } from 'lucide-react'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <AdvancedNavbar />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative">
              <h1 className="text-9xl md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-700 opacity-20 select-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                  <Search className="w-16 h-16 md:w-20 md:h-20 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4 mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Page Not Found
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Oops! The page you're looking for seems to have wandered off. 
              Don't worry, let's get you back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => router.back()}
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:border-green-600 dark:hover:border-green-500 hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
            
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Links
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Home, label: 'Home', href: '/' },
                { icon: Search, label: 'Dashboard', href: '/dashboard' },
                { icon: HelpCircle, label: 'Support', href: '/support' },
                { icon: Mail, label: 'Contact Us', href: '/contact' },
                { icon: Home, label: 'About Us', href: '/about' },
                { icon: Search, label: 'Services', href: '/services' },
              ].map((link, index) => {
                const Icon = link.icon
                return (
                  <Link
                    key={index}
                    href={link.href}
                    className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:shadow-lg transition-all group border border-green-200 dark:border-gray-600"
                  >
                    <Icon className="w-6 h-6 text-green-700 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {link.label}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl text-white">
            <HelpCircle className="w-10 h-10 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">
              Need Additional Help?
            </h3>
            <p className="text-green-100 mb-4">
              Our support team is available 24/7 to assist you
            </p>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <Footer data={{}} />
    </div>
  )
}
