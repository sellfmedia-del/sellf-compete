// Dosya Yolu: src/services/arenaEngine.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function runArenaEngine(
  productLink: string, 
  platform: string, 
  category: string, 
  competitorBrands: string[], 
  competitorProducts: string[],
  previousData: any = null // Delta için kapımız açık kalıyor
) {
  let scrapedData = "";
  let marketResearch = "";
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const safePlatform = platform ? platform.toLowerCase() : "website";

  // Kendi ürünümüz ve rakip ürünlerin linklerini tek havuzda topluyoruz
  const allTargetUrls = [productLink, ...competitorProducts].filter(Boolean);

  // ==========================================
  // 1. ADIM: APIFY SCRAPER (Senin zırhlı kodundan alınan payloadlar)
  // ==========================================
  let actorId = "";
  let inputPayload = {};

  switch (safePlatform) {
    case 'trendyol':
      actorId = "fatihtahta~trendyol-scraper";
      inputPayload = {
        "startUrls": allTargetUrls, 
        "limit": 20, // Eski kodundaki gibi 20'ye çıkardık
        "getReviews": true, 
        "getQna": false,
        "couponsOnly": false
      };
      break;
    
    case 'amazon':
      actorId = "junglee~free-amazon-product-scraper"; 
      inputPayload = { 
        "categoryUrls": allTargetUrls.map(url => ({ "url": url })),
        "ensureLoadedProductDescriptionFields": false,
        "maxItemsPerStartUrl": 30, // YENİ: Eski kodundaki kritik sınır
        "maxProductVariantsAsSeparateResults": 0,
        "maxSearchPagesPerStartUrl": 1,
        "scrapeProductDetails": true,
        "scrapeProductVariantPrices": false,
        "useCaptchaSolver": false
      };
      break;

    case 'website':
      // YENİ: 'Website' seçilirse N/A dönmesin diye Google Shopping ekledik
      actorId = "epctex~google-shopping-scraper"; 
      inputPayload = { 
        "queries": allTargetUrls, 
        "maxItemsPerQuery": 10, 
        "country": "TR",
        "language": "tr"
      };
      break;
  }

  if (actorId && allTargetUrls.length > 0) {
    try {
      const apifyResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${process.env.APIFY_API_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputPayload)
      });

      // YENİ: Eski kodundaki sessiz hata (Silent Failure) yakalayıcı
      if (!apifyResponse.ok) {
        const errorText = await apifyResponse.text();
        console.error(`APIFY FETCH ERROR - Status: ${apifyResponse.status}, Details: ${errorText}`);
      } else {
        const apifyData = await apifyResponse.json();
        const slicedData = Array.isArray(apifyData) ? apifyData.slice(0, 20) : apifyData;
        scrapedData = JSON.stringify(slicedData);
      }
    } catch (error) {
      console.error("Apify Fetch Catch Error:", error);
    }
  }

  // ==========================================
  // 2. ADIM: TAVILY (Senin detaylı analiz promptların)
  // ==========================================
  try {
    let tavilyQuery = "";
    const brandsContext = competitorBrands.length > 0 ? `Target Brands: ${competitorBrands.join(', ')}.` : '';
    
    if (safePlatform === 'trendyol' || safePlatform === 'amazon') {
      tavilyQuery = `${platform} ${category} market trends, top selling specific competitor products, annual sales volume, customer feature requests and complaints ${currentYear}. ${brandsContext}`;
    } else {
      tavilyQuery = `"${category}" category Turkey market size (TAM), top traffic competitor websites, customer complaints and digital market share ${currentYear}. ${brandsContext}`;
    }

    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: tavilyQuery,
        search_depth: "advanced",
        include_answer: true 
      })
    });
    const tavilyData = await tavilyResponse.json();
    marketResearch = JSON.stringify(tavilyData.results);

    if (tavilyData.answer) {
      marketResearch += `\n\nAI Web Summary: ${tavilyData.answer}`;
    }
  } catch (error) {
    console.error("Tavily Error:", error);
  }

  // ==========================================
  // 3. ADIM: GEMINI (Fiyat Zenginleştirme)
  // ==========================================
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const prompt = `
    You are the Master Intelligence Engine for SellfCompete's 'Arena' Tracker.
    
    RAW DATA:
    - Target Platform: ${platform}
    - Category: ${category}
    - Scraped Product Data: ${scrapedData || "No scrape data. Rely on research."}
    - Web Research: ${marketResearch}
    - Competitor Brands: ${competitorBrands.join(', ')}
    
    PREVIOUS DATA (For Delta Calculation):
    ${previousData ? JSON.stringify(previousData) : "This is Day 0 (Baseline). Set 'discount_rate', 'sentiment_shift', 'sales_growth_estimate' to 'Baseline'."}

    CRITICAL INSTRUCTIONS:
    1. Look deeply into "Scraped Product Data" for exact prices and reviews. 
    2. If exact data is missing, use "Web Research" to estimate realistic values for the category. NEVER just output "N/A" for prices or "0" for reviews unless absolutely necessary.
    3. Output MUST be a STRICT JSON object with no markdown.
    
    EXPECTED JSON STRUCTURE:
    {
      "my_product": {
        "name": "Extract your main brand and product name from the data",
        "original_price": "string",
        "current_price": "string",
        "discount_rate": "string",
        "new_reviews_count": 0,
        "recent_10_reviews": ["string"],
        "sentiment_ratio": "string",
        "sales_growth_estimate": "string"
      },
      "competitor_products": [
        {
          "name": "Brand - Exact Product Name",
          "current_price": "string",
          "original_price": "string",
          "average_rating": 0,
          "recent_10_reviews": ["string"],
          "sentiment_shift": "string",
          "price_vs_category_avg": "string",
          "badges_and_campaigns": ["string"]
        }
      ],
      "competitor_brands": [
        {
          "name": "Brand Name",
          "store_rating": "string",
          "general_campaigns": ["string"],
          "new_product_variations": ["string"],
          "estimated_traffic_or_followers": "string"
        }
      ],
      "market_intelligence": {
        "top_3_keywords": ["string", "string", "string"],
        "market_momentum": "string",
        "top_5_complaints_and_insights": ["string"],
        "top_3_market_leaders": ["string", "string", "string"]
      }
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}