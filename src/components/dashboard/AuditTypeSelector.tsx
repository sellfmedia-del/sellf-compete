import { Package, Lightbulb } from 'lucide-react';

export default function AuditTypeSelector({ onSelect }: { onSelect: (type: 'product' | 'idea') => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <button 
        onClick={() => onSelect('product')}
        className="group bg-zinc-900/40 border border-zinc-800 p-12 rounded-[3rem] text-center hover:border-orange-500/50 transition-all duration-500"
      >
        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
          <Package size={40} className="text-zinc-500 group-hover:text-orange-500 transition-colors" />
        </div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">I have a product</h3>
        <p className="text-zinc-500 text-xs mt-3 font-bold uppercase tracking-widest">Paste link & Analyze</p>
      </button>

      <button 
        onClick={() => onSelect('idea')}
        className="group bg-zinc-900/40 border border-zinc-800 p-12 rounded-[3rem] text-center hover:border-orange-500/50 transition-all duration-500"
      >
        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
          <Lightbulb size={40} className="text-zinc-500 group-hover:text-orange-500 transition-colors" />
        </div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">I have an idea</h3>
        <p className="text-zinc-500 text-xs mt-3 font-bold uppercase tracking-widest">Prompt & Strategize</p>
      </button>
    </div>
  );
}