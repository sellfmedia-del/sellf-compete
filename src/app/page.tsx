// Dosya Yolu: src/app/page.tsx
import React from 'react';
import Link from 'next/link';
import Navbar from '@/src/components/Navbar';
import { ArrowRight, Shield, Zap, Globe, LayoutGrid, Phone, Search, ScanSearch, FileOutput, Sparkles, X, Check } from 'lucide-react';
import AuditPreviewMockup from '@/src/components/AuditPreviewMockup';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SellfCompete — AI Competitor Audits for E-Commerce',
  description: 'Audit your Trendyol, Amazon, and marketplace competitors in seconds. AI-driven pricing gaps, sentiment analysis, and strategic insights for e-commerce sellers.',
  openGraph: {
    title: 'SellfCompete — AI Competitor Audits for E-Commerce',
    description: 'Eliminate guesswork. Audit your competitors with enterprise-grade data and AI-driven insights in seconds.',
    url: 'https://www.sellfcompete.com',
    siteName: 'SellfCompete',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'Which marketplaces does SellfCompete support?',
    a: 'Trendyol and Amazon are fully supported with direct marketplace scraping. For any other website or physical retail concept, SellfCompete runs a general web and market research audit instead.',
  },
  {
    q: 'How is this different from just researching competitors myself?',
    a: 'Manually checking competitors means opening dozens of tabs, tracking prices by hand, and reading reviews one by one — and the data is stale the moment you close the tab. SellfCompete pulls live marketplace data, cross-references it with web research, and structures it into pricing gaps, sentiment, and strategy in one pass.',
  },
  {
    q: 'Do I need a product link to run an audit?',
    a: "No. You can paste a live product link for a direct audit, or describe a product idea in plain text and SellfCompete will identify the category and find its real competitors.",
  },
  {
    q: 'How many audits do I get?',
    a: 'The Pro plan includes 5 deep market audits per month for $22/mo. The free trial includes 3 audits over 7 days, no credit card required.',
  },
  {
    q: 'What happens to my uploaded documents or data?',
    a: 'Any internal documents you upload are used only to cross-reference against market research for that specific audit. See our Privacy Policy for full details.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function LandingPage() {
  return (
    <div className="relative bg-[#0a0a0a] text-zinc-100 min-h-screen font-sans selection:bg-orange-500 selection:text-white overflow-hidden flex flex-col">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* BACKGROUND AESTHETICS (Mesh Gradient & Blur) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-orange-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150"></div>
      </div>

      <Navbar />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative pt-48 pb-20 px-6 border-b border-zinc-900/50">
          <div className="max-w-5xl mx-auto text-center">
            {/* H1: artık marka adı DEĞİL, gerçek değer önerisini taşıyor — büyük/italik stil korunuyor */}
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="block text-orange-500 uppercase">SellfCompete</span>
              AI Audits for<br className="hidden md:block" /> Marketplace Sellers
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Eliminate guesswork. Audit your Trendyol, Amazon, and marketplace competitors with enterprise-grade data and AI-driven insights in seconds.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/trial-signup" className="bg-orange-500 text-black px-8 py-4 rounded-full font-black uppercase italic tracking-tight hover:bg-orange-400 transition-all flex items-center gap-2 group shadow-xl shadow-orange-500/20">
                Start Free Trial <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link href="/register" className="bg-transparent border border-zinc-700 text-white px-6 py-4 rounded-full font-semibold hover:bg-zinc-900 hover:border-zinc-600 transition-all flex items-center gap-2">
                Get Started
              </Link>

              <Link
                href="https://www.sellfmedia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors text-sm font-medium underline underline-offset-4 decoration-zinc-700 hover:decoration-orange-500 px-2 py-4"
              >
                Meet the Team
              </Link>
            </div>

            <AuditPreviewMockup />
          </div>
        </section>

        {/* STATS BAR — gerçek ürün kapasitesi, uydurma müşteri sayısı değil */}
        <section className="relative py-14 px-6 border-b border-zinc-900/50">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '3', label: 'Marketplaces Covered' },
              { value: '10', label: 'Competitor Products Per Audit' },
              { value: '<60s', label: 'Link to Full Report' },
              { value: 'SellfScale MAI', label: 'AI Engine' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black italic text-white tracking-tighter mb-1">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* BENTO GRID FEATURES */}
        <section className="relative py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">What You Get</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white">
              One Audit, <span className="text-zinc-600">Full Picture</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[300px]">

            {/* Box 1: Deep Market Analysis (Platform Integration) */}
            <div className="md:col-span-8 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden relative group">
              <div className="z-10">
                <div className="flex gap-4 mb-6 flex-wrap">
                   <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold tracking-widest uppercase text-zinc-400">Trendyol</div>
                   <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold tracking-widest uppercase text-zinc-400">Amazon</div>
                   <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold tracking-widest uppercase text-zinc-400">Hepsiburada</div>
                   <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold tracking-widest uppercase text-zinc-400">Shopify</div>
                </div>
                <h3 className="text-3xl font-semibold mb-2 tracking-tight">Deep Market Analysis</h3>
                <p className="text-zinc-500 max-w-sm text-sm leading-relaxed">Real-time data scraping from global marketplaces and your own ecosystem — top sellers, live pricing, and category trends, not a static snapshot.</p>
              </div>
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/15 transition-all duration-700"></div>
              <LayoutGrid className="absolute right-10 top-10 text-white/5" size={120} />
            </div>

            {/* Box 2: Verified Platform Reports */}
            <div className="md:col-span-4 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center group">
              <Shield className="text-orange-500 mb-6 group-hover:scale-110 transition-transform duration-500" size={48} />
              <h3 className="text-xl font-semibold px-4 leading-tight">Verified platform reports directly from the data stream.</h3>
            </div>

            {/* Box 3: Credit Based Audits */}
            <div className="md:col-span-4 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center group">
              <Zap className="text-zinc-500 mb-4 group-hover:text-orange-400 transition-colors" size={32} />
              <h3 className="text-2xl font-bold uppercase tracking-tighter">Credit based audits</h3>
              <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest opacity-60 font-medium">Pay as you scale</p>
            </div>

            {/* Box 4: Connect to SellfScale */}
            <Link
              href="https://sellfscale.com"
              target="_blank"
              className="md:col-span-8 bg-zinc-100 text-black border border-white/20 rounded-[2.5rem] p-10 flex items-center justify-between group hover:bg-white transition-all duration-500"
            >
              <div className="max-w-md">
                <h3 className="text-3xl font-bold tracking-tighter mb-4 leading-none">Connect to SellfScale to Boost your growth!</h3>
                <p className="text-black/50 text-sm font-bold uppercase tracking-[0.2em]">Scalesuite Ecosystem</p>
              </div>
              <div className="relative">
                  <Globe size={80} strokeWidth={1} className="opacity-10 group-hover:opacity-30 group-hover:rotate-12 transition-all duration-700" />
                  <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500" size={32} />
              </div>
            </Link>

          </div>
        </section>

        {/* HOW IT WORKS — kısa, gerçekten sıralı olduğu için numaralandırma anlamlı */}
        <section className="relative py-24 px-6 max-w-6xl mx-auto border-t border-zinc-900/50">
          <div className="text-center mb-16">
            <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">The Process</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white">
              Link to Report, <span className="text-zinc-600">In Three Steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Search, step: '01', title: 'Paste a link or describe your product', desc: "A live marketplace URL, or a product idea in plain text — SellfCompete finds the right category either way." },
              { icon: ScanSearch, step: '02', title: 'We scrape live marketplace and web data', desc: 'Real listings, real prices, real reviews — cross-referenced with current web research, not cached data.' },
              { icon: FileOutput, step: '03', title: 'Get pricing gaps and strategy, instantly', desc: 'Top sellers, sentiment, market economics, and actionable strategic gaps — structured and ready to act on.' },
            ].map((s) => (
              <div key={s.step} className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-6">
                  <s.icon className="text-orange-500" size={28} />
                  <span className="text-4xl font-black italic text-zinc-800">{s.step}</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2 text-white">{s.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/how-it-works" className="text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors inline-flex items-center gap-1">
              See the full breakdown <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* THE OLD WAY VS SELLFCOMPETE — dürüst karşılaştırma, uydurma rakam yok */}
        <section className="relative py-24 px-6 max-w-5xl mx-auto border-t border-zinc-900/50">
          <div className="text-center mb-16">
            <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Why Not Just Do It Yourself</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white">
              Manual Research <span className="text-zinc-600">vs. SellfCompete</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[2.5rem] p-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Dozens of Browser Tabs</p>
              <ul className="space-y-4">
                {[
                  'Hours spent manually checking prices across marketplaces',
                  'Reviews read one by one, no structured sentiment',
                  'Data is stale the moment you close the tab',
                  'No systematic way to spot pricing or feature gaps',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-zinc-500">
                    <X size={16} className="text-zinc-700 shrink-0 mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/25 rounded-[2.5rem] p-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-6">SellfCompete</p>
              <ul className="space-y-4">
                {[
                  'One link or idea in, full report in under 60 seconds',
                  'Sentiment and feature requests extracted automatically',
                  'Live scrape on every run — never a cached snapshot',
                  'Strategic gaps surfaced directly, not left for you to find',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-zinc-200 font-medium">
                    <Check size={16} className="text-orange-500 shrink-0 mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ — SEO/GEO için gerçek soru-cevap içeriği */}
        <section className="relative py-24 px-6 max-w-4xl mx-auto border-t border-zinc-900/50">
          <div className="text-center mb-16">
            <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Questions</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white">
              Frequently <span className="text-zinc-600">Asked</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 md:p-8">
                <h3 className="text-base md:text-lg font-bold text-white mb-2 flex items-start gap-3">
                  <Sparkles size={16} className="text-orange-500 shrink-0 mt-1" /> {f.q}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed pl-7">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative py-24 px-6 max-w-4xl mx-auto text-center border-t border-zinc-900/50">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-6">
            Stop Guessing. <span className="text-orange-500">Start Auditing.</span>
          </h2>
          <p className="text-zinc-500 text-base max-w-xl mx-auto mb-10">
            3 free audits, 7 days, no credit card required.
          </p>
          <Link href="/trial-signup" className="inline-flex bg-orange-500 text-black px-10 py-5 rounded-full font-black uppercase italic tracking-tight hover:bg-orange-400 transition-all items-center gap-2 group shadow-xl shadow-orange-500/20">
            Start Free Trial <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>
      </main>

      {/* YENİ EKLENEN ŞIK FOOTER */}
      <footer className="relative z-10 border-t border-zinc-900 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Logo & Copyright */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="text-xl font-black tracking-tighter text-white uppercase italic">
                SELLF<span className="text-orange-500">COMPETE</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                © {new Date().getFullYear()} SellfCompete. All rights reserved.
              </p>
            </div>

            {/* Compliance Links (Paddle Requirement) */}
            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <Link href="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-orange-500 transition-colors">Terms & Conditions</Link>
              <Link href="/refund" className="hover:text-orange-500 transition-colors">Refund Policy</Link>
            </div>

            {/* Contact / Phone */}
            <a
              href="tel:+905303594034"
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800 transition-all text-zinc-300 hover:text-white group"
            >
              <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                <Phone size={12} className="text-orange-500 group-hover:text-black" />
              </div>
              <span className="text-xs font-bold tracking-wider">+90 530 359 40 34</span>
            </a>

          </div>
        </div>
      </footer>

    </div>
  );
}