// Dosya Yolu: src/components/AuditPreviewMockup.tsx
'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Target, Sparkles, ArrowUpRight, ThumbsUp, ThumbsDown } from 'lucide-react';

// Bu, gerçek AuditReport.tsx'in tasarım dilini kullanan ama pazarlama amaçlı
// SABİT/ÖRNEK verilerle çalışan, ikna edici bir önizleme. Gerçek üründen bilinçli
// olarak daha renkli/canlı — landing page'de "abone olmak istetecek" bir vitrin.
// Gerçek uygulamada kullanılmıyor, sadece pazarlama sayfalarında.

const sampleSellers = [
  { rank: 1, name: 'Nova — Wireless ANC Earbuds Pro', share: '18.4%', price: '$79.90', trend: 'up' },
  { rank: 2, name: 'AcuSound — StudioBuds X2', share: '14.1%', price: '$64.50', trend: 'up' },
  { rank: 3, name: 'Kinetic — AirFlex 3', share: '11.7%', price: '$59.99', trend: 'down' },
];

const featureRequests = [
  'Wish it had wireless charging',
  'Needs a better carrying case',
  'Ask for longer battery life',
];

export default function AuditPreviewMockup() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const target = 94;
    const duration = 1400;
    const steps = 40;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setScore(target);
        clearInterval(timer);
      } else {
        setScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Arka plan glow — gerçek üründe olmayan, sadece vitrin için */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500/30 via-orange-500/10 to-transparent rounded-[3rem] blur-2xl opacity-60 animate-pulse" />

      <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-orange-500/20 rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-orange-500/10">
        {/* Üst şerit: canlı önizleme rozeti */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Live Sample Report</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Trendyol · Audio</span>
        </div>

        {/* Ürün / puan başlığı */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Asset: Wireless Earbuds</p>
            <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white">
              Market <span className="text-orange-500">Intelligence</span>
            </h3>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black italic bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text text-transparent tabular-nums">
              {score}
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Sentiment Score</p>
          </div>
        </div>

        {/* Top sellers mini liste */}
        <div className="space-y-2.5 mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 mb-3">
            <TrendingUp size={12} className="text-orange-500" /> Category Top Sellers
          </p>
          {sampleSellers.map((s) => (
            <div key={s.rank} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 shrink-0 bg-zinc-800 rounded-lg flex items-center justify-center font-black text-orange-500 text-xs italic">
                  #{s.rank}
                </div>
                <span className="text-xs font-bold text-zinc-200">{s.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-black italic text-white">{s.price}</span>
                <span className={`text-[10px] font-black flex items-center gap-0.5 ${s.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {s.share} <ArrowUpRight size={10} className={s.trend === 'down' ? 'rotate-90' : ''} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Feature requests — altın madeni kutusu */}
        <div className="p-4 bg-gradient-to-br from-orange-500/15 to-orange-500/5 border border-orange-500/25 rounded-2xl mb-4">
          <p className="text-[10px] font-black uppercase text-orange-400 mb-2.5 flex items-center gap-1.5">
            <Target size={12} /> Feature Requests (Goldmine)
          </p>
          <ul className="space-y-1.5">
            {featureRequests.map((req, i) => (
              <li key={i} className="text-[11px] text-zinc-300 font-medium italic flex items-center gap-2">
                <Sparkles size={10} className="text-orange-500 shrink-0" /> {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Kilitli/bulanık strategic gaps teaser — merak/FOMO yaratmak için */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="p-4 bg-zinc-100/5 border border-white/5 blur-[3px] select-none pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp size={12} className="text-green-500" />
              <div className="h-2 w-32 bg-zinc-700 rounded-full" />
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full mb-2" />
            <div className="flex items-center gap-2 mb-2 mt-3">
              <ThumbsDown size={12} className="text-red-500" />
              <div className="h-2 w-40 bg-zinc-700 rounded-full" />
            </div>
            <div className="h-2 w-3/4 bg-zinc-800 rounded-full" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-[10px] font-black uppercase tracking-widest text-white bg-orange-500 px-4 py-2 rounded-full shadow-lg">
              Unlock Full Strategic Report
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}