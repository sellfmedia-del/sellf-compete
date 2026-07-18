// Dosya Yolu: src/app/for-ecommerce/page.tsx
import React from 'react';
import Link from 'next/link';
import Navbar from '@/src/components/Navbar';
import {
  ArrowRight, TrendingDown, MessageSquareWarning, Clock3,
  Percent, Check, Sparkles
} from 'lucide-react';
import AuditPreviewMockup from '@/src/components/AuditPreviewMockup';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For E-Commerce Managers — SellfCompete',
  description: 'Built for e-commerce managers running Trendyol and Amazon stores. Know competitor pricing, sentiment, and gaps before your next pricing or ad decision.',
  openGraph: {
    title: 'SellfCompete for E-Commerce Managers',
    description: 'Stop making pricing and ad decisions blind. Audit your marketplace competitors in under 60 seconds.',
    url: 'https://www.sellfcompete.com/for-ecommerce',
    siteName: 'SellfCompete',
    type: 'website',
  },
};

const painPoints = [
  {
    icon: TrendingDown,
    title: 'You find out about a price drop after sales already fell',
    fix: 'Run an audit before every pricing review — see competitor prices as they are right now, not last week.',
  },
  {
    icon: MessageSquareWarning,
    title: 'You don\u2019t know what customers wish your competitors\u2019 products did',
    fix: 'Every audit extracts feature requests straight from competitor reviews — the product roadmap you didn\u2019t have to guess at.',
  },
  {
    icon: Clock3,
    title: 'Manual competitor checks eat an afternoon, every time',
    fix: 'One link or one product idea in, full report in under 60 seconds — no more open tabs across three marketplaces.',
  },
  {
    icon: Percent,
    title: 'You\u2019re guessing whether a category is even worth entering',
    fix: 'Market economics — category trend, estimated volume, and barrier to entry — before you commit budget or inventory.',
  },
];

const faqs = [
  {
    q: 'I manage multiple stores across Trendyol and Amazon — does this work for both?',
    a: 'Yes. Both platforms are fully supported with direct marketplace scraping in the same audit flow, so you don\u2019t need separate tools.',
  },
  {
    q: 'Can I run this before a pricing meeting?',
    a: 'That\u2019s exactly the use case it\u2019s built for — a full audit, including competitor pricing and market economics, takes under 60 seconds.',
  },
  {
    q: 'Do I need to know my competitors already, or can SellfCompete find them?',
    a: 'You can paste your own product link and SellfCompete identifies the real competitors dominating that category automatically.',
  },
];

export default function ForEcommercePage() {
  return (
    <div className="relative bg-[#0a0a0a] text-zinc-100 min-h-screen font-sans selection:bg-orange-500 selection:text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-orange-600/5 rounded-full blur-[100px]"></div>
      </div>

      <Navbar />

      {/* HERO */}
      <section className="relative pt-48 pb-20 px-6 border-b border-zinc-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Built for E-Commerce Managers</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-8 uppercase italic">
            Stop Pricing <span className="text-orange-500">Blind.</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Every pricing, ad, and inventory decision gets easier when you know exactly what your Trendyol and Amazon competitors are doing — before you decide, not after.
          </p>
          <Link href="/trial-signup" className="inline-flex bg-orange-500 text-black px-8 py-4 rounded-full font-black uppercase italic tracking-tight hover:bg-orange-400 transition-all items-center gap-2 group shadow-xl shadow-orange-500/20">
            Start Free Trial <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-4">3 free audits · No credit card · 7 days</p>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="relative py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white">
            Sound <span className="text-zinc-600">Familiar?</span>
          </h2>
        </div>

        <div className="space-y-4">
          {painPoints.map((p) => (
            <div key={p.title} className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-[2rem] p-8 flex flex-col md:flex-row gap-6 items-start">
              <p.icon className="text-orange-500 shrink-0" size={28} />
              <div>
                <h3 className="text-white font-bold text-base mb-2">{p.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed flex items-start gap-2">
                  <Check size={14} className="text-orange-500 shrink-0 mt-0.5" /> {p.fix}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MOCKUP */}
      <section className="relative py-12 px-6 border-y border-zinc-900/50">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">See It in Action</p>
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic text-white">
            This Is What Lands <span className="text-zinc-600">on Your Desk</span>
          </h2>
        </div>
        <AuditPreviewMockup />
      </section>

      {/* FAQ */}
      <section className="relative py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white">
            Common <span className="text-zinc-600">Questions</span>
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 md:p-8">
              <h3 className="text-base font-bold text-white mb-2 flex items-start gap-3">
                <Sparkles size={16} className="text-orange-500 shrink-0 mt-1" /> {f.q}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed pl-7">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 px-6 max-w-3xl mx-auto text-center border-t border-zinc-900/50">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-6">
          Your Next Pricing Call <span className="text-orange-500">Shouldn&rsquo;t Be a Guess.</span>
        </h2>
        <Link href="/trial-signup" className="inline-flex bg-orange-500 text-black px-10 py-5 rounded-full font-black uppercase italic tracking-tight hover:bg-orange-400 transition-all items-center gap-2 group shadow-xl shadow-orange-500/20">
          Start Free Trial <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}