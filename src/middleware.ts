import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// The function MUST be named `middleware` and it MUST be exported.
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create a Supabase client configured to use cookies, essential for server-side auth.
  const supabase = createMiddlewareClient({ req, res });

  // Refresh the session to ensure it's up-to-date. This is crucial.
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // --- Main Routing Logic ---

  // RULE 1: If user is not logged in and tries to access a protected page, redirect to login.
  if (!session && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // RULE 2: If user is logged in and tries to access the login page, redirect to dashboard.
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // RULE 3: If user is logged in and visits the root page, redirect to dashboard.
  if (session && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // RULE 4: If user is not logged in and visits the root page, redirect to login.
  if (!session && pathname === '/') {
      return NextResponse.redirect(new URL('/login', req.url));
  }

  // If none of the above rules match, continue to the requested page.
  return res;
}

// This config specifies which paths the middleware should run on.
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/login',
  ],
};