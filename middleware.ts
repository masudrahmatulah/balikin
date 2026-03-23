import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// Force Node.js runtime instead of Edge to avoid telemetry issues
export const runtime = 'nodejs';

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

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Get session from Better Auth
  let session = null;
  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch {
    // Treat transient auth/DB errors as unauthenticated in middleware.
    session = null;
  }

  const isAuthenticated = !!session;

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => {
    // Convert pattern like /p/[slug] to regex
    if (route.includes('[')) {
      const pattern = route.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return pathname === route;
  });

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route.includes('[')) {
      const pattern = route.replace(/\[.*?\]/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  // Redirect to sign-in if trying to access protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if trying to access sign-in/sign-up while authenticated
  if (isAuthenticated && (pathname === '/sign-in' || pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
