import { notFound } from 'next/navigation';
import Review from './review';
export const dynamic = 'force-dynamic';
export default function Page() {
  if (process.env.VERCEL_ENV !== 'preview' && process.env.COMPETE_UI_REVIEW !== '1') notFound();
  return <Review />;
}
