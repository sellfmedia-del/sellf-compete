'use client';
import { useState } from 'react';
import { TrendingUp, Target, DollarSign, BarChart3, FileDown, Save, ThumbsUp, ThumbsDown, Loader2, CheckCircle2 } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface Props {
  data: any; // Gelen veriyi kabul ediyoruz
}

export default function AuditReport({ data }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // YENİ STATES: Supabase kaydetme durumları
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleDownloadWord = async () => {
    if (!data) return;
    setIsDownloading(true);

    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "SellfCompete - Market Intelligence Report",
              heading: HeadingLevel.TITLE,
              spacing: { after: 400 },
            }),

            new Paragraph({ text: "1. Category Top Sellers", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 } }),
            ...(data.topSellers || []).map((seller: any, i: number) => new Paragraph({
              children: [
                new TextRun({ text: `#${seller.rank || i + 1} ${seller.brand_product}`, bold: true }),
                new TextRun({ text: `\nShare: ${seller.est_market_share} | Price: ${seller.price}` }),
                new TextRun({ text: `\nAdvantage: ${seller.key_advantage}` }),
              ],
              spacing: { after: 200 }
            })),

            new Paragraph({ text: "2. Deep Sentiment & Feature Requests", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 } }),
            new Paragraph({ 
              children: [new TextRun({ text: `Overall Score: ${data.deepSentiment?.overall_score}`, bold: true })], 
              spacing: { after: 100 } 
            }),
            new Paragraph({ 
              children: [new TextRun({ text: "Feature Requests (Goldmine):", bold: true })] 
            }),
            ...(data.deepSentiment?.feature_requests || []).map((req: string) => new Paragraph({ text: `• ${req}`, spacing: { after: 50 } })),
            
            new Paragraph({ text: "3. Market Economics", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 100 } }),
            new Paragraph({ text: `Annual Volume: ${data.marketEconomics?.est_annual_volume}` }),
            new Paragraph({ text: `Average Commission: ${data.marketEconomics?.average_commission}` }),
            new Paragraph({ text: `Category Trend: ${data.marketEconomics?.category_trend}` }),
            new Paragraph({ text: `Barrier to Entry: ${data.marketEconomics?.barrier_to_entry}` }),

            new Paragraph({ text: "4. Strategic Gaps (Actionable Intelligence)", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: "Pricing Opportunity: ", bold: true }), new TextRun({ text: data.strategicGaps?.pricing_opportunity })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: "Product Improvement: ", bold: true }), new TextRun({ text: data.strategicGaps?.product_improvement })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: "Marketing Angle: ", bold: true }), new TextRun({ text: data.strategicGaps?.marketing_angle })], spacing: { after: 100 } }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `SellfCompete_Audit_${Math.floor(Math.random() * 9000) + 1000}.docx`);
    } catch (error) {
      console.error("Word Document Generation Error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // YENİ FONKSİYON: Supabase API'sine veriyi gönderen fonksiyon
  const handleSaveToHistory = async () => {
    if (!data || isSaved) return;
    setIsSaving(true);
    
    try {
      // Şablona uygun veriyi hazırlıyoruz (user_id şimdilik yok, anonim kayıt)
      const payload = {
        raw_data: data,
        status: "completed",
        input_type: "unknown", // Bu bilgileri Dashboard'dan almadığımız için şimdilik placeholder atıyoruz
        platform: "unknown"
      };

      const response = await fetch('/api/save-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setIsSaved(true);
      } else {
        console.error("Failed to save audit to database");
      }
    } catch (error) {
      console.error("Save to History Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-10">
        <div>
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Audit Analysis Complete</p>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic">Market <span className="text-white/20">Intelligence</span> Report</h2>
        </div>
        <div className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-600">
          ID: #SC-{Math.floor(Math.random() * 9000) + 1000} / March 19, 2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* 1. KATEGORİ EN ÇOK SATANLAR (10'LU LİSTE - KAYDIRILABİLİR) */}
        <div className="md:col-span-7 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 relative group flex flex-col h-[500px]">
          <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2 mb-6 shrink-0">
            <TrendingUp size={20} className="text-orange-500" /> Category Top Sellers
          </h3>
          <div className="space-y-4 overflow-y-auto pr-2 flex-1">
            {data.topSellers?.map((seller: any, i: number) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-orange-500/20 transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 shrink-0 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-orange-500 italic">#{seller.rank || i + 1}</div>
                  <div>
                    <span className="text-sm font-bold uppercase text-zinc-300 block">{seller.brand_product}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">{seller.key_advantage}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Share / Price</p>
                  <p className="text-sm font-black italic">{seller.est_market_share} <span className="text-orange-500 mx-1">|</span> {seller.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. DERİNLEMESİNE DUYGU VE TALEP ANALİZİ (KAYDIRILABİLİR) */}
        <div className="md:col-span-5 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col h-[500px]">
          <div className="flex justify-between items-start mb-6 shrink-0">
             <h3 className="text-lg font-black uppercase italic tracking-tight">Deep Sentiment</h3>
             <div className="bg-orange-500 text-black px-3 py-1 rounded-full text-[10px] font-black italic">{data.deepSentiment?.overall_score} Score</div>
          </div>
          
          <div className="space-y-6 overflow-y-auto pr-2 flex-1">
            {/* Altın Madeni: Müşteri Talepleri */}
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
              <p className="text-[10px] font-black uppercase text-orange-500 mb-2 flex items-center gap-1"><Target size={12} /> Feature Requests (Goldmine)</p>
              <ul className="list-disc list-inside text-xs text-zinc-300 font-medium italic space-y-2">
                {data.deepSentiment?.feature_requests?.map((req: string, i: number) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase text-green-500 mb-2 flex items-center gap-1"><ThumbsUp size={12} /> Top Praises</p>
              <ul className="list-disc list-inside text-xs text-zinc-400 font-medium italic space-y-1">
                {data.deepSentiment?.top_praises?.map((praise: string, i: number) => (
                  <li key={i}>{praise}</li>
                ))}
              </ul>
            </div>
            
            <div className="h-px bg-zinc-800 w-full" />
            
            <div>
              <p className="text-[10px] font-black uppercase text-red-500 mb-2 flex items-center gap-1"><ThumbsDown size={12} /> Critical Pain Points</p>
              <ul className="list-disc list-inside text-xs text-zinc-400 font-medium italic space-y-1">
                {data.deepSentiment?.critical_pain_points?.map((pain: string, i: number) => (
                  <li key={i}>{pain}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 3. PİYASA EKONOMİSİ VE HACİM */}
        <div className="md:col-span-6 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col justify-between">
          <h3 className="text-lg font-black uppercase italic tracking-tight mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-orange-500" /> Market Economics
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Annual Volume</p>
               <p className="text-xl font-black italic">{data.marketEconomics?.est_annual_volume}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Avg Commission</p>
               <p className="text-xl font-black italic text-orange-500">{data.marketEconomics?.average_commission}</p>
            </div>
          </div>
          <div className="space-y-4">
             <div className="p-4 bg-zinc-950 rounded-2xl">
                <p className="text-[9px] font-black uppercase opacity-60 text-zinc-500">Category Trend</p>
                <h4 className="font-black text-sm leading-tight italic uppercase text-zinc-300 mt-1">{data.marketEconomics?.category_trend}</h4>
             </div>
             <div className="p-4 bg-zinc-950 rounded-2xl">
                <p className="text-[9px] font-black uppercase opacity-60 text-zinc-500">Barrier to Entry</p>
                <h4 className="font-black text-sm leading-tight italic uppercase text-zinc-300 mt-1">{data.marketEconomics?.barrier_to_entry}</h4>
             </div>
          </div>
        </div>

        {/* 4. STRATEJİK BOŞLUKLAR (BEYAZ KUTU İÇİNDE EYLEME GEÇİRİLEBİLİR İSTİHBARAT) */}
        <div className="md:col-span-6 bg-zinc-100 text-black rounded-[2.5rem] p-8 flex flex-col justify-between">
          <div className="flex items-start mb-6 gap-3">
             <div className="bg-orange-500 p-2 rounded-xl text-black">
               <DollarSign size={24} />
             </div>
             <div>
               <h3 className="text-lg font-black uppercase italic tracking-tight">Strategic Gaps</h3>
               <span className="block text-[10px] text-zinc-500 tracking-widest uppercase font-bold mt-1">Actionable Intelligence</span>
             </div>
          </div>
          
          <div className="space-y-6">
             <div>
                <h4 className="text-[11px] font-black uppercase mb-2 underline decoration-orange-500 decoration-2">Pricing Opportunity</h4>
                <p className="text-sm font-bold leading-snug">{data.strategicGaps?.pricing_opportunity}</p>
             </div>
             <div className="h-px bg-black/10 w-full" />
             <div>
                <h4 className="text-[11px] font-black uppercase mb-2 underline decoration-orange-500 decoration-2">Product Improvement</h4>
                <p className="text-sm font-bold leading-snug">{data.strategicGaps?.product_improvement}</p>
             </div>
             <div className="h-px bg-black/10 w-full" />
             <div>
                <h4 className="text-[11px] font-black uppercase mb-2 underline decoration-orange-500 decoration-2">Marketing Angle</h4>
                <p className="text-sm font-bold leading-snug">{data.strategicGaps?.marketing_angle}</p>
             </div>
          </div>
        </div>
      </div>

      {/* AKSİYON BUTONLARI */}
      <div className="flex flex-col md:flex-row gap-4 pt-12 pb-20">
         <button 
            onClick={handleDownloadWord}
            disabled={isDownloading}
            className="flex-1 bg-white text-black py-6 rounded-full font-black uppercase italic tracking-tight hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5 disabled:opacity-50"
         >
            {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} />} 
            {isDownloading ? 'Generating Word...' : 'Download Word Audit'}
         </button>
         
         {/* YENİ: Save to History butonu */}
         <button 
            onClick={handleSaveToHistory}
            disabled={isSaving || isSaved}
            className={`flex-1 border border-zinc-800 py-6 rounded-full font-black uppercase italic tracking-tight transition-all flex items-center justify-center gap-3 ${isSaved ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
         >
            {isSaving ? <Loader2 size={20} className="animate-spin text-orange-500" /> : isSaved ? <CheckCircle2 size={20} className="text-green-500" /> : <Save size={20} className="text-orange-500" />}
            {isSaving ? 'Saving...' : isSaved ? 'Saved to History' : 'Save to History'}
         </button>
      </div>
    </div>
  );
}