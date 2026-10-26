import { getPlatform } from './platforms';

export function publicUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2000) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port && !['80', '443'].includes(url.port)) return null;
    if (!host.includes('.') || host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.localhost') || host.includes(':') || /^\d+(\.\d+){3}$/.test(host)) return null;
    return url.toString();
  } catch { return null; }
}

export function validateArenaInput(body: Record<string, unknown>) {
  const platform = getPlatform(body.platform);
  const productLink = typeof body.productLink === 'string' ? body.productLink.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  if (!platform || !productLink || productLink.length > 2000 || !category || category.length > 500) throw new Error('Please select a platform and provide a target and category.');
  if (!['b2b', 'physical-store'].includes(platform.id) && !publicUrl(productLink)) throw new Error('Please enter a valid public product or website URL.');
  if (/^https?:/i.test(productLink) && !publicUrl(productLink)) throw new Error('Please enter a public URL.');
  const brands = body.competitorBrands ?? [];
  const products = body.competitorProducts ?? [];
  if (!Array.isArray(brands) || brands.length > 5 || brands.some(v => typeof v !== 'string' || v.length > 300)) throw new Error('Enter up to 5 competitor brands.');
  if (!Array.isArray(products) || products.length > 5 || products.some(v => !publicUrl(v))) throw new Error('Enter up to 5 valid public competitor URLs.');
  return { productLink, category, platform, competitorBrands: brands as string[], competitorProducts: [...new Set(products as string[])] };
}
