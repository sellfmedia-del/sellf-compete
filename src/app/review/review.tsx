'use client';
import { useState } from 'react';
import AuditInputForm from '@/src/components/dashboard/AuditInputForm';
import PlatformSelector from '@/src/components/dashboard/PlatformSelector';
import CreditDialog from '@/src/components/dashboard/CreditDialog';
import { ObservationChanges, ReviewCoverage } from '@/src/components/dashboard/ObservationDetails';
import { compareObservation, emptyObservation } from '@/src/lib/arena-data';
import { platformLabel } from '@/src/lib/platforms';

const previous = { ...emptyObservation('https://example.com/product', 'Example product'), data_status: 'observed' as const, observed_at: '2026-10-25T12:00:00Z', currency: 'TRY', price_amount: 999, total_reviews: 1240, average_rating: 4.3 };
const observation = compareObservation({ ...previous, observed_at: '2026-10-26T12:00:00Z', current_price: '899 TRY', price_amount: 899, total_reviews: 1286, average_rating: 4.4, analyzed_reviews_count: 50, recent_10_reviews: Array.from({length:10},(_,i) => `Example review ${i+1}`) }, previous);
export default function Review() {
  const [platform, setPlatform] = useState('trendyol');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  return <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-4 sm:p-8">
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="space-y-3"><p className="text-orange-500 font-bold">SELLFCOMPETE · PREVIEW</p><h1 className="text-3xl font-bold">Arena & Audit review</h1><p className="text-sm text-zinc-400">Interface review with demonstration values. This page does not run paid scans or change live data. It is unavailable on production.</p></header>
      <section className="rounded-3xl border border-zinc-800 p-6 space-y-4"><h2 className="text-xl font-bold">Arena · Platform selection</h2><PlatformSelector value={platform} onChange={setPlatform} /><p className="text-sm text-orange-400" role="status">Selected: {platformLabel(platform)}</p></section>
      <section><h2 className="text-xl font-bold mb-4">Audit · Input</h2><AuditInputForm type="product" isLoading={false} onBack={() => setSelected(null)} onStart={form => setSelected(platformLabel(form.platform))} />{selected && <p role="status" className="mt-4 text-orange-400">Selected audit platform: {selected}. Scanning is disabled on this review page.</p>}</section>
      <section className="rounded-3xl border border-zinc-800 p-6"><h2 className="text-xl font-bold">Arena · Measurement changes (example)</h2><ObservationChanges observation={observation} /><ReviewCoverage observation={observation} /></section>
      <section className="rounded-3xl border border-zinc-800 p-6 space-y-3"><h2 className="text-xl font-bold">Credit limit</h2><button type="button" onClick={() => setDialogOpen(true)} className="rounded-full bg-orange-500 text-black font-bold px-6 py-3">Preview credit message</button><CreditDialog open={dialogOpen} onClose={() => setDialogOpen(false)} /></section>
    </div>
  </main>;
}
