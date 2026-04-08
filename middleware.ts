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

  // Check session cookie directly from request
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;
  const isAuthenticated = !!sessionToken;

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

  // Check if route is admin
  const isAdminRoute = adminRoutes.some((route) => {
    return pathname === route || pathname.startsWith(route + '/');
  });

  // Redirect to sign-in if trying to access protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Note: Admin role check is now handled in the admin layout/server component
  // We can't check roles in middleware without database access

  // Redirect authenticated users away from sign-in/sign-up pages to dashboard
  // Note: Don't redirect from /verify-otp as it handles post-login redirect itself
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';
  if (isAuthPage && isAuthenticated) {
    // Get redirect parameter if exists, otherwise go to dashboard
    const redirectParam = nextUrl.searchParams.get('redirect');
    const dashboardUrl = new URL(redirectParam || '/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
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
