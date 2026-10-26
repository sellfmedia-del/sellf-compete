import { NextResponse } from 'next/server';
import { runArenaEngine } from '@/src/lib/services/arenaEngine';
import { validateArenaInput } from '@/src/lib/input-validation';
import { AccessError, adminClient, authenticatedClient, withCredit } from '@/src/lib/server-access';

export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const { client, user } = await authenticatedClient(request);
    let input: ReturnType<typeof validateArenaInput>;
    try { input = validateArenaInput(await request.json()); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid input.' }, { status: 400 }); }
    const data = await withCredit(adminClient(), user.id, true, async () => {
      const snapshot = await runArenaEngine(input.productLink, input.platform.id, input.category, input.competitorBrands, input.competitorProducts);
      const { data, error } = await client.from('user_products').insert({ user_id: user.id, product_link: input.productLink, platform: input.platform.id, category: input.category, competitor_brands: input.competitorBrands, competitor_products: input.competitorProducts, latest_data: snapshot, historical_data: [], updated_at: snapshot.observed_at }).select().single();
      if (error) throw new Error('The scan could not be saved. Please try again.');
      return data;
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const status = error instanceof AccessError ? error.status : 502;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Scan failed.', code: error instanceof AccessError ? error.code : 'SCAN_FAILED' }, { status });
  }
}
