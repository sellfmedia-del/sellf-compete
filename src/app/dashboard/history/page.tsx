'use client';

import React from 'react';
import Link from 'next/link';
import { History, Calendar, ExternalLink, Trash2, Tag, Search } from 'lucide-react';

export default function AuditHistoryPage() {
  // Mock Data: İleride Supabase 'audits' tablosundan çekilecek
  const pastAudits = [
    { id: 'SC-9921', title: 'Luxury Soy Candles', platform: 'Trendyol', date: 'Mar 18, 2026', score: '+85%' },
    { id: 'SC-8842', title: 'Ergonomic Desk Chair', platform: 'Amazon', date: 'Mar 12, 2026', score: '+72%' },
    { id: 'SC-7710', title: 'Wireless Earbuds X', platform: 'n11', date: 'Feb 28, 2026', score: '+91%' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER & SEARCH SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">
            Audit <span className="text-orange-500 text-glow">History</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Access your archived market intelligence</p>
        </div>

        {/* Search Bar Placeholder */}
        <div className="relative w-full md:w-64 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-orange-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search audits..." 
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-xs focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-700 font-medium"
          />
        </div>
      </div>

      {/* HISTORY LIST (Bento Cards) */}
      <div className="space-y-4">
        {pastAudits.length > 0 ? (
          pastAudits.map((audit) => (
            <Link 
              key={audit.id} 
              href={`/dashboard/audit/${audit.id}`} 
              className="group block bg-zinc-900/30 border border-zinc-800 hover:border-orange-500/30 hover:bg-zinc-900/60 rounded-[2rem] p-6 transition-all duration-500 relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                {/* Left: Info */}
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-orange-500/20 transition-all">
                    <History size={20} className="text-zinc-500 group-hover:text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white group-hover:text-orange-500 transition-colors">
                      {audit.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Tag size={10} /> {audit.platform}</span>
                      <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                      <span className="flex items-center gap-1"><Calendar size={10} /> {audit.date}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Meta & Actions */}
                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                   <div className="text-right">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 leading-none">Growth Score</p>
                      <span className="text-xl font-black italic text-zinc-400 group-hover:text-white transition-colors">{audit.score}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="p-3 text-zinc-700 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <div className="w-10 h-10 border border-zinc-800 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <ExternalLink size={16} />
                      </div>
                   </div>
                </div>
              </div>
              {/* Subtle background ID tag */}
              <span className="absolute -right-4 -bottom-4 text-7xl font-black text-white/[0.02] italic pointer-events-none group-hover:text-orange-500/[0.03] transition-all">
                {audit.id}
              </span>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[3rem]">
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs italic">No audit history found. Start your first analysis!</p>
          </div>
        )}
      </div>

      {/* FOOTER STATS (Optional) */}
      <div className="pt-12 flex justify-center">
         <div className="bg-zinc-900/40 border border-zinc-800 px-8 py-4 rounded-full flex gap-8">
            <div className="text-center border-r border-zinc-800 pr-8">
               <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Total Audits</p>
               <p className="text-sm font-black italic">03</p>
            </div>
            <div className="text-center">
               <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Credits Saved</p>
               <p className="text-sm font-black italic text-orange-500">$5.70</p>
            </div>
         </div>
      </div>

    </div>
  );
}