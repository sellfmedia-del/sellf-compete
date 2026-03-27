// Dosya Yolu: src/app/(dashboard)/dashboard/my-products/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Link as LinkIcon, Building2, ShoppingCart, Target, ChevronRight, Activity, Loader2 } from 'lucide-react';
import { useMyProducts } from '@/src/hooks/useMyProducts';

export default function MyProductsPage() {
  const router = useRouter();
  const { products, isLoading, refreshProducts } = useMyProducts();

  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const [productLink, setProductLink] = useState('');
  const [platform, setPlatform] = useState('trendyol');
  const [category, setCategory] = useState('');
  const [competitorBrands, setCompetitorBrands] = useState('');
  const [competitorProducts, setCompetitorProducts] = useState('');

  const handleInputFocus = () => {
    setIsFormExpanded(true);
  };

  const handleInitializeTracker = async () => {
    if (!productLink || !category) {
      alert("Please provide at least your product link and category.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/arena/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productLink,
          platform,
          category,
          competitorBrands: competitorBrands.split(',').map(b => b.trim()).filter(Boolean),
          competitorProducts: competitorProducts.split(',').map(p => p.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize tracker.");
      }

      const { data } = await response.json();
      
      setIsFormExpanded(false);
      setProductLink('');
      setCategory('');
      setCompetitorBrands('');
      setCompetitorProducts('');

      await refreshProducts();
      
      if (data && data.id) {
         router.push(`/dashboard/my-products/${data.id}`);
      }

    } catch (error) {
      console.error("Initialization Error:", error);
      alert("Something went wrong while initializing the tracker.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* HEADER & MAGIC INPUT SECTION */}
      <div className="flex flex-col items-center justify-center pt-8 relative z-20">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-8 text-center">
          Intelligence <span className="text-orange-500 text-glow">Arena</span>
        </h1>

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
              disabled={isSubmitting}
            />
            <div className="pr-3">
              <button 
                className="w-12 h-12 bg-orange-500 hover:bg-orange-400 rounded-full flex items-center justify-center text-white transition-colors shadow-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
              </button>
            </div>
          </div>

          <div className={`overflow-hidden transition-all duration-700 ease-in-out absolute top-full left-0 w-full z-20 ${isFormExpanded ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0 pointer-events-none'}`}>
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sol Kolon */}
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3"><Target size={14} /> Target Platform</label>
                    <select 
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-orange-500/50 disabled:opacity-50"
                    >
                      <option value="trendyol">Trendyol</option>
                      <option value="amazon">Amazon</option>
                      <option value="website">Own Website</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3"><Activity size={14} /> Sector & Category</label>
                    <input 
                      type="text" 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="e.g. Home Decor..." 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/50 disabled:opacity-50" 
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3"><Building2 size={14} /> 5 Competitor Brands</label>
                    <textarea 
                      value={competitorBrands}
                      onChange={(e) => setCompetitorBrands(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Brand names or links (separated by commas)..." 
                      rows={3} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/50 resize-none disabled:opacity-50"
                    ></textarea>
                  </div>
                </div>
                {/* Sağ Kolon */}
                <div className="space-y-6 flex flex-col justify-between">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3"><ShoppingCart size={14} /> 5 Competitor Products</label>
                    <textarea 
                      value={competitorProducts}
                      onChange={(e) => setCompetitorProducts(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Product links (separated by commas)..." 
                      rows={5} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/50 resize-none disabled:opacity-50"
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-4 pt-4">
                    <button 
                      onClick={() => setIsFormExpanded(false)} 
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleInitializeTracker}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-white text-black hover:bg-orange-500 hover:text-white rounded-full text-xs font-black uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:hover:bg-white flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Gathering Intel...
                        </>
                      ) : (
                        "Initialize Tracker"
                      )}
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
            {products.length} Active
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
             <Loader2 className="animate-spin text-orange-500 mb-4" size={32} />
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading Arsenal...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Link 
                key={product.id} 
                href={`/dashboard/my-products/${product.id}`}
                className="group bg-zinc-900/40 border border-zinc-800 hover:border-orange-500/30 rounded-[2rem] p-6 hover:bg-zinc-900/60 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[200px]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-orange-500/20 transition-all">
                    <Target size={18} className="text-zinc-500 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {/* Platform Etiketi Zaten Buradaydı, Rengini Biraz Daha Belirginleştirdik */}
                    <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-300 group-hover:border-orange-500/50 group-hover:text-white transition-colors">
                      {product.platform}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                      {formatTimeAgo(product.updated_at)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{product.category}</p>
                  {/* Marka ve Ürün Adı JSON'dan çekilip basılıyor */}
                  <h3 className="text-xl font-black italic text-white group-hover:text-orange-500 transition-colors line-clamp-2">
                    {product.latest_data?.my_product?.name || "Analyzing Asset..."}
                  </h3>
                  {/* YENİ: Rakip Markaların Kartta Görünmesi */}
                  {product.competitor_brands && product.competitor_brands.length > 0 && (
                     <p className="text-[10px] text-zinc-500 font-medium mt-3 line-clamp-1 border-t border-zinc-800/50 pt-2">
                       vs. {product.competitor_brands.join(', ')}
                     </p>
                  )}
                </div>

                <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 transition-all">
                  <ChevronRight size={14} className="text-zinc-500 group-hover:text-white" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[3rem]">
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs italic">No assets tracked yet. Paste a link above to initialize your first tracker.</p>
          </div>
        )}
      </div>

    </div>
  );
}