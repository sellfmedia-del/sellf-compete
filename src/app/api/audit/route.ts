import { NextResponse } from 'next/server';
import { runAuditEngine } from '@/src/lib/services/auditService';
import { getPlatform } from '@/src/lib/platforms';
import { publicUrl } from '@/src/lib/input-validation';
import { AccessError, adminClient, authenticatedClient, withCredit } from '@/src/lib/server-access';

export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const { user } = await authenticatedClient(request);
    const body = await request.json();
    const platform = getPlatform(body.platform);
    const url = typeof body.url === 'string' ? body.url.trim() : '';
    const type = body.type;
    const documentContent = typeof body.documentContent === 'string' ? body.documentContent : '';
    const language = body.language === 'Turkish' ? 'Turkish' : 'English';
    if (!platform || !['product', 'idea'].includes(type) || !url || url.length > 10000 || documentContent.length > 100000) return NextResponse.json({ error: 'Please provide a valid target, platform and document.' }, { status: 400 });
    if (type === 'product' && !['b2b', 'physical-store'].includes(platform.id) && !publicUrl(url)) return NextResponse.json({ error: 'Please enter a valid public URL.' }, { status: 400 });
    const report = await withCredit(adminClient(), user.id, false, async () => {
      const result = await runAuditEngine(url, type, platform.id, documentContent, language);
      if (!result || typeof result !== 'object' || Array.isArray(result) || !Array.isArray(result.topSellers) || !result.deepSentiment || !result.marketEconomics || !result.strategicGaps) throw new Error('The report response was incomplete.');
      return { ...result, product_name: url.slice(0, 120), report_id: crypto.randomUUID(), created_at: new Date().toISOString(), platform: platform.id };
    });
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error instanceof AccessError ? error.message : 'The audit could not be completed. Please try again.', code: error instanceof AccessError ? error.code : 'AUDIT_FAILED' }, { status: error instanceof AccessError ? error.status : 502 });
  }
}
