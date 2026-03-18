import { Search, FileUp, Globe, Store, Layout, ArrowLeft, Zap } from 'lucide-react';

interface Props {
  type: 'product' | 'idea';
  onBack: () => void;
  onStart: () => void;
}

export default function AuditInputForm({ type, onBack, onStart }: Props) {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-[3rem] p-10 relative overflow-hidden">
      <button onClick={onBack} className="absolute left-10 top-10 text-zinc-600 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="pt-12 space-y-10">
        {/* Input Area */}
        <div className="space-y-4">
          <h3 className="text-3xl font-black tracking-tighter uppercase italic">
            {type === 'product' ? 'Paste Product URL' : 'Describe Your Vision'}
          </h3>
          
          <div className="relative group">
            {type === 'product' ? (
              <input 
                type="text" 
                placeholder="Trendyol, Amazon, Shopify or Marketplace Link..." 
                className="w-full bg-black/50 border border-zinc-800 rounded-[2rem] py-6 px-8 text-lg focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-700"
              />
            ) : (
              <textarea 
                placeholder="Tell Gem about the product you want to create..." 
                className="w-full bg-black/50 border border-zinc-800 rounded-[2rem] p-8 text-lg focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-700 min-h-[160px] resize-none"
              />
            )}
          </div>
        </div>

        {/* File Upload & Start Button Group */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <button className="flex-1 w-full bg-zinc-800/50 border border-zinc-700/50 py-5 rounded-[2rem] flex items-center justify-center gap-3 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">
            <FileUp size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Upload Reference (PDF/Word/IMG)</span>
          </button>
          
          <button 
            onClick={onStart}
            className="flex-[0.5] w-full bg-white text-black py-5 rounded-full font-black uppercase italic tracking-tight hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5"
          >
            Start Deep Audit <Zap size={18} fill="currentColor" />
          </button>
        </div>

        {/* Platform Selection */}
        <div className="pt-10 border-t border-zinc-800/50">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6 text-center italic">Required: Select Target Ecosystem</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['Trendyol', 'Amazon', 'My Website', 'N11', 'Physical Store'].map((platform) => (
              <button key={platform} className="bg-white/5 border border-white/5 rounded-2xl py-4 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:border-orange-500/40 hover:text-orange-500 transition-all flex flex-col items-center gap-2">
                <Layout size={16} className="opacity-40" />
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}