import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function runAuditEngine(url: string, type: string, platform: string) {
  let scrapedData = "";
  let searchResearch = "";

  // 1. ADIM: APIFY - Eğer URL varsa gerçek ürün/rakip verilerini çek
  if (url && url.startsWith('http')) {
    try {
      const apifyResponse = await fetch(`https://api.apify.com/v2/acts/apify~trendyol-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_API_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startUrls: [{ url }],
          maxItems: 5 // Performans ve maliyet dengesi için ideal
        })
      });
      const apifyData = await apifyResponse.json();
      scrapedData = JSON.stringify(apifyData);
    } catch (error) {
      console.error("Apify Data Fetch Error:", error);
    }
  }

  // 2. ADIM: TAVILY - Güncel pazar trendleri ve platform spesifik bilgileri araştır
  try {
    const searchContext = url ? `${url} market analysis` : `${type} product market trends`;
    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `${platform} ${searchContext} customer complaints and commission rates 2026`,
        search_depth: "advanced"
      })
    });
    const tavilyData = await tavilyResponse.json();
    searchResearch = JSON.stringify(tavilyData.results);
  } catch (error) {
    console.error("Tavily Research Error:", error);
  }

  // 3. ADIM: GEMINI - Toplanan tüm veriyi dökümanındaki formata dök
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const prompt = `
    You are the Master Intelligence Engine for SellfCompete.
    
    RAW DATA SOURCES:
    - Marketplace Scrape: ${scrapedData || "No direct link provided"}
    - Web Research: ${searchResearch}
    - User Target: ${platform} (${url || type})

    TASK:
    Analyze the raw data above. Cross-reference marketplace facts with web research.
    Return a CLEAN JSON. No markdown.
    
    Structure (MANDATORY):
    1. topSellers: Array(3) {rank, title, sales_estimate}
    2. sentiment: {likes, dislikes}
    3. rivals: {mainThreat, closestMatch}
    4. pricing: {min, max, optimalRange, position}
    5. platformInfo: {commission, volumeShare, demandLevel}
    6. growth: {opportunity, threat, revenueForecast, score}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}