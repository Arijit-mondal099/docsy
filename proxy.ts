import { NextResponse, type NextRequest } from 'next/server';
import { getEnv } from '@/lib/env';

// Validate environment variables at startup — fails fast in production if misconfigured.
if (process.env.NODE_ENV !== 'development') {
  getEnv();
}

// Routes that are only for unauthenticated users — redirect authenticated users away.
const authRoutes = ['/', '/login', '/register', '/reset-password'];

// Prefixes always allowed through without any session check.
const publicPrefixes = ['/_next', '/api', '/favicon'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = authRoutes.some((route) => pathname === route);
  const isPublicPrefix = publicPrefixes.some((prefix) => pathname.startsWith(prefix));

  // Always allow static assets and API routes (the API handles its own auth).
  if (isPublicPrefix) {
    return NextResponse.next();
  }

  // Try to get session via the auth API
  try {
    const response = await fetch(new URL('/api/auth/get-session', request.url), {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Handle both { user: {...} } and direct user object responses
      const user = data?.user ?? data;
      if (user && typeof user === 'object' && 'id' in user) {
        // User is authenticated — redirect away from auth routes to dashboard
        if (isAuthRoute) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
      }
    }
  } catch {
    // If fetch fails, continue to the unauthenticated logic below
  }

  // No valid session found
  if (isAuthRoute) {
    // Allow unauthenticated users on auth routes (landing, login, register, etc.)
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
