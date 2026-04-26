import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''

  // Skip if already on mobile pages, API routes, or auth pages
  if (
    pathname.startsWith('/mobile') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.includes('.')
  ) {
    return
  }

  // Redirect /p/[slug] to mobile claim page for mobile users
  if (pathname.startsWith('/p/')) {
    if (isMobile(userAgent)) {
      const slug = pathname.split('/')[2]
      const url = request.nextUrl.clone()
      url.pathname = `/mobile/claim/${slug}`
      return NextResponse.redirect(url)
    }
    return
  }

  // Check if user is on mobile device
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
