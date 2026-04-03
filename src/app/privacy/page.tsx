// Dosya Yolu: src/app/privacy/page.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 font-sans selection:bg-orange-500/30">
      <div className="max-w-4xl mx-auto px-8 py-24">
        
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-orange-500 transition-colors mb-12">
          <ArrowLeft size={14} /> Back to SellfCompete
        </Link>

        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-4">
          Privacy <span className="text-orange-500">Policy</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-12 border-b border-zinc-800 pb-8">
          Last Updated: April 2026
        </p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">1. Introduction</h2>
            <p>Welcome to SellfCompete. This Privacy Policy explains how we collect, use, and protect your personal and business data when you use our AI-driven market intelligence ecosystem.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">2. Information We Collect</h2>
            <ul className="space-y-4 list-none pl-0">
              <li><strong className="text-zinc-200">Account Information:</strong> When you create an account, we collect your business email address and securely hashed authentication credentials.</li>
              <li><strong className="text-zinc-200">Payment Information:</strong> We do not store your credit card details. All financial transactions are processed securely by our Merchant of Record, Paddle.com.</li>
              <li><strong className="text-zinc-200">Usage Data:</strong> We collect data regarding your product tracking inputs, AI analysis requests, and credit consumption to maintain and improve our services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">3. Third-Party Data Processing & AI</h2>
            <p>SellfCompete utilizes third-party AI models (including Google Generative AI and Tavily) to process the public market data and URLs you provide. Your proprietary business strategies or account emails are not used to train these external models.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">4. Our Merchant of Record</h2>
            <p>Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns regarding payment and billing.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-4 tracking-tight">5. Contact Us</h2>
            <p>For any privacy-related questions or data deletion requests, please contact us at: <a href="mailto:support@sellfcompete.com" className="text-orange-500 hover:underline">support@sellfcompete.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}