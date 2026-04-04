import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user, session as sessionTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

/**
 * Get session manually from database
 */
async function getManualSession(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    // Find session from database
    const sessionRecord = await db
      .select({
        session: sessionTable,
        user: user,
      })
      .from(sessionTable)
      .innerJoin(user, eq(sessionTable.userId, user.id))
      .where(eq(sessionTable.token, sessionToken))
      .limit(1);

    if (!sessionRecord.length) {
      return null;
    }

    const sessionData = sessionRecord[0];

    // Check if session is expired
    if (new Date(sessionData.session.expiresAt) < new Date()) {
      await db.delete(sessionTable).where(eq(sessionTable.token, sessionToken));
      return null;
    }

    return {
      user: sessionData.user,
      session: sessionData.session,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Try manual session first (since Better Auth API doesn't work)
  let session: any = await getManualSession(request);

  // Fallback to Better Auth if manual fails
  if (!session) {
    try {
      const betterAuthSession = await auth.api.getSession({
        headers: request.headers,
      });
      session = betterAuthSession;
    } catch {
      session = null;
    }
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

  // Check admin role
  if (isAdminRoute && isAuthenticated) {
    const userRole = session.user?.role;
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard?error=no-admin', request.url));
    }
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
