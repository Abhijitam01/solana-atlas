import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Refresh session (updates cookies if needed)
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect authenticated users away from landing/auth pages
  if (user && (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/playground/hello-anchor', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/playground/:path*',
    '/my-code/:path*',
    '/auth/:path*',
  ],
};
