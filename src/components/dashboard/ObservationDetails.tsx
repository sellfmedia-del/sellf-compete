import { type ProductObservation } from '@/src/lib/arena-data';

function displayTime(value: string) {
  return new Date(value).toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' }) + ' UTC';
}

export function ReviewCoverage({ observation }: { observation: Partial<ProductObservation> | null | undefined }) {
  const shown = observation?.recent_10_reviews?.length ?? 0;
  return <p className="text-xs text-zinc-400 leading-relaxed my-3">
    Total reviews: {typeof observation?.total_reviews === 'number' ? observation.total_reviews.toLocaleString('en-US') : 'Not supplied'}
    {' · '}Collected sample: {typeof observation?.analyzed_reviews_count === 'number' ? observation.analyzed_reviews_count.toLocaleString('en-US') : 'Not recorded'}
    {' · '}Showing: {shown}
    {observation?.observed_at && <span className="block text-zinc-500 mt-1">Observed: {displayTime(observation.observed_at)}</span>}
  </p>;
}

export function ObservationChanges({ observation }: { observation: Partial<ProductObservation> | null | undefined }) {
  const delta = observation?.delta;
  if (observation?.data_status !== 'observed') return <p className="text-xs text-amber-400 mt-3">{observation?.data_status === 'stale' ? 'Previous observation — current values could not be verified.' : 'No verified current observation available.'}</p>;
  if (!delta?.since) return <p className="text-xs text-zinc-500 mt-3">Verified baseline. Changes will appear after the next successful observation.</p>;
  return <div className="mt-4 border-t border-zinc-800 pt-3 space-y-2 text-xs">
    <p className="text-zinc-500">Compared with {displayTime(delta.since)}</p>
    {(['price', 'reviews', 'rating'] as const).map(key => {
      const metric = delta[key];
      return <p key={key} className="text-zinc-300"><span className="capitalize">{key}</span>: {metric ? <>
        {metric.previous.toLocaleString('en-US')} → {metric.current.toLocaleString('en-US')}{key === 'price' && observation.currency ? ` ${observation.currency}` : ''}
        <span className={metric.change === 0 ? 'text-zinc-400' : metric.change > 0 ? 'text-emerald-400' : 'text-orange-400'}> · {metric.change > 0 ? '+' : ''}{metric.change.toLocaleString('en-US')}{key === 'price' && metric.percent !== null ? ` (${metric.percent > 0 ? '+' : ''}${metric.percent}%)` : ''}</span>
      </> : 'Comparison unavailable'}</p>;
    })}
  </div>;
}
