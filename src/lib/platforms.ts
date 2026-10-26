export const PLATFORMS = [
  { id: 'google-merchant-center', label: 'Google Merchant Center', scope: 'Google Shopping public listings', research: 'Google Shopping', hint: 'Product or store URL. Merchant account import will be available with account connections.' },
  { id: 'website', label: 'Website', scope: 'Public website research', research: 'website', hint: 'Product, company or website URL.' },
  { id: 'trendyol', label: 'Trendyol', scope: 'Marketplace listings and research', research: 'Trendyol', hint: 'Paste a Trendyol product URL.' },
  { id: 'hepsiburada', label: 'Hepsiburada', scope: 'Public marketplace research', research: 'Hepsiburada', hint: 'Paste a Hepsiburada product URL.' },
  { id: 'etsy', label: 'Etsy', scope: 'Public marketplace research', research: 'Etsy', hint: 'Paste an Etsy listing or shop URL.' },
  { id: 'amazon', label: 'Amazon', scope: 'Marketplace listings and research', research: 'Amazon', hint: 'Paste an Amazon product URL.' },
  { id: 'b2b', label: 'B2B', scope: 'Public company and offering research', research: 'B2B companies and business services', hint: 'Company URL, offer or business description. Include your target market.' },
  { id: 'physical-store', label: 'Fiziksel Mağaza', scope: 'Public local retail research', research: 'physical retail stores', hint: 'Store URL or description. Include the city, district and category.' },
] as const;

export type PlatformId = typeof PLATFORMS[number]['id'];
export type Platform = typeof PLATFORMS[number];

// Accept saved records and older clients without rewriting historical data.
export function getPlatform(value: unknown): Platform | undefined {
  if (typeof value !== 'string') return undefined;
  const key = value.trim().toLowerCase();
  const aliases: Record<string, PlatformId> = {
    'my website': 'website', 'own website': 'website', 'physical store': 'physical-store',
    physical: 'physical-store', 'fiziksel mağaza': 'physical-store',
    'google merchant center': 'google-merchant-center', 'google shopping': 'google-merchant-center',
  };
  return PLATFORMS.find(p => p.id === (aliases[key] || key));
}

export function platformLabel(value: unknown): string {
  return getPlatform(value)?.label || (typeof value === 'string' ? value : 'Website');
}
