'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  ChevronDown,
  User,
  Shield,
  Wallet,
  Building2,
  Globe,
  Phone,
  Mail,
  Search,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAppSettings } from '@/lib/hooks/useAppSettings'
import { useTheme } from '@/components/ThemeProvider'
import Image from 'next/image'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { settings } = useAppSettings()
  const { theme } = useTheme()
  const appName = settings.app_name || 'Liberty Bank'
  const pathname = usePathname()
  const router = useRouter()
  
  // Get logo URL - prioritize uploaded logos with proper fallback
  const logoDark = settings.app_logo_dark || settings.app_logo || ''
  const logoLight = settings.app_logo_light || settings.app_logo || ''
  const logoUrl = (theme === 'dark' && logoDark) ? logoDark : (logoLight || logoDark || '')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            {logoUrl ? (
              // Show uploaded landscape logo (replaces entire logo section)
              <div className="h-10 flex items-center">
                <Image
                  src={logoUrl}
                  alt={`${appName} Logo`}
                  width={200}
                  height={40}
                  className="h-full w-auto object-contain group-hover:opacity-90 transition-opacity duration-300"
                  unoptimized
                  priority
                />
              </div>
            ) : (
              // Fallback: Show default logo with text
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                    {appName}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">International Banking</p>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Home
            </Link>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 ${
                  isServicesDropdownOpen || pathname.startsWith('/services') || pathname.startsWith('/transfer')
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>Services</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isServicesDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsServicesDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-20">
                    <div className="p-2">
                      <Link
                        href="/transfer"
                        onClick={() => setIsServicesDropdownOpen(false)}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                          <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Transfer Money</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Send money securely</p>
                        </div>
                      </Link>

                      <Link
                        href="/transfer/wire"
                        onClick={() => setIsServicesDropdownOpen(false)}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                          <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Wire Transfer</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">International transfers</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              href="/about"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/about')
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              About
            </Link>

            <Link
              href="/contact"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/contact')
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Dashboard
                </Link>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-20">
                        <div className="p-2">
                          <Link
                            href="/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <User className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-gray-900 dark:text-white">Dashboard</span>
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Settings className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-gray-900 dark:text-white">Settings</span>
                          </Link>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              handleLogout()
                            }}
                            className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Open Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 animate-in slide-in-from-top duration-200">
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg font-medium ${
                isActive('/')
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Home
            </Link>
            <Link
              href="/transfer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300"
            >
              Transfer Money
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300"
            >
              Contact
            </Link>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg font-medium text-red-600 dark:text-red-400"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg font-semibold text-center"
                  >
                    Open Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

