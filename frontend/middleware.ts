import { NextRequest, NextResponse } from 'next/server';

// Server-side helper to decode JWT token from cookie
function decodeTokenFromCookie(token: string): { id: string; role: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode base64 URL-safe string
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - payload.length % 4) % 4;
    payload += '='.repeat(padding);
    
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    const userData = JSON.parse(decoded);
    
    const userId = String(userData.sub || userData.userId || userData.id || '').trim();
    const userRole = String(userData.role || 'citizen').trim();
    const userEmail = String(userData.email || '').trim();
    
    if (!userId) {
      return null;
    }
    
    return {
      id: userId,
      role: userRole,
      email: userEmail,
    };
  } catch {
    return null;
  }
}

// Server-side authentication check
function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get('justifi_token')?.value;
  if (!token) {
    return false;
  }
  
  const user = decodeTokenFromCookie(token);
  return !!user;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Check if user is authenticated using server-side cookie reading
    if (!isAuthenticated(request)) {
      // Redirect to login page
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
