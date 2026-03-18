import React from 'react';
import Navbar from '@/src/components/Navbar';
import { Check, Zap, ArrowRight, BarChart3, ShieldCheck, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="relative bg-[#0a0a0a] text-zinc-100 min-h-screen font-sans selection:bg-orange-500 selection:text-white overflow-hidden">
      
      {/* Background Mesh Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-zinc-500/5 rounded-full blur-[100px]"></div>
      </div>

      <Navbar />

      <section className="relative pt-48 pb-32 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 uppercase italic">
            ONE PRICE. <span className="text-orange-500 text-glow">UNLIMITED GROWTH.</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Five deep audits included. Scale your business with enterprise-grade intelligence for the price of a dinner.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Subscription Card - 7 Columns */}
          <div className="md:col-span-7 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-12 relative overflow-hidden group hover:border-orange-500/20 transition-all duration-500">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-orange-500 font-black uppercase tracking-[0.2em] text-xs mb-2 italic">Pro Access Plan</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-7xl font-black tracking-tighter text-white">$22</span>
                      <span className="text-zinc-500 text-xl font-bold italic">/mo</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    5 Audits Included
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-y-4 mb-12">
                  {[
                    'Full Dashboard Access',
                    '5 Deep Market Audits / Month',
                    'Best Sellers & Competitor Sentiment',
                    'Pricing Gap & Positioning Analysis',
                    'Platform Specific Dynamics (Comm. / Vol.)',
                    'SWOT & Revenue Growth Forecasts',
                    'Cloud Save & Certified PDF Exports'
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-zinc-300 text-sm font-medium list-none">
                      <div className="w-5 h-5 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
                        <Check size={12} className="text-orange-500" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </div>
              </div>

              <Link href="/register" className="w-full bg-white text-black py-5 rounded-full font-black hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group/btn text-lg uppercase italic tracking-tight shadow-xl shadow-white/5">
                Secure Your Access <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
            {/* Subtle light effect on hover */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all duration-700"></div>
          </div>

          {/* Pay As You Scale - 5 Columns */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="bg-orange-500 text-black rounded-[2.5rem] p-10 flex flex-col justify-between h-full group hover:scale-[1.02] transition-transform duration-500 shadow-2xl shadow-orange-500/10">
              <div>
                <div className="w-16 h-16 bg-black/10 rounded-3xl flex items-center justify-center mb-8 border border-black/5 backdrop-blur-sm">
                   <Zap size={32} strokeWidth={3} className="text-black" />
                </div>
                <h3 className="text-4xl font-black tracking-tighter leading-none mb-4 uppercase italic">Credit Based <br /> Audits</h3>
                <p className="text-black/70 text-sm font-bold uppercase tracking-tight max-w-[200px]">
                  Need more deep dives? Buy additional credits on the fly.
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1 leading-none">Standard Rate</p>
                <span className="text-6xl font-black italic tracking-tighter">$1.90</span>
                <p className="text-[12px] font-black uppercase tracking-widest mt-1">Per Report</p>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10 flex items-center justify-between backdrop-blur-sm group hover:border-zinc-700 transition-all">
               <div className="flex items-center gap-4">
                  <ShieldCheck className="text-zinc-600 group-hover:text-orange-500 transition-colors" size={32} />
                  <div>
                    <h4 className="font-bold uppercase text-xs tracking-widest text-zinc-400">Secure Billing</h4>
                    <p className="text-[10px] text-zinc-600 font-black uppercase">Powered by ScaleSuite</p>
                  </div>
               </div>
               <Link href="/faq" className="w-10 h-10 border border-zinc-800 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
                  <ArrowRight size={16} />
               </Link>
            </div>
          </div>

        </div>

        {/* Scalesuite Footer Note */}
        <div className="mt-12 text-center">
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">
              ScaleSuite Ecosystem Partner
            </p>
        </div>

      </section>
    </div>
  );
}