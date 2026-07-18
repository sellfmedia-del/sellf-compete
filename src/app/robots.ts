// Dosya Yolu: src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.sellfcompete.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api', '/(auth)'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}