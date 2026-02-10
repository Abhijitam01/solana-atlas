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

  // Redirect authenticated users away from login/signup pages
  // But allow authenticated users to view the landing page (/)
  if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
    // Default authenticated landing should open the hello-solana template
    return NextResponse.redirect(new URL('/playground/hello-solana', request.url));
  }

  // Allow unauthenticated access to playground routes - auth will be checked when editing code
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
