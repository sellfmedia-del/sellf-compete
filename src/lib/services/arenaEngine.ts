// Dosya Yolu: src/services/arenaEngine.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function runArenaEngine(
  productLink: string, 
  platform: string, 
  category: string, 
  competitorBrands: string[], 
  competitorProducts: string[]
) {
  let scrapedData = "";
  let marketResearch = "";
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const safePlatform = platform ? platform.toLowerCase() : "website";

  // Kendi ürünümüz ve rakip ürünlerin linklerini tek havuzda topluyoruz
  const allTargetUrls = [productLink, ...competitorProducts].filter(Boolean);

  // ==========================================
  // 1. ADIM: APIFY SCRAPER (Ürün ve Fiyat Verileri)
  // ==========================================
  let actorId = "";
  let inputPayload = {};

  switch (safePlatform) {
    case 'trendyol':
      actorId = "fatihtahta~trendyol-scraper";
      inputPayload = {
        "startUrls": allTargetUrls, 
        "limit": 10, 
        "getReviews": true, 
        "getQna": false,
        "couponsOnly": false
      };
      break;
    
    case 'amazon':
      actorId = "junglee~free-amazon-product-scraper"; 
      inputPayload = { 
        "categoryUrls": allTargetUrls.map(url => ({ "url": url })),
        "scrapeProductDetails": true,
        "scrapeProductVariantPrices": false,
        "useCaptchaSolver": false
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

      if (apifyResponse.ok) {
        const apifyData = await apifyResponse.json();
        // Veriyi küçültmek için sadece ilk 20 öğeyi alıyoruz
        const slicedData = Array.isArray(apifyData) ? apifyData.slice(0, 20) : apifyData;
        scrapedData = JSON.stringify(slicedData);
      }
    } catch (error) {
      console.error("Apify Fetch Error:", error);
    }
  }

  // ==========================================
  // 2. ADIM: TAVILY (Pazar ve Marka Hacmi)
  // ==========================================
  try {
    const brandsContext = competitorBrands.length > 0 ? `Key competitors: ${competitorBrands.join(', ')}.` : '';
    const tavilyQuery = `"${category}" category e-commerce market trends on ${platform} Turkey ${currentYear}. ${brandsContext} Search for market growth momentum, top searched keywords, customer complaints, and traffic/follower estimates for these brands.`;

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
  // 3. ADIM: GEMINI (Veriyi Rapor Formatına Dönüştürme)
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

    TASK: Analyze the raw data and output a STRICT JSON object representing Day 0 (Baseline) tracking.
    Do NOT include markdown formatting (\`\`\`json etc.).
    
    EXPECTED JSON STRUCTURE:
    {
      "my_product": {
        "name": "Extract your main brand and product name from the data",
        "original_price": "string",
        "current_price": "string",
        "discount_rate": "string",
        "new_reviews_count": 0,
        "recent_10_reviews": ["string"],
        "sentiment_ratio": "string (e.g. 80% Positive, 20% Negative)",
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
          "price_vs_category_avg": "string (e.g. 10% below average)",
          "badges_and_campaigns": ["string"]
        }
      ],
      "competitor_brands": [
        {
          "name": "Brand Name",
          "store_rating": "string",
          "general_campaigns": ["string"],
          "new_product_variations": ["string (e.g. ML, size, packaging updates)"],
          "estimated_traffic_or_followers": "string"
        }
      ],
      "market_intelligence": {
        "top_3_keywords": ["string", "string", "string"],
        "market_momentum": "string (e-commerce volume and general growth)",
        "top_5_complaints_and_insights": ["string (Bullet point + Insight)", "string", "string", "string", "string"],
        "top_3_market_leaders": ["string", "string", "string"]
      }
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}