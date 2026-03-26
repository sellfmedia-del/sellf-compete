// Dosya Yolu: src/app/(dashboard)/dashboard/my-products/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Link as LinkIcon, Building2, ShoppingCart, Target, ChevronRight, Activity } from 'lucide-react';

export default function MyProductsPage() {
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [productLink, setProductLink] = useState('');

  // Link yapıştırıldığında veya tıklandığında formu aşağı doğru açan fonksiyon
  const handleInputFocus = () => {
    setIsFormExpanded(true);
  };

  // İleride Supabase'den gelecek olan mock verilerimiz (Bento Grid için)
  const savedProducts = [
    { id: '1', name: 'Luxury Soy Candle', platform: 'Trendyol', category: 'Home Decor', lastUpdated: '2 hours ago', status: 'Tracking' },
    { id: '2', name: 'Ergonomic Desk Chair', platform: 'Amazon', category: 'Office', lastUpdated: '1 day ago', status: 'Tracking' },
    { id: '3', name: 'Wireless Earbuds X', platform: 'Website', category: 'Electronics', lastUpdated: '3 days ago', status: 'Paused' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* HEADER & MAGIC INPUT SECTION */}
      <div className="flex flex-col items-center justify-center pt-8 relative z-20">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-8 text-center">
          Intelligence <span className="text-orange-500 text-glow">Arena</span>
        </h1>

        {/* Genişleyen Arama/Ekleme Çubuğu */}
        <div className="w-full max-w-3xl relative">
          <div className={`relative flex items-center bg-zinc-900/80 backdrop-blur-md border ${isFormExpanded ? 'border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.15)]' : 'border-zinc-800 hover:border-zinc-700'} rounded-full transition-all duration-500 z-30`}>
            <div className="pl-6 pr-4">
              <LinkIcon size={20} className={isFormExpanded ? 'text-orange-500' : 'text-zinc-500'} />
            </div>
            <input 
              type="text" 
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="Paste product link to add new..." 
              className="w-full bg-transparent py-5 text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none"
            />
            <div className="pr-3">
              <button 
                className="w-12 h-12 bg-orange-500 hover:bg-orange-400 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>

          {/* Form Alanı (Aşağı Doğru Kayarak Açılır) */}
          <div className={`overflow-hidden transition-all duration-700 ease-in-out absolute top-full left-0 w-full z-20 ${isFormExpanded ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0 pointer-events-none'}`}>
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Sol Kolon: Hedefler */}
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                      <Target size={14} /> Target Platform
                    </label>
                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-orange-500/50">
                      <option value="trendyol">Trendyol</option>
                      <option value="amazon">Amazon</option>
                      <option value="website">Own Website (SEO/Traffic)</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                      <Activity size={14} /> Sector & Category
                    </label>
                    <input type="text" placeholder="e.g. Home Decor, Electronics..." className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/50" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                      <Building2 size={14} /> 5 Competitor Brands
                    </label>
                    <textarea placeholder="Enter brand names or store links, separated by commas..." rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/50 resize-none"></textarea>
                  </div>
                </div>

                {/* Sağ Kolon: Ürünler & Onay */}
                <div className="space-y-6 flex flex-col justify-between">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                      <ShoppingCart size={14} /> 5 Competitor Products
                    </label>
                    <textarea placeholder="Paste 5 competitor product links, separated by commas..." rows={5} className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/50 resize-none"></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-4 pt-4">
                    <button 
                      onClick={() => setIsFormExpanded(false)}
                      className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button className="px-8 py-3 bg-white text-black hover:bg-orange-500 hover:text-white rounded-full text-xs font-black uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                      Initialize Tracker
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRACKED PRODUCTS (BENTO GRID) */}
      <div className="pt-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
            Tracked <span className="text-zinc-500">Assets</span>
          </h2>
          <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-500">
            {savedProducts.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedProducts.map((product) => (
            <Link 
              key={product.id} 
              href={`/dashboard/my-products/${product.id}`}
              className="group bg-zinc-900/40 border border-zinc-800 hover:border-orange-500/30 rounded-[2rem] p-6 hover:bg-zinc-900/60 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[200px]"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-orange-500/20 transition-all">
                  <Target size={18} className="text-zinc-500 group-hover:text-orange-500 transition-colors" />
                </div>
                <span className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  {product.platform}
                </span>
              </div>
              
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{product.category}</p>
                <h3 className="text-xl font-black italic text-white group-hover:text-orange-500 transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </div>

              <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all">
                <ChevronRight size={14} className="text-zinc-500 group-hover:text-black" />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}