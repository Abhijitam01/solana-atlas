import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/playground/hello-anchor';

  // Handle OAuth errors from provider
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(new URL('/auth/auth-code-error', requestUrl.origin));
  }

  // If no code, redirect to error page
  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(new URL('/auth/auth-code-error', requestUrl.origin));
  }

  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      return NextResponse.redirect(new URL('/auth/auth-code-error', requestUrl.origin));
    }
  } catch (err) {
    console.error('Unexpected error in callback:', err);
    return NextResponse.redirect(new URL('/auth/auth-code-error', requestUrl.origin));
  }

  // Redirect to dashboard or original destination
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;
  const redirectUrl = new URL(redirectTo, baseUrl);
  
  return NextResponse.redirect(redirectUrl);
}
