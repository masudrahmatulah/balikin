import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// CONSTANTS
// ============================================================================

// Pre-compiled regex patterns for better performance
const DEVICE_PATTERNS = [
  /android/i,
  /iphone/i,
  /ipad/i,
  /ipod/i,
  /blackberry/i,
  /windows phone/i,
  /webos/i,
  /opera mini/i,
  /iemobile/i,
  /mobile/i,
] as const;

const SKIP_PATHS = [
  '/mobile',
  '/api',
  '/_next',
  '/sign-in',
  '/sign-up',
  '/scan',
];

// File extensions to skip (public assets)
const FILE_EXTENSIONS = [
  '.js', '.css', '.json', '.ico', '.png', '.jpg', '.jpeg', '.gif',
  '.svg', '.webp', '.woff', '.woff2', '.ttf', '.eot',
] as const;

// ============================================================================
// VALIDATION
// ============================================================================

function sanitizeUserAgent(userAgent: string | null): string {
  if (!userAgent) return '';
  return userAgent.trim().slice(0, 500);
}

function isMobileDevice(userAgent: string): boolean {
  const sanitizedUA = userAgent.toLowerCase();
  return DEVICE_PATTERNS.some((pattern) => pattern.test(sanitizedUA));
}

function shouldSkipPath(pathname: string): boolean {
  return SKIP_PATHS.some(path => pathname.startsWith(path)) ||
         FILE_EXTENSIONS.some(ext => pathname.endsWith(ext));
}

// ============================================================================
// PROXY FUNCTION
// ============================================================================

export function proxy(request: NextRequest): NextResponse | void {
  const { pathname } = request.nextUrl;
  const userAgent = sanitizeUserAgent(request.headers.get('user-agent'));

  if (shouldSkipPath(pathname)) {
    return;
  }

  const slugMatch = pathname.match(/^\/p\/([^/]+)/);
  if (slugMatch && isMobileDevice(userAgent)) {
    const slug = slugMatch[1];
    if (!slug) return;

    const url = request.nextUrl.clone();
    url.pathname = `/mobile/claim/${slug}`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/p/')) {
    return;
  }

  // Don't redirect home page (/) - let mobile users see landing page
  // Only redirect other pages to mobile view
  if (pathname !== '/' && isMobileDevice(userAgent)) {
    const url = request.nextUrl.clone();
    url.pathname = '/mobile';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|.*\\..*).*)',
  ],
};
