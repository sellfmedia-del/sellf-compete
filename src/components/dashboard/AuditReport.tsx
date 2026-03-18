import React from 'react';
import { 
  TrendingUp, 
  MessageSquare, 
  Target, 
  DollarSign, 
  BarChart3, 
  Zap, 
  FileDown, 
  Save,
  ThumbsUp,
  ThumbsDown,
  ArrowRight
} from 'lucide-react';

export default function AuditReport() {
  // Not: Bu veriler ileride motor takıldığında API'den gelecek.
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      
      {/* RAPOR HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-10">
        <div>
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Audit Analysis Complete</p>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic">Market <span className="text-white/20">Intelligence</span> Report</h2>
        </div>
        <div className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-600">
          ID: #SC-9921 / March 18, 2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* 1. KATEGORİ EN ÇOK SATANLAR (col-span-8) */}
        <div className="md:col-span-8 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 overflow-hidden relative group">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
              <TrendingUp size={20} className="text-orange-500" /> Category Top Sellers
            </h3>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-orange-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-orange-500 italic">#{i}</div>
                  <span className="text-sm font-bold uppercase text-zinc-300">Competitor Product {i}29X</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-500">Est. Sales</p>
                  <p className="text-sm font-black italic">1.2k+ / mo</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. ŞİKAYETLER VE BEĞENİLER (col-span-4) */}
        <div className="md:col-span-4 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col justify-between">
          <h3 className="text-lg font-black uppercase italic tracking-tight mb-6">Sentiment Analysis</h3>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase text-green-500 mb-2 flex items-center gap-1">
                <ThumbsUp size={12} /> Top Likes
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium italic">"Premium packaging feel and long-lasting scent performance."</p>
            </div>
            <div className="h-px bg-zinc-800 w-full" />
            <div>
              <p className="text-[10px] font-black uppercase text-red-500 mb-2 flex items-center gap-1">
                <ThumbsDown size={12} /> Top Complaints
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium italic">"Delivery delays and minor leaks in liquid versions."</p>
            </div>
          </div>
        </div>

        {/* 3. EN BÜYÜK VE YAKIN RAKİPLER (col-span-4) */}
        <div className="md:col-span-4 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8">
          <h3 className="text-lg font-black uppercase italic tracking-tight mb-6 flex items-center gap-2">
            <Target size={20} className="text-orange-500" /> Strategic Rivals
          </h3>
          <div className="space-y-4">
             <div className="p-4 bg-orange-500 text-black rounded-2xl">
                <p className="text-[9px] font-black uppercase opacity-60">Main Threat</p>
                <h4 className="font-black text-lg leading-tight italic uppercase">Market Titan Co.</h4>
             </div>
             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                <p className="text-[9px] font-black uppercase text-zinc-500">Closest Match</p>
                <h4 className="font-black text-lg leading-tight italic uppercase">Local Artisan X</h4>
             </div>
          </div>
        </div>

        {/* 4. FİYAT ANALİZİ VE POZİSYONLAMA (col-span-8) */}
        <div className="md:col-span-8 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group">
          <h3 className="text-lg font-black uppercase italic tracking-tight mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-orange-500" /> Price Positioning
          </h3>
          <div className="relative pt-12 pb-6">
            {/* Range Line */}
            <div className="h-1 bg-zinc-800 w-full rounded-full relative">
               <div className="absolute left-[20%] right-[30%] h-full bg-orange-500/50" /> {/* Optimal Range */}
               {/* Our Product Marker */}
               <div className="absolute left-[45%] -top-10 flex flex-col items-center">
                  <p className="text-[10px] font-black bg-white text-black px-2 py-1 rounded-md mb-2 tracking-tighter uppercase italic">Our Product</p>
                  <div className="w-4 h-4 bg-white rounded-full border-4 border-black ring-4 ring-orange-500/20" />
               </div>
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">
               <span>Min: $12.00</span>
               <span className="text-orange-500">Optimal: $18 - $24</span>
               <span>Max: $45.00</span>
            </div>
          </div>
        </div>

        {/* 5. PLATFORM BAZLI BİLGİLER (col-span-6) */}
        <div className="md:col-span-6 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
          <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2">
            <BarChart3 size={20} className="text-orange-500" /> Platform Dynamics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Commission Rate</p>
               <p className="text-2xl font-black italic">18.5%</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Supply/Demand</p>
               <p className="text-2xl font-black italic text-orange-500">High</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">Platform volume share: 24% of overall category traffic.</p>
        </div>

        {/* 6. BÜYÜME POTANSİYELİ & SWOT (col-span-6) */}
        <div className="md:col-span-6 bg-zinc-100 text-black rounded-[2.5rem] p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
               <h3 className="text-lg font-black uppercase italic tracking-tight">Growth Potential</h3>
               <div className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black italic">+85% Score</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div>
                  <h4 className="text-[10px] font-black uppercase mb-2 underline decoration-orange-500 decoration-2">Opportunity</h4>
                  <p className="text-[11px] font-bold leading-snug">Low competition in premium variant niche.</p>
               </div>
               <div>
                  <h4 className="text-[10px] font-black uppercase mb-2 underline decoration-orange-500 decoration-2">Threat</h4>
                  <p className="text-[11px] font-bold leading-snug">Upcoming brand launch from global tier.</p>
               </div>
            </div>
          </div>
          <div className="pt-6 border-t border-black/10 flex items-center justify-between">
             <span className="text-xs font-black uppercase italic opacity-60 tracking-tighter">Est. Annual Revenue Forecast</span>
             <span className="text-3xl font-black italic tracking-tighter">$125K - $210K</span>
          </div>
        </div>

      </div>

      {/* AKSİYON BUTONLARI */}
      <div className="flex flex-col md:flex-row gap-4 pt-12 pb-20">
         <button className="flex-1 bg-white text-black py-6 rounded-full font-black uppercase italic tracking-tight hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5">
            <FileDown size={20} /> Download PDF Audit
         </button>
         <button className="flex-1 bg-zinc-900 border border-zinc-800 text-white py-6 rounded-full font-black uppercase italic tracking-tight hover:bg-zinc-800 transition-all flex items-center justify-center gap-3">
            <Save size={20} className="text-orange-500" /> Save to History
         </button>
      </div>

    </div>
  );
}