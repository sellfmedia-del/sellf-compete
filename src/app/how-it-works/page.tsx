import React from 'react';
import Navbar from '@/src/components/Navbar';
import { 
  Link as LinkIcon, 
  MessageSquare, 
  ShieldCheck, 
  BarChart4, 
  TrendingUp, 
  FileDown, 
  Zap,
  Target
} from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="relative bg-[#0a0a0a] text-zinc-100 min-h-screen font-sans selection:bg-orange-500 selection:text-white overflow-hidden">
      
      {/* Background Mesh Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[30%] bg-zinc-500/5 rounded-full blur-[100px]"></div>
      </div>

      <Navbar />

      <section className="relative pt-48 pb-32 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 uppercase italic">
            THE <span className="text-orange-500">BLUEPRINT</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            From your first input to a 360-degree market audit. Here is the clinical breakdown of the SellfCompete engine.
          </p>
        </div>

        {/* 1. INPUT PHASE: Link or Description */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          <div className="md:col-span-7 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-[2.5rem] p-10 flex flex-col justify-between">
            <div>
              <div className="bg-orange-500/10 text-orange-500 w-fit px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-orange-500/20">Step 01</div>
              <h2 className="text-3xl font-bold mb-4 tracking-tight uppercase">Define Your Target</h2>
              <p className="text-zinc-500 max-w-md">Whether you have a live product link or just a vision in your head, the process is seamless.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 group hover:border-orange-500/30 transition-all">
                <LinkIcon className="text-orange-500 mb-3" />
                <h4 className="font-bold text-sm mb-1 uppercase">Paste Link</h4>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Amazon, Trendyol, n11 or Website</p>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 group hover:border-orange-500/30 transition-all">
                <MessageSquare className="text-orange-500 mb-3" />
                <h4 className="font-bold text-sm mb-1 uppercase">Describe Idea</h4>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">AI-Assisted Prompt Engineering</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center">
             <ShieldCheck size={60} className="text-zinc-700 mb-6" />
             <h3 className="text-xl font-bold uppercase mb-4 italic">Platform Intelligence</h3>
             <p className="text-zinc-500 text-sm">Our scrapers verify data across every touchpoint: Physical Stores, Marketplaces, and D2C Channels.</p>
          </div>
        </div>

        {/* 2. THE AUDIT ENGINE: What's inside the report? */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-12 bg-zinc-100 text-black rounded-[2.5rem] p-12 overflow-hidden relative">
            <div className="relative z-10">
              <div className="bg-black/5 text-black w-fit px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-black/10">Step 02: Analysis Output</div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter uppercase italic">Comprehensive Reporting</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div className="group">
                    <h4 className="font-black text-sm uppercase flex items-center gap-2 underline decoration-orange-500 decoration-2 underline-offset-4 mb-2">
                      <Target size={16}/> Market Benchmarks
                    </h4>
                    <p className="text-black/60 text-xs font-bold uppercase tracking-tight">Best sellers in category & direct competitor sentiment analysis.</p>
                  </div>
                  <div className="group">
                    <h4 className="font-black text-sm uppercase flex items-center gap-2 underline decoration-orange-500 decoration-2 underline-offset-4 mb-2">
                      <Zap size={16}/> Pricing Intelligence
                    </h4>
                    <p className="text-black/60 text-xs font-bold uppercase tracking-tight">Average price ranges and your product's strategic positioning.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="group">
                    <h4 className="font-black text-sm uppercase flex items-center gap-2 underline decoration-orange-500 decoration-2 underline-offset-4 mb-2">
                      <BarChart4 size={16}/> Platform Dynamics
                    </h4>
                    <p className="text-black/60 text-xs font-bold uppercase tracking-tight">Commission rates, volume percentages, and supply/demand gaps.</p>
                  </div>
                  <div className="group">
                    <h4 className="font-black text-sm uppercase flex items-center gap-2 underline decoration-orange-500 decoration-2 underline-offset-4 mb-2">
                      <TrendingUp size={16}/> Growth Potential
                    </h4>
                    <p className="text-black/60 text-xs font-bold uppercase tracking-tight">Opportunity/Threat matrix with forecasted annual revenue potential.</p>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                    <div className="bg-black text-white p-6 rounded-3xl">
                        <FileDown className="mb-4 text-orange-500" />
                        <h4 className="font-bold uppercase text-sm italic">Final Output</h4>
                        <p className="text-[10px] opacity-60 uppercase font-black tracking-widest mt-2">Certified PDF Audit or Cloud Save</p>
                    </div>
                </div>
              </div>
            </div>
            {/* Artistic Grid Background for this section */}
            <div className="absolute right-[-10%] bottom-[-20%] opacity-5 rotate-12">
                <BarChart4 size={400} />
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}