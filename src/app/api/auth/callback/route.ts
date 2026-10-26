import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) {
    const client = await createClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) {
      const next = url.searchParams.get('next');
      const destination = next === '/update-password' ? next : '/dashboard';
      return NextResponse.redirect(new URL(destination, url.origin));
    }
  }
  return NextResponse.redirect(new URL('/login?error=verification', url.origin));
}
