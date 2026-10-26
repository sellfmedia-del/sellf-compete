import { NextResponse } from 'next/server';
import { AccessError, adminClient, authenticatedClient } from '@/src/lib/server-access';

export async function POST(request: Request) {
  try {
    const { user } = await authenticatedClient(request);
    const body = await request.json();
    if (body.userId && body.userId !== user.id) return NextResponse.json({ error: 'You can only activate your own trial.' }, { status: 403 });
    if (!user.email_confirmed_at) return NextResponse.json({ error: 'Please verify your email before starting your trial.' }, { status: 403 });
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : '';
    if (!fullName || fullName.length > 200 || !companyName || companyName.length > 200) return NextResponse.json({ error: 'Please provide your name and company.' }, { status: 400 });
    const admin = adminClient();
    const { data: profile, error } = await admin.from('profiles').select('is_trial,trial_ends_at,company_name,credits,paddle_status').eq('id', user.id).single();
    if (error || !profile) throw new Error('Profile unavailable.');
    if (profile.is_trial) return NextResponse.json({ success: true, credits: profile.credits, trialEndsAt: profile.trial_ends_at });
    if (profile.paddle_status || profile.company_name || Date.now() - Date.parse(user.created_at) > 48 * 60 * 60 * 1000) return NextResponse.json({ error: 'This account is not eligible for a new trial.' }, { status: 409 });
    const { data: existing, error: checkError } = await admin.from('profiles').select('id,company_name').eq('is_trial', true);
    if (checkError) throw new Error('Eligibility check unavailable.');
    if (existing?.some(p => p.company_name?.trim().toLocaleLowerCase('tr') === companyName.toLocaleLowerCase('tr'))) return NextResponse.json({ error: 'A free trial has already been used for this company.' }, { status: 409 });
    const endsAt = new Date(Date.now() + 7 * 86400000).toISOString();
    // Only initialize an untouched profile; never reset an existing credit balance.
    const { data: updated, error: updateError } = await admin.from('profiles').update({ full_name: fullName, company_name: companyName, is_trial: true, trial_ends_at: endsAt, updated_at: new Date().toISOString() }).eq('id', user.id).eq('is_trial', false).is('company_name', null).select('credits,trial_ends_at').maybeSingle();
    if (updateError || !updated) return NextResponse.json({ error: 'Trial could not be activated. Please refresh and try again.' }, { status: 409 });
    return NextResponse.json({ success: true, credits: updated.credits, trialEndsAt: updated.trial_ends_at });
  } catch (error) {
    return NextResponse.json({ error: error instanceof AccessError ? error.message : 'Trial activation is temporarily unavailable.' }, { status: error instanceof AccessError ? error.status : 503 });
  }
}
