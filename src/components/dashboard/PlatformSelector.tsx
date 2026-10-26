'use client';
import { PLATFORMS, getPlatform } from '@/src/lib/platforms';

export default function PlatformSelector({ value, onChange, disabled = false }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const selected = getPlatform(value);
  return <fieldset disabled={disabled} className="space-y-3">
    <legend className="text-xs font-bold text-zinc-400 mb-3">Platform / Mecra</legend>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {PLATFORMS.map(platform => <button key={platform.id} type="button" aria-pressed={selected?.id === platform.id} onClick={() => onChange(platform.id)}
        className={`min-h-14 px-3 py-3 rounded-2xl text-xs font-bold border transition-colors disabled:opacity-50 ${selected?.id === platform.id ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-white/5 border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}>
        {platform.label}
      </button>)}
    </div>
    {selected && <p className="text-xs leading-relaxed text-zinc-500">{selected.hint}</p>}
  </fieldset>;
}
