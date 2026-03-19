import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function runAuditEngine(url: string, type: string, platform: string) {
  let scrapedData = "";
  let searchResearch = "";
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentDate = now.toDateString();

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  // 0. ADIM: KATEGORİ VE ARAMA KELİMESİ KEŞFİ (The Brain Step)
  // Gemini'ye linki veya fikri verip, pazardaki "anahtar kelimesini" bulduruyoruz.
  let searchQuery = "bestseller"; // Fallback kelime
  const isUrl = url && url.startsWith('http');
  
  try {
    const prePrompt = `
      Analyze this user input: "${url}". It is either a specific product URL or a product idea/prompt.
      Determine the best, most generic search keyword to find this product and its main competitors on ${platform} in Turkey.
      Return ONLY a raw JSON object with no markdown.
      Structure: {"searchQuery": "string"}
    `;
    const preResult = await model.generateContent(prePrompt);
    const preText = preResult.response.text().replace(/```json|```/g, "").trim();
    searchQuery = JSON.parse(preText).searchQuery;
  } catch (e) {
    console.error("Category Discovery Error:", e);
  }

  // 1. ADIM: SCRAPER ROUTER & APIFY (Hibrit Çalışma)
  let actorId = "";
  let inputPayload = {};

  switch (platform) {
    case 'Trendyol':
      actorId = "fatihtahta~trendyol-scraper";
      // Dinamik Kategori URL'si oluşturma
      const trendyolSearchUrl = `https://www.trendyol.com/sr?q=${encodeURIComponent(searchQuery)}`;
      
      // LİNK VARSA: Hem ürünü hem kategoriyi çek. LİNK YOKSA (FİKİR): Sadece kategoriyi çek.
      const trendyolUrls = isUrl 
        ? [{ "url": url }, { "url": trendyolSearchUrl }] 
        : [{ "url": trendyolSearchUrl }];

      inputPayload = {
        "startUrls": trendyolUrls,
        "limit": 5, // Performans için 5 ürün yeterli
        "getReviews": true, // Sentiment analizi için açtık
        "getQna": false,
        "couponsOnly": false
      };
      break;
    
    case 'Amazon':
      actorId = "apify~amazon-crawler"; 
      const amazonSearchUrl = `https://www.amazon.com.tr/s?k=${encodeURIComponent(searchQuery)}`;
      const amazonUrls = isUrl ? [url, amazonSearchUrl] : [amazonSearchUrl];
      
      inputPayload = { "directUrls": amazonUrls, "maxItems": 5 };
      break;

    default:
      console.log(`${platform} için özel scraper tanımlı değil.`);
      break;
  }

  if (actorId) {
    try {
      const apifyResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${process.env.APIFY_API_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputPayload)
      });
      const apifyData = await apifyResponse.json();
      scrapedData = JSON.stringify(apifyData);
    } catch (error) {
      console.error("Apify Fetch Error:", error);
    }
  }

  // 2. ADIM: TAVILY - Pazar araştırması (Her zaman çalışır)
  try {
    // Tavily'yi de artık Gemini'nin bulduğu anahtar kelimeyle (searchQuery) besliyoruz
    const searchContext = isUrl ? `${searchQuery} category market analysis` : `${searchQuery} product market trends`;
    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `${platform} ${searchContext} customer complaints and commission rates ${currentYear}`,
        search_depth: "advanced"
      })
    });
    const tavilyData = await tavilyResponse.json();
    searchResearch = JSON.stringify(tavilyData.results);
  } catch (error) {
    console.error("Tavily Error:", error);
  }

  // 3. ADIM: GEMINI - Verileri Rapor Formatına Dönüştürme
  const prompt = `
    Current System Date: ${currentDate}
    You are the Master Intelligence Engine for SellfCompete.
    
    RAW DATA SOURCES:
    - Marketplace Scrape (${platform}): ${scrapedData || "No direct link provided"}
    - Web Research: ${searchResearch}
    - Target: ${platform} (${url || type})

    TASK:
    Analyze the raw data above. Cross-reference marketplace facts with web research.
    Return a CLEAN JSON. No markdown.
    
    Structure:
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