import { NextResponse } from 'next/server';
import { Environment, LogLevel, Paddle } from '@paddle/paddle-node-sdk';
import { adminClient } from '@/src/lib/server-access';
import { previewIsReadOnly } from '@/src/lib/preview-safety';
import { paymentEntitlement } from '@/src/lib/payment-policy';

export async function POST(request: Request) {
  if (previewIsReadOnly()) return NextResponse.json({ error: 'Preview is read-only.' }, { status: 503 });
  const signature = request.headers.get('paddle-signature');
  if (!signature || !process.env.PADDLE_WEBHOOK_SECRET) return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  const paddle = new Paddle(process.env.PADDLE_API_KEY!, { environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production' ? Environment.production : Environment.sandbox, logLevel: LogLevel.error });
  let event;
  try { event = await paddle.webhooks.unmarshal(await request.text(), process.env.PADDLE_WEBHOOK_SECRET, signature); }
  catch { return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 }); }
  try {
    const admin = adminClient();
    if (event.eventType === 'transaction.completed') {
      const transaction = event.data;
      const custom = transaction.customData;
      if (!custom || custom.app !== 'sellfcompete' || typeof custom.userId !== 'string') return NextResponse.json({ status: 'ignored' });
      // Entitlements are derived from signed catalog items, not client-supplied planType.
      const entitlement = paymentEntitlement(transaction.items);
      if (entitlement.plan === 'subscription' && !transaction.subscriptionId) throw new Error('Missing subscription ID.');
      const { error } = await admin.rpc('apply_compete_payment', {
        p_user_id: custom.userId, p_transaction_id: transaction.id, p_credits: entitlement.credits,
        p_plan: entitlement.plan, p_price_paid: Number(transaction.details?.totals?.grandTotal || '0') / 100,
        p_subscription_id: transaction.subscriptionId, p_customer_id: transaction.customerId, p_occurred_at: event.occurredAt,
      });
      if (error) throw new Error('Payment could not be recorded.');
    } else if (event.eventType === 'subscription.updated' || event.eventType === 'subscription.canceled' || event.eventType === 'subscription.paused' || event.eventType === 'subscription.past_due' || event.eventType === 'subscription.resumed' || event.eventType === 'subscription.activated') {
      const { error } = await admin.rpc('apply_compete_subscription_status', { p_subscription_id: event.data.id, p_status: event.data.status, p_occurred_at: event.occurredAt });
      if (error) throw new Error('Subscription status could not be recorded.');
    }
    return NextResponse.json({ status: 'success' });
  } catch {
    console.error('[Paddle] Verified event could not be applied', { eventId: event.eventId });
    return NextResponse.json({ error: 'Webhook processing is temporarily unavailable.' }, { status: 500 });
  }
}
