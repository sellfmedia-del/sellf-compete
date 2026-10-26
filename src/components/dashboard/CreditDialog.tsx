'use client';
import { useEffect, useRef } from 'react';
import CheckoutPanel from './CheckoutPanel';

export function needsPurchase(code: unknown) {
  return ['CREDITS_EXHAUSTED', 'TRIAL_EXPIRED', 'SUBSCRIPTION_REQUIRED'].includes(String(code));
}

export default function CreditDialog({ open, message, onClose }: { open: boolean; message?: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  return <dialog ref={dialog} onCancel={onClose} onClose={onClose} className="m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 text-white border border-zinc-700 rounded-3xl p-6 sm:p-8 backdrop:bg-black/75" aria-labelledby="credit-dialog-title">
    <h2 id="credit-dialog-title" className="text-2xl font-bold">Continue with SellfCompete</h2>
    <p className="text-zinc-400 text-sm leading-relaxed mt-4">{message || 'You have no credits remaining. Add credits or choose a subscription to continue.'}</p>
    <div className="flex flex-col gap-3 mt-6">
      {open && <CheckoutPanel onConfirmed={onClose} />}
      <button type="button" onClick={onClose} className="text-sm py-2 text-zinc-400">Return to my work</button>
    </div>
  </dialog>;
}
