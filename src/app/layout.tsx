import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const GA_MEASUREMENT_ID = "G-35FP41G8Q4";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.sellfcompete.com'),
  title: {
    default: "SellfCompete — AI-Powered Market Intelligence",
    template: "%s",
  },
  description: "AI Powered Market Intelligence",
};

// JSON-LD: Organization + SoftwareApplication şeması — hem Google zengin sonuçları
// hem de AI yanıt motorlarının (GEO) markayı/ürünü doğru tanıması için.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "SellfCompete",
      "url": "https://www.sellfcompete.com",
      "logo": "https://www.sellfcompete.com/favicon.ico",
      "sameAs": ["https://www.sellfmedia.com"],
    },
    {
      "@type": "SoftwareApplication",
      "name": "SellfCompete",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "AI-powered competitor and market intelligence for e-commerce sellers on Trendyol, Amazon, and other marketplaces.",
      "offers": {
        "@type": "Offer",
        "price": "22",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-12-31",
        "url": "https://www.sellfcompete.com/pricing",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a]`}>
        {children} {/* Sadece içeriği basıyoruz, Navbar sayfanın kendi içinde */}
        <Analytics />
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      </body>
    </html>
  );
}