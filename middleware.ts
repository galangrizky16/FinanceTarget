// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/income',
  '/expense',
  '/daily-target',
  '/percentage',
  '/setup-target',
];

const AUTH_ROUTES = ['/login', '/register'];

// Route yang butuh target — /setup-target TIDAK masuk sini (dia justru halaman buatnya)
const REQUIRES_TARGET_ROUTES = [
  '/dashboard',
  '/income',
  '/expense',
  '/daily-target',
  '/percentage',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ✅ getUser() — server-verified, aman dari cookie tampering
  const { data: { user } } = await supabase.auth.getUser();

  const isProtected    = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute    = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const requiresTarget = REQUIRES_TARGET_ROUTES.some((r) => pathname.startsWith(r));

  // Belum login → akses halaman protected → redirect ke /login
  if (!user && isProtected) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Sudah login → akses /login atau /register → redirect ke /dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Cek target — cukup pastikan ada baris target milik user, tanpa filter is_active
  if (user && requiresTarget) {
    const { count } = await supabase
      .from('targets')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (!count || count === 0) {
      return NextResponse.redirect(new URL('/setup-target', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};