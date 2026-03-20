// Dosya Yolu: src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
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

  // Rota Tanımlamaları
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isLandingPage = request.nextUrl.pathname === '/'; // ANA SAYFAYI TANIMLADIK

  // KURAL 1: Giriş YAPMAMIŞ biri korunan sayfaya (Dashboard) girmeye çalışırsa
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // KURAL 2: Zaten giriş YAPMIŞ biri Login veya Register sayfasına girmeye çalışırsa
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // KURAL 3 (YENİ SaaS STANDARDI): Zaten giriş YAPMIŞ biri Ana Sayfaya (Vitrine) gelirse onu direkt çalışma alanına al
  if (isLandingPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Diğer tüm durumlarda (Giriş yapmamış birinin Ana Sayfayı gezmesi gibi) geçişe izin ver
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};