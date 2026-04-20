import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/how-it-works',
  '/pricing',
  '/faq',
  '/contact',
  '/stickers',
  '/privacy-policy',
  '/terms',
  '/upgrade',
  '/sign-in',
  '/sign-up',
  '/verify-otp',
  '/api/auth', // Auth API endpoints
  '/p/[slug]', // Public tag pages
];

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/dashboard/new',
  '/dashboard/tag/[slug]',
  '/dashboard/sticker-orders/[orderId]',
  '/claim/[tagId]', // Claim flow requires auth
  '/stickers/checkout',
  '/p/[slug]/private', // Tab 2 (Private) requires authentication
];

// Routes that require admin role
const adminRoutes = [
  '/admin',
];

/**
 * Check if a path matches a route pattern (supports wildcards like [slug])
 */
function matchesRoute(pathname: string, route: string): boolean {
  if (route.includes('[')) {
    // Convert pattern like /p/[slug] to regex
    const pattern = route.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  }
  return pathname === route || pathname.startsWith(route + '/');
}

/**
 * Fast check: Does the session cookie exist?
 * This is much faster than database validation
 *
 * Note: In production with useSecureCookies: true, the cookie name
 * will be __Secure-better-auth.session_token instead of better-auth.session_token
 */
function hasSessionCookie(request: NextRequest): boolean {
  // Check for Better Auth session token cookie
  // Try both names: regular and __Secure- prefixed (for production)
  const sessionToken = request.cookies.get('better-auth.session_token')?.value ||
                      request.cookies.get('__Secure-better-auth.session_token')?.value;
  return !!sessionToken;
}

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => matchesRoute(pathname, route));

  // If public route, let it pass immediately (no DB call needed)
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => matchesRoute(pathname, route));

  // For protected routes, use fast two-tier validation
  if (isProtectedRoute) {
    // Tier 1: Fast cookie check (no DB call)
    if (!hasSessionCookie(request)) {
      // No session cookie - definitely not authenticated
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Tier 2: Let the page handle full session validation
    // The dashboard page will do proper DB validation
    // This avoids blocking in middleware while still protecting routes
    // If session is invalid, the page will handle the redirect
    return NextResponse.next();
  }

  // Check if route is admin (same two-tier approach)
  const isAdminRoute = adminRoutes.some((route) => matchesRoute(pathname, route));
  if (isAdminRoute) {
    if (!hasSessionCookie(request)) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
    // Admin page will do role validation
    return NextResponse.next();
  }

  // Redirect authenticated users away from sign-in/sign-up pages
  // Still use cookie check for this - fast and effective
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';
  if (isAuthPage && hasSessionCookie(request)) {
    // User has session cookie - redirect to dashboard
    // Let the dashboard validate the actual session
    const redirectParam = nextUrl.searchParams.get('redirect');
    const targetUrl = redirectParam || '/dashboard';
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public files (images, etc.)
   * - CSS and JS files
   */
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|json|ico)$).*)',
};
