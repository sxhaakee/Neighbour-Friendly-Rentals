import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/add-item',
  '/messages',
  '/profile',
  '/book',
  '/premium',
  '/my-listings',
  '/my-bookings',
  '/settings',
];

// Routes that require admin access
const ADMIN_ROUTES = [
  '/nfr-control',
];

// Routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = [
  '/auth',
  '/login',
  '/signup',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    const pathname = req.nextUrl.pathname;

    // Check route types
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
    const isAuth = AUTH_ROUTES.some(route => pathname.startsWith(route));

    // Skip if not a route we care about
    if (!isProtected && !isAdminRoute && !isAuth) {
      return res;
    }

    // Extract the auth token from cookies (Supabase stores session in cookies)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Middleware] Missing Supabase env vars');
      return res;
    }

    // Check for the Supabase auth token in cookies
    // Supabase JS client stores the session in cookies with various naming patterns
    const allCookies = req.cookies.getAll();
    const authCookie = allCookies.find(
      c => c.name.includes('auth-token') || 
           c.name.includes('sb-') && c.name.includes('-auth-token')
    );

    // Also check for the access token in the Authorization header
    const authHeader = req.headers.get('authorization');
    let accessToken = authHeader?.replace('Bearer ', '') || authCookie?.value;

    // Try to get session from Supabase auth cookies
    let isAuthenticated = false;
    let userId: string | null = null;

    if (accessToken) {
      try {
        // Use Supabase to verify the token
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        const { data: { user }, error } = await supabase.auth.getUser(accessToken);
        if (user && !error) {
          isAuthenticated = true;
          userId = user.id;
        }
      } catch {
        // Token invalid
      }
    }

    // If no token found in headers/cookies, check for the sb-*-auth-token cookie pattern
    if (!isAuthenticated) {
      const sbCookie = allCookies.find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
      if (sbCookie) {
        try {
          // Parse the cookie value (it's a JSON-encoded session)
          const parsed = JSON.parse(sbCookie.value);
          const token = parsed?.access_token || parsed?.[0];
          if (token) {
            const supabase = createClient(supabaseUrl, supabaseAnonKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            });
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (user && !error) {
              isAuthenticated = true;
              userId = user.id;
            }
          }
        } catch {
          // Cookie parse error — not authenticated
        }
      }
    }

    // Redirect unauthenticated users away from protected routes
    if ((isProtected || isAdminRoute) && !isAuthenticated) {
      const redirectUrl = new URL('/auth', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated users away from auth pages
    if (isAuth && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // For admin routes, verify admin status
    if (isAdminRoute && isAuthenticated && userId) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', userId)
        .single();

      const isAdmin = profile?.role === 'admin' || profile?.is_admin === true;

      if (!isAdmin) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return res;
  } catch (error) {
    console.error('[Middleware] Error:', error);
    return res;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/add-item/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/book/:path*',
    '/premium/:path*',
    '/my-listings/:path*',
    '/my-bookings/:path*',
    '/settings/:path*',
    '/nfr-control/:path*',
    '/auth/:path*',
    '/login/:path*',
    '/signup/:path*',
  ],
};
