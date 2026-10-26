import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { previewIsReadOnly } from './preview-safety';
import { createClient as createCookieClient } from '../utils/supabase/server';

export class AccessError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) { super(message); this.status = status; this.code = code; }
}

export function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function authenticatedClient(request: Request) {
  if (previewIsReadOnly()) throw new AccessError('This preview protects live data. Writing scans and account changes is disabled until a test database is connected.', 403, 'PREVIEW_READ_ONLY');
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  const client = token ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } }) : await createCookieClient();
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) throw new AccessError('Please sign in to continue.', 401, 'UNAUTHORIZED');
  return { client, user };
}

export type CreditProfile = { credits: number | null; is_trial: boolean; trial_ends_at: string | null; paddle_status: string | null };
export function checkEntitlement(profile: CreditProfile | null, arena: boolean, now = Date.now()) {
  if (!profile) throw new AccessError('Profile could not be loaded.', 403, 'PROFILE_MISSING');
  if (profile.is_trial && (!profile.trial_ends_at || Date.parse(profile.trial_ends_at) <= now || !Number.isFinite(Date.parse(profile.trial_ends_at)))) throw new AccessError('Your free trial has ended. Choose a subscription to continue.', 403, 'TRIAL_EXPIRED');
  if (arena && (profile.is_trial || profile.paddle_status !== 'active')) throw new AccessError('Arena requires an active subscription.', 403, 'SUBSCRIPTION_REQUIRED');
  if (!Number.isInteger(profile.credits) || (profile.credits ?? 0) <= 0) throw new AccessError('You have no credits remaining. Add credits to continue.', 402, 'CREDITS_EXHAUSTED');
}

// Compare-and-swap updates prevent concurrent requests from spending the same balance.
// Reserve before external work; failed scans refund through the same conditional update.
export async function changeCredit(client: SupabaseClient, userId: string, amount: 1 | -1, arena = false): Promise<number> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const { data, error } = await client.from('profiles').select('credits,is_trial,trial_ends_at,paddle_status').eq('id', userId).single();
    if (error) throw new AccessError('Credit balance could not be loaded.', 503, 'BILLING_UNAVAILABLE');
    if (amount === -1) checkEntitlement(data, arena);
    if (!data || !Number.isInteger(data.credits)) throw new AccessError('Credit balance could not be loaded.', 503, 'BILLING_UNAVAILABLE');
    const next = data.credits + amount;
    const { data: updated, error: updateError } = await client.from('profiles').update({ credits: next, updated_at: new Date().toISOString() }).eq('id', userId).eq('credits', data.credits).select('credits').maybeSingle();
    if (updateError) throw new AccessError('Credit balance could not be updated.', 503, 'BILLING_UNAVAILABLE');
    if (updated) return updated.credits;
  }
  throw new AccessError('Your balance is being updated. Please try again shortly.', 409, 'BALANCE_BUSY');
}

export async function withCredit<T>(client: SupabaseClient, userId: string, arena: boolean, work: () => Promise<T>): Promise<T> {
  await changeCredit(client, userId, -1, arena);
  try { return await work(); }
  catch (error) {
    try { await changeCredit(client, userId, 1); }
    catch { console.error('[Billing] Credit refund needs reconciliation', { userId }); }
    throw error;
  }
}
