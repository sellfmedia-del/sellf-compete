export type Source = { url: string; title: string; observed_at: string; method: 'marketplace' | 'web' };
export type MetricDelta = { previous: number; current: number; change: number; percent: number | null };
export type ProductObservation = {
  source_url: string;
  name: string;
  current_price: string | null;
  original_price: string | null;
  price_amount: number | null;
  currency: string | null;
  total_reviews: number | null;
  average_rating: number | null;
  recent_10_reviews: string[];
  review_sample?: string[];
  analyzed_reviews_count: number;
  observed_at: string | null;
  data_status: 'observed' | 'unavailable' | 'stale' | 'legacy';
  badges_and_campaigns: string[];
  delta?: { price: MetricDelta | null; reviews: MetricDelta | null; rating: MetricDelta | null; since: string | null };
  new_reviews_count?: number | null;
  sentiment_ratio?: string;
  sales_growth_estimate?: string;
  discount_rate?: string;
  sentiment_shift?: string;
  price_vs_category_avg?: string;
};

export type ArenaSnapshot = {
  schema_version: 2;
  observed_at: string;
  platform: string;
  my_product: ProductObservation;
  competitor_products: ProductObservation[];
  competitor_brands: { name: string; store_rating: string; general_campaigns: string[]; new_product_variations: string[]; estimated_traffic_or_followers: string }[];
  market_intelligence: { top_3_keywords: string[]; market_momentum: string; top_5_complaints_and_insights: string[]; top_3_market_leaders: string[] };
  sources: Source[];
  warnings: string[];
};

export function canonicalUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    // Preserve variant/query identifiers; remove only known tracking parameters.
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|gclid$|fbclid$|ref$|ref_$)/i.test(key)) url.searchParams.delete(key);
    }
    url.hash = '';
    url.searchParams.sort();
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const productId = host.endsWith('trendyol.com') ? url.pathname.match(/-p-(\d+)/)?.[1]
      : /(^|\.)amazon\./.test(host) ? url.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1] : null;
    return `${host}${productId ? `/product/${productId.toUpperCase()}` : url.pathname.replace(/\/$/, '')}${url.search}`;
  } catch { return ''; }
}

export function parseNumeric(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !value.trim() || /[<>]|\d\s*[-–]\s*\d|\d\s*[kmb]\b/i.test(value)) return null;
  if ((value.match(/-?\d[\d.,]*/g) || []).length !== 1) return null;
  let text = value.replace(/[^\d.,-]/g, '');
  if (!text || !/\d/.test(text)) return null;
  const comma = text.lastIndexOf(',');
  const dot = text.lastIndexOf('.');
  if (comma >= 0 && dot >= 0) {
    const decimal = comma > dot ? ',' : '.';
    const thousands = decimal === ',' ? /\./g : /,/g;
    text = text.replace(thousands, '').replace(decimal, '.');
  } else if (comma >= 0 || dot >= 0) {
    const separator = comma >= 0 ? ',' : '.';
    const parts = text.split(separator);
    if (parts.length > 2 || parts[1]?.length === 3) text = parts.join('');
    else text = text.replace(separator, '.');
  }
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export function metricDelta(previous: unknown, current: unknown): MetricDelta | null {
  if (typeof previous !== 'number' || typeof current !== 'number' || !Number.isFinite(previous) || !Number.isFinite(current)) return null;
  const change = Math.round((current - previous) * 10000) / 10000;
  return { previous, current, change, percent: previous === 0 ? null : Math.round(change / previous * 10000) / 100 };
}

export function emptyObservation(url: string, name: string): ProductObservation {
  return { source_url: url, name, current_price: null, original_price: null, price_amount: null, currency: null,
    total_reviews: null, average_rating: null, recent_10_reviews: [], analyzed_reviews_count: 0,
    observed_at: null, data_status: 'unavailable', badges_and_campaigns: [] };
}

type Row = Record<string, unknown>;
function record(value: unknown): Row { return value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {}; }
function first(row: Row, keys: string[]): unknown { return keys.map(key => row[key]).find(value => value !== null && value !== undefined); }

// Numeric observations come from collected marketplace fields, never AI estimates.
export function normalizeMarketplaceItem(input: unknown, observedAt: string): ProductObservation | null {
  const row = record(input);
  if (row.error || (row.type && row.type !== 'product')) return null;
  const url = first(row, ['url', 'productUrl', 'productURL', 'product_url', 'link', 'detailPageUrl']);
  if (typeof url !== 'string' || !canonicalUrl(url)) return null;
  const priceObject = record(row.price);
  const pricing = record(row.pricing);
  const discounted = record(priceObject.discountedPrice);
  const rawPrice = pricing.current_price ?? first(row, ['discountedPrice', 'salePrice', 'currentPrice', 'finalPrice']) ?? first(priceObject, ['value', 'amount', 'current', 'discounted']) ?? discounted.value ?? (typeof row.price === 'object' ? null : row.price);
  const amount = parseNumeric(rawPrice);
  const price = amount !== null && amount >= 0 ? amount : null;
  const reviewSummary = record(row.ratingScore);
  const ratingObject = record(row.rating);
  const metricsRating = record(record(row.metrics).rating);
  const rawTotal = metricsRating.comment_count ?? first(row, ['totalReviews', 'reviewCount', 'reviewsCount', 'numberOfReviews']) ?? first(reviewSummary, ['reviewCount']) ?? ratingObject.count;
  const total = parseNumeric(rawTotal);
  const totalReviews = total !== null && Number.isInteger(total) && total >= 0 ? total : null;
  const rating = parseNumeric(metricsRating.average_rating ?? first(row, ['averageRating', 'average_rating', 'stars']) ?? ratingObject.value ?? reviewSummary.averageRating ?? (typeof row.rating === 'object' ? null : row.rating));
  const reviews = (Array.isArray(row.reviews) ? row.reviews : []).flatMap(value => {
    const item = record(value);
    const text = typeof value === 'string' ? value : first(item, ['text', 'comment', 'reviewText', 'content', 'description']);
    return typeof text === 'string' && text.trim() ? [text.trim()] : [];
  });
  const uniqueReviews = [...new Set(reviews)];
  const currency = pricing.currency ?? first(row, ['currency', 'currencyCode']) ?? priceObject.currency;
  const currencyAliases: Record<string, string> = { '$': 'USD', '€': 'EUR', '£': 'GBP', '₺': 'TRY', TL: 'TRY' };
  const resolvedCurrency = typeof currency === 'string' ? currencyAliases[currency.toUpperCase()] || currency.toUpperCase() : /trendyol\.com|hepsiburada\.com|amazon\.com\.tr/.test(url) ? 'TRY' : null;
  const name = first(row, ['name', 'title', 'productName', 'productTitle']);
  const sourceTime = record(row.source_context).scraped_time;
  const measuredAt = typeof sourceTime === 'string' && Number.isFinite(Date.parse(sourceTime)) ? sourceTime : observedAt;
  const sourceIsFresh = Math.abs(Date.parse(observedAt) - Date.parse(measuredAt)) < 2 * 60 * 60 * 1000;
  return { ...emptyObservation(url, typeof name === 'string' ? name : url),
    price_amount: price, currency: resolvedCurrency, current_price: price === null ? null : `${price}${resolvedCurrency ? ` ${resolvedCurrency}` : ''}`,
    original_price: null, total_reviews: totalReviews,
    average_rating: rating !== null && rating >= 0 && rating <= 5 ? rating : null,
    recent_10_reviews: uniqueReviews.slice(0, 10), review_sample: uniqueReviews, analyzed_reviews_count: uniqueReviews.length,
    observed_at: measuredAt, data_status: sourceIsFresh ? 'observed' : 'stale',
    badges_and_campaigns: [
      ...(Array.isArray(row.badges) ? row.badges : []),
      ...(Array.isArray(record(row.badges).simplified) ? record(row.badges).simplified as unknown[] : []),
      ...(Array.isArray(record(row.promotions).items) ? record(row.promotions).items as unknown[] : []),
    ].flatMap(value => { const label = typeof value === 'string' ? value : first(record(value), ['title', 'name']); return typeof label === 'string' ? [label] : []; }),
  };
}

export function normalizeMarketplaceDataset(items: unknown[], observedAt: string): ProductObservation[] {
  const products = items.map(item => normalizeMarketplaceItem(item, observedAt)).filter((p): p is ProductObservation => p !== null);
  for (const product of products) {
    const separateReviews = items.flatMap(item => {
      const row = record(item);
      if (row.type !== 'review') return [];
      const parent = record(row.parent_product);
      const url = parent.url ?? row.url;
      if (canonicalUrl(url) !== canonicalUrl(product.source_url)) return [];
      return typeof row.comment === 'string' && row.comment.trim() ? [row.comment.trim()] : [];
    });
    const allReviews = [...new Set([...(product.review_sample || product.recent_10_reviews), ...separateReviews])];
    product.analyzed_reviews_count = Math.max(product.analyzed_reviews_count, allReviews.length);
    product.review_sample = allReviews;
    product.recent_10_reviews = allReviews.slice(0, 10);
  }
  return products;
}

export function compareObservation(current: ProductObservation, previous: unknown): ProductObservation {
  const old = record(previous);
  // Legacy model-generated numbers must not become a verified comparison baseline.
  const comparable = old.data_status === 'observed' && typeof old.observed_at === 'string' && current.data_status === 'observed';
  const sameCurrency = typeof current.currency === 'string' && old.currency === current.currency;
  const delta = {
    price: comparable && sameCurrency ? metricDelta(old.price_amount, current.price_amount) : null,
    reviews: comparable ? metricDelta(old.total_reviews, current.total_reviews) : null,
    rating: comparable ? metricDelta(old.average_rating, current.average_rating) : null,
    since: comparable ? old.observed_at as string : null,
  };
  return { ...current, delta, new_reviews_count: delta.reviews?.change ?? null };
}
