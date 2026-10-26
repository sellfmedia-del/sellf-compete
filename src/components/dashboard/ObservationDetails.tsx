import { type ProductObservation } from '@/src/lib/arena-data';

export function ReviewCoverage({ observation }: { observation: Partial<ProductObservation> | null | undefined }) {
  const shown = observation?.recent_10_reviews?.length ?? 0;
  return <p className="text-xs text-zinc-400 leading-relaxed my-3">
    Total reviews: {typeof observation?.total_reviews === 'number' ? observation.total_reviews.toLocaleString() : 'Not supplied'}
    {' · '}Collected sample: {typeof observation?.analyzed_reviews_count === 'number' ? observation.analyzed_reviews_count.toLocaleString() : 'Not recorded'}
    {' · '}Showing: {shown}
    {observation?.observed_at && <span className="block text-zinc-500 mt-1">Observed: {new Date(observation.observed_at).toLocaleString()}</span>}
  </p>;
}

export function ObservationChanges({ observation }: { observation: Partial<ProductObservation> | null | undefined }) {
  const delta = observation?.delta;
  if (observation?.data_status !== 'observed') return <p className="text-xs text-amber-400 mt-3">{observation?.data_status === 'stale' ? 'Previous observation — current values could not be verified.' : 'No verified current observation available.'}</p>;
  if (!delta?.since) return <p className="text-xs text-zinc-500 mt-3">Verified baseline. Changes will appear after the next successful observation.</p>;
  return <div className="mt-4 border-t border-zinc-800 pt-3 space-y-2 text-xs">
    <p className="text-zinc-500">Compared with {new Date(delta.since).toLocaleString()}</p>
    {(['price', 'reviews', 'rating'] as const).map(key => {
      const metric = delta[key];
      return <p key={key} className="text-zinc-300"><span className="capitalize">{key}</span>: {metric ? <>
        {metric.previous.toLocaleString()} → {metric.current.toLocaleString()}{key === 'price' && observation.currency ? ` ${observation.currency}` : ''}
        <span className={metric.change === 0 ? 'text-zinc-400' : metric.change > 0 ? 'text-emerald-400' : 'text-orange-400'}> · {metric.change > 0 ? '+' : ''}{metric.change.toLocaleString()}{key === 'price' && metric.percent !== null ? ` (${metric.percent > 0 ? '+' : ''}${metric.percent}%)` : ''}</span>
      </> : 'Comparison unavailable'}</p>;
    })}
  </div>;
}
