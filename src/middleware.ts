// Dosya Yolu: src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // 1. Orijinal yanıt nesnemiz (Supabase çerezleri buraya yazacak)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isLockedRoute = request.nextUrl.pathname.startsWith('/dashboard/arena') || request.nextUrl.pathname.startsWith('/dashboard/my-products');

  // KURAL 1: Giriş YAPMAMIŞ
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    return copyCookies(response, redirectResponse); // Çerezleri koru
  }

  // KURAL 2: Giriş YAPMIŞ ama Auth sayfasına gidiyor
  if (isAuthRoute && user) {
    const redirectUrl = new URL('/dashboard', request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    return copyCookies(response, redirectResponse);
  }

  // KURAL 3: (HARD LOCK)
  if (isLockedRoute && user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('paddle_status')
      .eq('id', user.id)
      .single();

    // VERCEL LOGLARI İÇİN DEBUGGER (Sorun çıkarsa Vercel > Logs sekmesine bak)
    console.log(`[Middleware Debug] User: ${user.id}`);
    console.log(`[Middleware Debug] Profile Data:`, profile);
    console.log(`[Middleware Debug] Error (if any):`, error?.message);

    if (error || !profile || profile.paddle_status !== 'active') {
      console.log(`[Middleware Debug] REDIRECTING TO ACCOUNT! Status is: ${profile?.paddle_status}`);
      const redirectUrl = new URL('/dashboard/account', request.url);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      return copyCookies(response, redirectResponse); // ÇÖZÜM BURADA: Çerezleri yeni yönlendirmeye taşıyoruz
    }
  }

  return response;
}

// YARDIMCI FONKSİYON: Çerez Kaybını Önlemek İçin
function copyCookies(sourceResponse: NextResponse, targetResponse: NextResponse) {
  sourceResponse.cookies.getAll().forEach((cookie) => {
    targetResponse.cookies.set(cookie.name, cookie.value);
  });
  return targetResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};