'use client';
import { useId, useRef, useState, useEffect } from 'react';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import { CREDIT_PRICE_ID, SUBSCRIPTION_PRICE_ID } from '@/src/lib/payment-policy';
import { createClient } from '@/src/utils/supabase/client';

export default function CheckoutPanel({ onConfirmed }: { onConfirmed?: () => void }) {
  const frameClass = `compete-checkout-${useId().replace(/[^a-z0-9]/gi, '')}`;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasCheckout, setHasCheckout] = useState(false);
  const instance = useRef<Paddle | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearInterval(timer.current); instance.current?.Checkout.close(); }; }, []);

  const openCheckout = async (plan: 'credit' | 'subscription') => {
    if (busy) return;
    setBusy(true); setMessage(null);
    try {
      const configuration = await fetch('/api/checkout', { cache: 'no-store' });
      if (!configuration.ok || !(await configuration.json()).enabled) throw new Error('Payments are disabled in this preview to protect live accounts.');
      const client = createClient();
      const { data: { user } } = await client.auth.getUser();
      if (!user?.email) throw new Error('Please sign in to continue.');
      const { data: before } = await client.from('profiles').select('credits,is_trial,paddle_status').eq('id', user.id).single();
      if (!before) throw new Error('Your account could not be loaded. Please try again.');
      if (plan === 'credit' && before?.is_trial) throw new Error('Choose a subscription to continue beyond your free trial.');
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      if (!token) throw new Error('Checkout is temporarily unavailable. Please try again later.');
      const paddle = await initializePaddle({
        token, environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
        eventCallback: event => {
          if (!mounted.current) return;
          if (event.name !== 'checkout.completed') return;
          setMessage('Payment received. Waiting for your balance to be confirmed…');
          let checks = 0;
          clearInterval(timer.current);
          timer.current = setInterval(async () => {
            checks++;
            const { data: after } = await client.from('profiles').select('credits,is_trial,paddle_status').eq('id', user.id).single();
            if (!mounted.current) { clearInterval(timer.current); return; }
            if (after && (after.credits > (before?.credits ?? 0)) && (plan !== 'subscription' || after.paddle_status === 'active' && !after.is_trial)) {
              clearInterval(timer.current); setMessage('Your balance is confirmed. You can continue.'); setBusy(false); setHasCheckout(false); onConfirmed?.();
            } else if (checks >= 15) {
              clearInterval(timer.current); setMessage('Payment confirmation is still processing. Please check your account shortly; avoid paying again.'); setBusy(false);
            }
          }, 2000);
        },
      });
      if (!paddle) throw new Error('Checkout could not be loaded.');
      if (!mounted.current) return;
      instance.current = paddle;
      setHasCheckout(true);
      paddle.Checkout.open({
        items: [{ priceId: plan === 'subscription' ? SUBSCRIPTION_PRICE_ID : CREDIT_PRICE_ID, quantity: 1 }],
        customer: { email: user.email }, customData: { userId: user.id, app: 'sellfcompete', planType: plan },
        settings: { displayMode: 'inline', theme: 'dark', variant: 'one-page', frameTarget: frameClass, frameInitialHeight: 450, frameStyle: 'width:100%;min-width:312px;background-color:transparent;border:none;' },
      });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Checkout is unavailable.'); setBusy(false); }
  };
  return <section aria-label="Subscription and credits" className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button type="button" onClick={() => openCheckout('credit')} disabled={busy} className="text-left rounded-2xl border border-zinc-700 p-4 hover:border-orange-500 disabled:opacity-50"><span className="block font-bold">Add 1 credit</span><span className="block text-xs text-zinc-400 mt-2">For an additional audit or update</span></button>
      <button type="button" onClick={() => openCheckout('subscription')} disabled={busy} className="text-left rounded-2xl border border-orange-500/50 bg-orange-500/10 p-4 hover:border-orange-500 disabled:opacity-50"><span className="block font-bold text-orange-400">Pro subscription</span><span className="block text-xs text-zinc-400 mt-2">5 credits per month · Arena access</span></button>
    </div>
    {hasCheckout && <p className="text-xs text-zinc-400">Review the price, billing interval and taxes in the secure checkout below before confirming.</p>}
    <div className={frameClass} />
    {message && <p role="status" className="text-sm text-orange-300 leading-relaxed">{message}</p>}
    {busy && <button type="button" onClick={() => { instance.current?.Checkout.close(); clearInterval(timer.current); setBusy(false); setHasCheckout(false); }} className="text-xs text-zinc-400 underline">Close checkout</button>}
  </section>;
}
