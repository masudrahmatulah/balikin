import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'
import { headers } from 'next/headers'

// Mobile device detection patterns
const mobileDevices = [
  /Android/i,
  /iPhone/i,
  /iPad/i,
  /iPod/i,
  /BlackBerry/i,
  /Windows Phone/i,
  /webOS/i,
  /Opera Mini/i,
  /IEMobile/i,
  /Mobile/i,
]

function isMobile(userAgent: string): boolean {
  return mobileDevices.some((device) => device.test(userAgent))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''

  // Skip authentication checks for static files, API routes, and public pages
  const isPublicRoute =
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/p/') ||
    pathname.startsWith('/mobile') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/help') ||
    pathname.includes('.')

  if (isPublicRoute) {
    // Handle mobile redirects for public routes
    if (pathname.startsWith('/p/') && !pathname.includes('.')) {
      if (isMobile(userAgent)) {
        const slug = pathname.split('/')[2]
        const url = request.nextUrl.clone()
        url.pathname = `/mobile/claim/${slug}`
        return NextResponse.redirect(url)
      }
    }

    // Check if user is on mobile device for main public routes
    if (isMobile(userAgent) && (pathname === '/' || pathname === '/about' || pathname === '/pricing')) {
      const url = request.nextUrl.clone()
      url.pathname = '/mobile'
      return NextResponse.redirect(url)
    }

    return
  }

  // Check authentication for protected routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (!session?.user) {
        const signInUrl = new URL('/sign-in', request.url)
        signInUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(signInUrl)
      }

      // Additional admin role check for /admin routes
      if (pathname.startsWith('/admin')) {
        // Import admin check function
        const { getAdminSession } = await import('./lib/admin')
        const adminSession = await getAdminSession()

        if (!adminSession) {
          const signInUrl = new URL('/sign-in', request.url)
          signInUrl.searchParams.set('redirect', pathname)
          signInUrl.searchParams.set('error', 'admin_required')
          return NextResponse.redirect(signInUrl)
        }
      }
    } catch (error) {
      console.error('[Proxy] Auth check failed:', error)
      // On error, redirect to sign-in to be safe
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Mobile redirect for other routes
  if (isMobile(userAgent)) {
    const url = request.nextUrl.clone()
    url.pathname = '/mobile'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - icons (public icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|.*\\..*).*)',
  ],
}
