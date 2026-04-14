import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

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

export async function middleware(request: NextRequest) {
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

  // If public route, let it pass
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => matchesRoute(pathname, route));

  // For protected routes, we need to validate the session
  if (isProtectedRoute) {
    try {
      // Get session from Better Auth - this validates against database
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user?.id) {
        // No valid session - redirect to sign-in
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(signInUrl);
      }
    } catch (error) {
      // Session validation failed - redirect to sign-in
      console.error('Middleware session validation error:', error);
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Check if route is admin (additional role check done in page)
  const isAdminRoute = adminRoutes.some((route) => matchesRoute(pathname, route));
  if (isAdminRoute) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user?.id) {
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(signInUrl);
      }
    } catch {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Redirect authenticated users away from sign-in/sign-up pages
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';
  if (isAuthPage) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (session?.user?.id) {
        // Already authenticated - redirect to dashboard or original destination
        const redirectParam = nextUrl.searchParams.get('redirect');
        const targetUrl = redirectParam || '/dashboard';
        return NextResponse.redirect(new URL(targetUrl, request.url));
      }
    } catch {
      // Session check failed, continue to auth page
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - CSS and JS files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|json|ico)$).*)',
  ],
};
