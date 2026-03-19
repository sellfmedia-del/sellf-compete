'use client';
import { useState } from 'react';
import { FileUp, Layout, ArrowLeft, Zap, Loader2 } from 'lucide-react';

interface Props {
  type: 'product' | 'idea';
  onBack: () => void;
  onStart: (formData: { url: string; platform: string }) => void; // Veri tipi güncellendi
  isLoading: boolean; // Loading prop eklendi
}

export default function AuditInputForm({ type, onBack, onStart, isLoading }: Props) {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('Trendyol');

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-[3rem] p-10 relative overflow-hidden">
      <button onClick={onBack} disabled={isLoading} className="absolute left-10 top-10 text-zinc-600 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-20">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="pt-12 space-y-10">
        <div className="space-y-4">
          <h3 className="text-3xl font-black tracking-tighter uppercase italic">
            {type === 'product' ? 'Paste Product URL' : 'Describe Your Vision'}
          </h3>
          <div className="relative group">
            {type === 'product' ? (
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                placeholder="Trendyol, Amazon, Shopify or Marketplace Link..." 
                className="w-full bg-black/50 border border-zinc-800 rounded-[2rem] py-6 px-8 text-lg focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-700 disabled:opacity-50"
              />
            ) : (
              <textarea 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                placeholder="Tell Gem about the product you want to create..." 
                className="w-full bg-black/50 border border-zinc-800 rounded-[2rem] p-8 text-lg focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-700 min-h-[160px] resize-none disabled:opacity-50"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <button disabled={isLoading} className="flex-1 w-full bg-zinc-800/50 border border-zinc-700/50 py-5 rounded-[2rem] flex items-center justify-center gap-3 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-20">
            <FileUp size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Upload Reference (PDF/Word/IMG)</span>
          </button>
          
          <button 
            onClick={() => onStart({ url, platform })}
            disabled={isLoading || !url}
            className="flex-[0.5] w-full bg-white text-black py-5 rounded-full font-black uppercase italic tracking-tight hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Start Deep Audit <Zap size={18} fill="currentColor" /></>}
          </button>
        </div>

        <div className="pt-10 border-t border-zinc-800/50">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6 text-center italic">Required: Select Target Ecosystem</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['Trendyol', 'Amazon', 'My Website', 'N11', 'Physical Store'].map((p) => (
              <button 
                key={p} 
                onClick={() => setPlatform(p)}
                disabled={isLoading}
                className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 border ${platform === p ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-white/5 border-white/5 text-zinc-500 hover:border-zinc-700'}`}
              >
                <Layout size={16} className={platform === p ? 'opacity-100' : 'opacity-40'} />
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}