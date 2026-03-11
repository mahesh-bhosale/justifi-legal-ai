import { NextRequest, NextResponse } from 'next/server';

const TOKEN_COOKIE = 'justifi_token';

// Edge-safe base64url decode (middleware runs on Edge runtime).
function base64UrlToUtf8(base64Url: string): string | null {
  try {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return atob(padded);
  } catch {
    return null;
  }
}

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return false;

  // Basic JWT shape validation + decodable payload check.
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const payload = base64UrlToUtf8(parts[1]);
  if (!payload) return false;

  // Optional: ensure payload is JSON (prevents random strings bypassing).
  try {
    JSON.parse(payload);
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Protect dashboard routes
  if (!isAuthenticated(request)) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('returnUrl', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
