// Dosya Yolu: src/app/(dashboard)/dashboard/my-products/[id]/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Loader2, Package, ShoppingCart, Store, LineChart, AlertCircle, TrendingUp, TrendingDown, MessageSquare, Tag, Award, Users, Search } from 'lucide-react';
import { useMyProductDetail } from '@/src/hooks/useMyProductDetail';

export default function ProductDetailArenaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { product, isLoading } = useMyProductDetail(id);
  const [activeTab, setActiveTab] = useState<'my_product' | 'competitors' | 'brands' | 'market'>('my_product');
  const [isUpdating, setIsUpdating] = useState(false);

  // Bu fonksiyonu bir sonraki adımda API'ye bağlayacağız
  const handleUpdateData = async () => {
    setIsUpdating(true);
    // API isteği buraya gelecek...
    setTimeout(() => setIsUpdating(false), 2000); 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Decrypting Arena Data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <p className="text-xl font-black italic text-zinc-500 uppercase">Asset not found.</p>
        <button onClick={() => router.push('/dashboard/my-products')} className="mt-6 text-orange-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
          Return to Hub
        </button>
      </div>
    );
  }

  const { latest_data, historical_data } = product;
  const isDayZero = historical_data.length === 0;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => router.push('/dashboard/my-products')} 
          className="w-fit text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back to Hub
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-800/50 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                {product.platform}
              </span>
              <span className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                {product.category}
              </span>
              {isDayZero && (
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                  <AlertCircle size={10} /> Baseline Established
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white leading-none line-clamp-2">
              {latest_data?.my_product?.name || "Target Acquired"}
            </h1>
          </div>
          
          <button 
            onClick={handleUpdateData}
            disabled={isUpdating}
            className="flex items-center gap-3 px-6 py-3 bg-white text-black hover:bg-orange-500 hover:text-white rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black whitespace-nowrap"
          >
            <RefreshCw size={16} className={isUpdating ? "animate-spin" : ""} />
            {isUpdating ? "Scanning..." : "Update Data (1 Credit)"}
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 bg-zinc-900/40 p-2 rounded-full border border-zinc-800/50">
        {[
          { id: 'my_product', label: 'My Asset', icon: Package },
          { id: 'competitors', label: 'Rival Products', icon: ShoppingCart },
          { id: 'brands', label: 'Rival Brands', icon: Store },
          { id: 'market', label: 'Market Intel', icon: LineChart }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-orange-500' : ''} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* DYNAMIC TAB CONTENT AREA */}
      <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* TAB 1: MY PRODUCT */}
        {activeTab === 'my_product' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Current Price</p>
                 <h3 className="text-3xl font-black italic text-white">{latest_data?.my_product?.current_price || "N/A"}</h3>
                 <p className="text-xs text-zinc-600 mt-2 line-through">{latest_data?.my_product?.original_price}</p>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Sales Growth Est.</p>
                 <h3 className="text-xl font-bold text-white mt-2">{latest_data?.my_product?.sales_growth_estimate || "Calculating..."}</h3>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">New Reviews</p>
                 <h3 className="text-3xl font-black italic text-white">+{latest_data?.my_product?.new_reviews_count || 0}</h3>
                 <p className="text-[10px] font-bold text-zinc-500 mt-2 uppercase">{latest_data?.my_product?.sentiment_ratio}</p>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
                 {isDayZero ? (
                   <>
                     <AlertCircle size={24} className="text-zinc-600 mb-2" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Delta Locked</p>
                     <p className="text-[9px] text-zinc-600 mt-1">Awaiting next update</p>
                   </>
                 ) : (
                   <p className="text-xs text-zinc-500">Delta metrics will appear here.</p>
                 )}
              </div>
            </div>

            {/* Recent Reviews Section */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2"><MessageSquare size={16}/> Recent Feedback</h4>
              <ul className="space-y-3">
                {latest_data?.my_product?.recent_10_reviews?.map((review: string, i: number) => (
                  <li key={i} className="text-sm text-zinc-300 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">"{review}"</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: COMPETITOR PRODUCTS */}
        {activeTab === 'competitors' && (
          <div className="grid grid-cols-1 gap-4">
            {latest_data?.competitor_products?.map((comp: any, i: number) => (
               <div key={i} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 hover:border-orange-500/30 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-zinc-800/50">
                    <div>
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">Rival Asset {i + 1}</span>
                      <h3 className="text-lg font-bold text-white leading-tight">{comp.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black italic text-white">{comp.current_price}</p>
                      <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">{comp.price_vs_category_avg}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-1"><Award size={12}/> Badges & Campaigns</p>
                      <div className="flex flex-wrap gap-2">
                        {comp.badges_and_campaigns?.length > 0 ? comp.badges_and_campaigns.map((badge: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-zinc-800 rounded-md text-[10px] font-bold text-zinc-300">{badge}</span>
                        )) : <span className="text-xs text-zinc-600">No active campaigns</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Sentiment Shift</p>
                      <p className="text-sm text-zinc-300">{comp.sentiment_shift}</p>
                      <p className="text-xs text-zinc-500 mt-1">Rating: {comp.average_rating}</p>
                    </div>
                  </div>
               </div>
            ))}
          </div>
        )}

        {/* TAB 3: COMPETITOR BRANDS */}
        {activeTab === 'brands' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latest_data?.competitor_brands?.map((brand: any, i: number) => (
              <div key={i} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-black italic text-white flex items-center gap-2"><Store size={18} className="text-orange-500"/> {brand.name}</h3>
                  <span className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-black uppercase text-zinc-300">Rating: {brand.store_rating}</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1"><Users size={12}/> Traffic / Followers</p>
                    <p className="text-sm font-bold text-white">{brand.estimated_traffic_or_followers}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1"><Tag size={12}/> Active Campaigns</p>
                    <ul className="list-disc list-inside text-xs text-zinc-400">
                      {brand.general_campaigns?.map((camp: string, idx: number) => <li key={idx}>{camp}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">New Product Variations</p>
                    <ul className="list-disc list-inside text-xs text-zinc-400">
                      {brand.new_product_variations?.map((varItem: string, idx: number) => <li key={idx}>{varItem}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: MARKET INTELLIGENCE */}
        {activeTab === 'market' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-1"><TrendingUp size={14}/> Market Momentum</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{latest_data?.market_intelligence?.market_momentum}</p>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-1"><Search size={14}/> Top Searched Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {latest_data?.market_intelligence?.top_3_keywords?.map((kw: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-bold text-white">{kw}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Top Customer Complaints & Insights</p>
                <ul className="space-y-3">
                  {latest_data?.market_intelligence?.top_5_complaints_and_insights?.map((insight: string, idx: number) => (
                    <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span> {insight}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Market Leaders</p>
                <div className="space-y-3">
                  {latest_data?.market_intelligence?.top_3_market_leaders?.map((leader: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-orange-500 border border-zinc-700">#{idx + 1}</div>
                      <span className="text-sm font-bold text-white">{leader}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}