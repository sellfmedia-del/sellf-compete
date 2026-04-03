// Dosya Yolu: src/app/refund/page.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 font-sans selection:bg-orange-500/30">
      <div className="max-w-4xl mx-auto px-8 py-24">
        
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-orange-500 transition-colors mb-12">
          <ArrowLeft size={14} /> Back to SellfCompete
        </Link>

        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-4">
          Refund <span className="text-orange-500">Policy</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-12 border-b border-zinc-800 pb-8">
          Last Updated: April 2026
        </p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">1. Digital Goods and Services</h2>
            <p>SellfCompete operates as a digital SaaS platform providing immediate access to AI processing capabilities and market intelligence tracking. Due to the computational costs associated with AI generation, our refund policy is strictly defined.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">2. 14-Day Cooling-Off Period</h2>
            <p>We offer a full refund on your initial subscription payment within 14 days of the purchase date, <strong className="text-orange-500">provided that no credits have been consumed</strong>. If you have generated an AI report, initialized a tracker, or consumed any credits, the service is considered "used," and the payment becomes non-refundable.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">3. Subscription Cancellations</h2>
            <p>You may cancel your monthly Pro Access subscription at any time through your Account Dashboard. Cancellation will stop future billing. You will retain access to your workspace and previously accumulated credits until the end of your current paid billing cycle. We do not provide prorated refunds for mid-cycle cancellations.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">4. Extra Credit Purchases</h2>
            <p>One-time purchases of extra credits (e.g., the $1.90 add-on) are final and non-refundable once the credits are added to your account balance.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">5. How to Request a Refund</h2>
            <p>If you meet the criteria for an unused refund within the 14-day window, please contact our Merchant of Record, Paddle, or email us directly at <a href="mailto:support@sellfcompete.com" className="text-orange-500 hover:underline">support@sellfcompete.com</a> with your account email and transaction ID.</p>
          </section>
        </div>
      </div>
    </div>
  );
}