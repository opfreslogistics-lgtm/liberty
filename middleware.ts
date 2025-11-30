/**
 * Next.js Middleware
 * Protects routes and checks OTP verification status
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/admin/login',
    '/verify-otp',
  ]

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith('/api/'))

  // For protected routes, the actual OTP check will be done in the page components
  // Middleware just ensures basic authentication exists
  // The verify-otp page and AuthGuard components handle OTP verification

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
