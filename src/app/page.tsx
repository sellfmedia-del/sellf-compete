// Dosya Yolu: src/app/page.tsx
import React from 'react';
import Link from 'next/link';
import Navbar from '@/src/components/Navbar'; 
import { ArrowRight, Shield, Zap, Globe, LayoutGrid, Phone } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative bg-[#0a0a0a] text-zinc-100 min-h-screen font-sans selection:bg-orange-500 selection:text-white overflow-hidden flex flex-col">
      
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
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              SELLF <br /> <span className="text-orange-500 uppercase">COMPETE</span>
            </h1>
            
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Eliminate guesswork. Audit your competitors with enterprise-grade data and AI-driven insights in seconds.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link href="/register" className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-zinc-200 transition-all flex items-center gap-2 group">
                Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="https://www.sellfmedia.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-transparent border border-zinc-800 px-8 py-4 rounded-full font-medium hover:bg-zinc-900 transition-all text-white"
              >
                Meet the Team
              </Link>
            </div>
          </div>
        </section>

        {/* BENTO GRID FEATURES */}
        <section className="relative py-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[300px]">
            
            {/* Box 1: Deep Market Analysis (Platform Integration) */}
            <div className="md:col-span-8 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden relative group">
              <div className="z-10">
                <div className="flex gap-4 mb-6">
                   {/* Platform Placeholders */}
                   <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold tracking-widest uppercase text-zinc-400">Trendyol</div>
                   <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold tracking-widest uppercase text-zinc-400">Amazon</div>
                   <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold tracking-widest uppercase text-zinc-400">Hepsiburada</div>
                   <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold tracking-widest uppercase text-zinc-400">Shopify</div>
                </div>
                <h3 className="text-3xl font-semibold mb-2 tracking-tight">Deep Market Analysis</h3>
                <p className="text-zinc-500 max-w-sm text-sm">Real-time data scraping from global marketplaces and your own ecosystem.</p>
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