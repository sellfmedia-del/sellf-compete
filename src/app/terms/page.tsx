// Dosya Yolu: src/app/terms/page.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 font-sans selection:bg-orange-500/30">
      <div className="max-w-4xl mx-auto px-8 py-24">
        
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-orange-500 transition-colors mb-12">
          <ArrowLeft size={14} /> Back to SellfCompete
        </Link>

        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-4">
          Terms <span className="text-orange-500">& Conditions</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-12 border-b border-zinc-800 pb-8">
          Last Updated: April 2026
        </p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">1. Acceptance of Terms</h2>
            <p>By accessing and using SellfCompete, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">2. Description of Service</h2>
            <p>SellfCompete provides an AI-powered SaaS tracking platform for e-commerce and market intelligence. Access to the platform features is granted through a credit-based subscription model.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">3. Payments, Credits, and Billing</h2>
            <ul className="space-y-4 list-none pl-0">
              <li><strong className="text-zinc-200">Subscriptions & MoR:</strong> All payments are securely processed by Paddle.com, our authorized Merchant of Record. By subscribing to the $22.00 Pro Access plan, you agree to recurring monthly billing.</li>
              <li><strong className="text-zinc-200">Credit Ecosystem:</strong> Services are consumed via "Credits". Base subscriptions grant a specific monthly credit allowance. Additional credits can be purchased as one-time add-ons (e.g., $1.90 per credit). Unused subscription credits roll over to the next billing cycle as long as the subscription remains active.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">4. Acceptable Use</h2>
            <p>You agree not to use the SellfCompete AI engine to scrape, track, or analyze data for illegal, fraudulent, or malicious purposes. We reserve the right to terminate accounts that violate our usage policies or attempt to bypass security measures.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">5. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of the Republic of Turkey, specifically within the jurisdiction of Istanbul, without regard to its conflict of law provisions.</p>
          </section>
        </div>
      </div>
    </div>
  );
}