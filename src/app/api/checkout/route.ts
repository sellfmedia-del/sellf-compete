import { NextResponse } from 'next/server';
import { previewIsReadOnly } from '@/src/lib/preview-safety';
export async function GET() {
  return NextResponse.json({ readOnly: previewIsReadOnly(), enabled: !previewIsReadOnly() && !(process.env.VERCEL_ENV === 'preview' && process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production') });
}
