import { NextResponse, type NextRequest } from 'next/server';

const publicRoutes = ['/login', '/register', '/reset-password', '/'];
const publicPrefixes = ['/_next', '/api', '/favicon'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and static files
  if (
    publicRoutes.some((route) => pathname === route) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.startsWith('/features') ||
    pathname.startsWith('/pricing')
  ) {
    return NextResponse.next();
  }

  // Try to get session via the auth API
  try {
    const response = await fetch(
      new URL('/api/auth/get-session', request.url),
      {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      if (data?.user) {
        return NextResponse.next();
      }
    }
  } catch {
    // If fetch fails, continue to redirect
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};