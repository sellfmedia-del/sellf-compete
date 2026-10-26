import { NextResponse } from 'next/server';
import { runArenaEngine } from '@/src/lib/services/arenaEngine';
import { AccessError, adminClient, authenticatedClient, withCredit } from '@/src/lib/server-access';
import { getPlatform } from '@/src/lib/platforms';

export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const { client, user } = await authenticatedClient(request);
    const { productId } = await request.json();
    if (typeof productId !== 'string' || !/^[0-9a-f-]{36}$/i.test(productId)) return NextResponse.json({ error: 'A valid product ID is required.' }, { status: 400 });
    const { data: old, error } = await client.from('user_products').select('*').eq('id', productId).eq('user_id', user.id).single();
    if (error || !old) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    if (!getPlatform(old.platform)) return NextResponse.json({ error: 'This saved platform is not supported. Please add the product using a supported platform.' }, { status: 400 });
    const data = await withCredit(adminClient(), user.id, true, async () => {
      const snapshot = await runArenaEngine(old.product_link, old.platform, old.category, old.competitor_brands || [], old.competitor_products || [], old.latest_data);
      const history = [{ ...old.latest_data, archived_at: old.latest_data?.observed_at || old.updated_at }, ...(Array.isArray(old.historical_data) ? old.historical_data : [])];
      let query = client.from('user_products').update({ latest_data: snapshot, historical_data: history, updated_at: snapshot.observed_at }).eq('id', productId).eq('user_id', user.id);
      query = old.updated_at ? query.eq('updated_at', old.updated_at) : query.is('updated_at', null);
      const { data, error: updateError } = await query.select().maybeSingle();
      if (updateError) throw new Error('Your scan could not be saved. The previous data has been preserved.');
      if (!data) throw new AccessError('This product was updated in another tab. Refresh to see the latest data.', 409, 'SCAN_CONFLICT');
      return data;
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Update failed.', code: error instanceof AccessError ? error.code : 'SCAN_FAILED' }, { status: error instanceof AccessError ? error.status : 502 });
  }
}
