import React from 'react';
import { ArrowRight, BarChart3, Shield, Zap, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-[#0a0a0a] text-zinc-100 min-h-screen font-sans selection:bg-white selection:text-black">
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 border-b border-zinc-900">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            SELLF <br /> COMPETE
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Eliminate guesswork. Audit your competitors with enterprise-grade data and AI-driven insights in seconds.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-zinc-200 transition-all flex items-center gap-2 group">
              Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-transparent border border-zinc-800 px-8 py-4 rounded-full font-medium hover:bg-zinc-900 transition-all">
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[300px]">
          {/* Ana Kart */}
          <div className="md:col-span-8 bg-[#111] border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden relative group">
            <div className="z-10">
              <BarChart3 className="text-zinc-500 mb-4" size={32} />
              <h3 className="text-2xl font-semibold mb-2">Deep Market Analysis</h3>
              <p className="text-zinc-500 max-w-xs text-sm">Real-time data scraping from Amazon, Trendyol, and more.</p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all"></div>
          </div>

          {/* Küçük Kart 1 */}
          <div className="md:col-span-4 bg-[#111] border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center">
            <Shield className="text-zinc-500 mb-4" size={32} />
            <h3 className="text-xl font-semibold">Reliable Audits</h3>
            <p className="text-zinc-500 text-sm mt-2">Certified PDF reports for your business growth.</p>
          </div>

          {/* Küçük Kart 2 */}
          <div className="md:col-span-4 bg-[#111] border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center">
            <Zap className="text-zinc-500 mb-4" size={32} />
            <h3 className="text-xl font-semibold">$1.90 Credits</h3>
            <p className="text-zinc-500 text-sm mt-2">Pay as you go for additional deep audits.</p>
          </div>

          {/* Orta Kart */}
          <div className="md:col-span-8 bg-zinc-100 text-black border border-zinc-800 rounded-[2.5rem] p-10 flex items-center justify-between">
            <div className="max-w-md">
              <h3 className="text-3xl font-bold tracking-tight mb-4">Ready to outsmart the competition?</h3>
              <p className="opacity-70 text-sm mb-6 font-medium uppercase tracking-widest">Scalesuite Ecosystem</p>
            </div>
            <Globe size={80} strokeWidth={1} className="opacity-20 hidden md:block" />
          </div>
        </div>
      </section>

    </div>
  );
}