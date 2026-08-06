import type { NextRequest, NextResponse } from 'next/server';

// Mobile device detection and redirects to /mobile/* routes have been
// disabled. All devices, including mobile, now serve the desktop routes.
export function proxy(_request: NextRequest): NextResponse | void {
  return;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|.*\\..*).*)',
  ],
};
