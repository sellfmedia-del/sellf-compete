// Dosya Yolu: src/app/(dashboard)/dashboard/audit/[id]/page.tsx
'use client';

// 'import React from "react";' satırını sildik (Modern Next.js'te gerek yok)
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, TrendingUp, Lightbulb, Target, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useSingleAudit } from '@/src/hooks/useSingleAudit';

export default function SingleAuditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { audit, parsedData, isLoading } = useSingleAudit(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Decrypting Classified Audit...</p>
      </div>
    );
  }

  if (!audit || !parsedData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <p className="text-xl font-black italic text-zinc-500 uppercase">Audit not found or corrupted.</p>
        <button onClick={() => router.push('/dashboard/history')} className="mt-6 text-orange-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
          Return to History
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => router.push('/dashboard/history')} 
          className="w-fit text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back to Archives
        </button>
        
        <div className="flex justify-between items-end border-b border-zinc-800/50 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                {audit.platform}
              </span>
              <span className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                {new Date(audit.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white leading-none">
              Intelligence <span className="text-orange-500 text-glow">Report</span>
            </h1>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mt-4">ID: {audit.id}</p>
          </div>
          
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Overall Score</p>
            <div className="text-4xl font-black italic text-white">
              {parsedData.deepSentiment?.overall_score || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* BENTO GRID: TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* rounded-[2rem] uyarılarını Tailwind'in tavsiyesi olan rounded-4xl ile değiştirdik */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-4xl p-8 hover:bg-zinc-900/60 transition-colors">
          <TrendingUp className="text-orange-500 mb-4" size={24} />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Market Volume</p>
          <h3 className="text-xl font-bold text-white">{parsedData.marketEconomics?.est_annual_volume || 'Unknown'}</h3>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-4xl p-8 hover:bg-zinc-900/60 transition-colors">
          <ShieldCheck className="text-blue-500 mb-4" size={24} />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Barrier to Entry</p>
          <h3 className="text-xl font-bold text-white">{parsedData.marketEconomics?.barrier_to_entry || 'Unknown'}</h3>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-4xl p-8 hover:bg-zinc-900/60 transition-colors">
          <Target className="text-green-500 mb-4" size={24} />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Category Trend</p>
          <h3 className="text-xl font-bold text-white">{parsedData.marketEconomics?.category_trend || 'Unknown'}</h3>
        </div>
      </div>

      {/* STRATEGIC GAPS & SENTIMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] -mr-20 -mt-20"></div>
          <Lightbulb className="text-orange-500 mb-6" size={28} />
          <h2 className="text-2xl font-black uppercase italic tracking-tight mb-8">Strategic <span className="text-zinc-500">Gaps</span></h2>
          
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-2">Pricing Opportunity</p>
              <p className="text-sm text-zinc-300 leading-relaxed font-medium">{parsedData.strategicGaps?.pricing_opportunity}</p>
            </div>
            <div className="w-full h-px bg-zinc-800/50"></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-2">Product Improvement</p>
              <p className="text-sm text-zinc-300 leading-relaxed font-medium">{parsedData.strategicGaps?.product_improvement}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10">
          <AlertTriangle className="text-zinc-400 mb-6" size={28} />
          <h2 className="text-2xl font-black uppercase italic tracking-tight mb-8">Customer <span className="text-zinc-500">Sentiment</span></h2>
          
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-3">Critical Pain Points</p>
              <ul className="space-y-2">
                {parsedData.deepSentiment?.critical_pain_points?.map((point: string, i: number) => (
                  <li key={i} className="text-sm text-zinc-400 font-medium flex gap-3">
                    <span className="text-red-500/50">-</span> {point}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400 mb-3">Top Praises</p>
              <ul className="space-y-2">
                {parsedData.deepSentiment?.top_praises?.map((point: string, i: number) => (
                  <li key={i} className="text-sm text-zinc-400 font-medium flex gap-3">
                    <span className="text-green-500/50">+</span> {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* TOP SELLERS TABLE */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10 overflow-hidden">
        <h2 className="text-2xl font-black uppercase italic tracking-tight mb-8">Competitor <span className="text-zinc-500">Matrix</span></h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="pb-4 pl-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Rank</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Brand & Product</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Price</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Key Advantage</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.topSellers?.map((seller: any, idx: number) => (
                <tr key={idx} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors group">
                  <td className="py-5 pl-4 text-sm font-bold text-zinc-400 group-hover:text-orange-500 transition-colors">#{seller.rank}</td>
                  <td className="py-5 text-sm font-bold text-white pr-4">{seller.brand_product}</td>
                  <td className="py-5 text-sm text-zinc-400 font-medium">{seller.price}</td>
                  <td className="py-5 text-xs text-zinc-500 font-medium max-w-xs">{seller.key_advantage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}