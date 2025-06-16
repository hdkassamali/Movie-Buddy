import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if environment variables are loaded
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return NextResponse.json(
        {
          error: 'Supabase environment variables not configured',
          missingVars: {
            url: !process.env.NEXT_PUBLIC_SUPABASE_URL,
            anonKey: !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          },
        },
        { status: 500 }
      );
    }

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Cookies can't be set in route handlers
            }
          },
        },
      }
    );

    // Test the connection by trying to query the auth users (this will work even with empty database)
    const { error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        {
          error: 'Supabase connection failed',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Supabase connection successful!',
      environmentCheck: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? 'configured'
          : 'missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? 'configured'
          : 'missing',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
          ? 'configured'
          : 'missing',
      },
      connectionTest: 'passed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unexpected error testing Supabase connection',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
