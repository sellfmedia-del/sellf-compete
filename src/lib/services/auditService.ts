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
  const targetInput = url || type || ""; // HATA ÇÖZÜMÜ: Sadece url değil, type (prompt) da gelebilir
  let searchQuery = "bestseller"; // Fallback kelime
  const isUrl = targetInput.startsWith('http'); // HATA ÇÖZÜMÜ: url değişkeni boşsa hata vermesini önledik
  
  try {
    const prePrompt = `
      Analyze this user input: "${targetInput}". It is either a specific product URL or a product idea/prompt.
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
  const safePlatform = platform ? platform.toLowerCase() : ""; // HATA ÇÖZÜMÜ: Frontend'den gelen büyük/küçük harf sorununu çözdük

  switch (safePlatform) { // safePlatform kullanıyoruz
    case 'trendyol':
      actorId = "fatihtahta~trendyol-scraper";
      // Dinamik Kategori URL'si oluşturma
      const trendyolSearchUrl = `https://www.trendyol.com/sr?q=${encodeURIComponent(searchQuery)}`;
      
      // LİNK VARSA: Hem ürünü hem kategoriyi çek. LİNK YOKSA (FİKİR): Sadece kategoriyi çek.
      // HATA ÇÖZÜMÜ: Trendyol JSON yapısı object değil, direkt string dizisi (array of strings) ister.
      const trendyolUrls = isUrl 
        ? [targetInput, trendyolSearchUrl] 
        : [trendyolSearchUrl];

      inputPayload = {
        "startUrls": trendyolUrls,
        "limit": 10, // HATA ÇÖZÜMÜ: Apify kuralları gereği minimum 10 olmalıdır
        "getReviews": true, // Sentiment analizi için açtık
        "getQna": false,
        "couponsOnly": false
      };
      break;
    
    case 'amazon':
      actorId = "junglee~free-amazon-product-scraper"; 
      const amazonSearchUrl = `https://www.amazon.com.tr/s?k=${encodeURIComponent(searchQuery)}`;
      
      // Amazon scraper nesne dizisi (array of objects) ister.
      const amazonUrls = isUrl 
        ? [{ "url": targetInput }, { "url": amazonSearchUrl }] 
        : [{ "url": amazonSearchUrl }];
      
      inputPayload = { 
        "categoryUrls": amazonUrls,
        "ensureLoadedProductDescriptionFields": false,
        "maxItemsPerStartUrl": 5, // Optimized for performance and cost
        "maxProductVariantsAsSeparateResults": 0,
        "maxSearchPagesPerStartUrl": 1, // Restricted to first page only
        "scrapeProductDetails": true,
        "scrapeProductVariantPrices": false,
        "useCaptchaSolver": false
      };
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

      // HATA ÇÖZÜMÜ: Sessiz hata (Silent Failure) yakalayıcı eklendi
      if (!apifyResponse.ok) {
        const errorText = await apifyResponse.text();
        console.error(`APIFY FETCH ERROR - Status: ${apifyResponse.status}, Details: ${errorText}`);
      } else {
        const apifyData = await apifyResponse.json();
        scrapedData = JSON.stringify(apifyData);
      }
    } catch (error) {
      console.error("Apify Fetch Error:", error);
    }
  }

  // 2. ADIM: TAVILY - Pazar araştırması (Akıllı Yönlendirme)
  try {
    let tavilyQuery = "";
    let includeAnswer = false;

    if (safePlatform === 'trendyol' || safePlatform === 'amazon') {
      // Pazar yerleri için çalışan sistemi koruyoruz
      const searchContext = isUrl ? `${searchQuery} category market analysis` : `${searchQuery} product market trends`;
      tavilyQuery = `${platform} ${searchContext} customer complaints and commission rates ${currentYear}`;
    } else if (safePlatform === 'physical store' || safePlatform === 'physical') {
      // Fiziksel Mağaza İçin: Kapsamlı yerel perakende analizi, maliyetler, karlı lokasyonlar ve rakiplerin mağaza sayısı
      tavilyQuery = `"${searchQuery}" Türkiye fiziksel mağaza rakipleri, en karlı dükkan lokasyonları, rakiplerin tahmini mağaza sayısı, ürünün mağaza satışına uygunluğu, ortalama mağaza kira/işletme maliyetleri ve perakende satış fizibilitesi ${currentYear}`;
      includeAnswer = true;
    } else {
      // My Website / Diğer İçin: Markayı/Ürünü anlama, genel internet karşılaştırması ve en çok trafik alan rakipler
      tavilyQuery = `"${targetInput}" nedir ve ne satıyor? "${searchQuery}" kategorisinde Türkiye'nin en çok trafik alan rakip websiteleri, pazar lideri online markalar, internette genel satılan ürün tiplerinin karşılaştırması ve dijital pazar payı dağılımı ${currentYear}`;
      includeAnswer = true;
    }

    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: tavilyQuery,
        search_depth: "advanced",
        include_answer: includeAnswer // Gemini'ye yardımcı olmak için Tavily'den bir AI özeti istiyoruz
      })
    });
    const tavilyData = await tavilyResponse.json();
    searchResearch = JSON.stringify(tavilyData.results);

    // Eğer Tavily bir özet (answer) ürettiyse onu da araştırmanın sonuna ekliyoruz
    if (includeAnswer && tavilyData.answer) {
      searchResearch += `\n\nAI Web Summary: ${tavilyData.answer}`;
    }
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
    - Target: ${platform} (${targetInput})

    CRITICAL RULES:
    1. EXCLUDE TARGET: Under no circumstances should the target brand/URL ("${targetInput}") appear in the 'topSellers' list.
    2. EXTERNAL COMPETITORS ONLY: 'topSellers' MUST feature the top 3 distinct competitor BRANDS or WEBSITES dominating the "${searchQuery}" category. Do NOT list marketplaces (Trendyol, Amazon, etc.) as competitors.
    3. MARKET SHARE: For 'sales_estimate', calculate an estimated market share percentage (e.g., "18% Pazar Payı"). Do not use "N/A".
    4. WEBSITE SPECIFIC: If platform is Web, deeply understand the product, compare it with internet general sales, and focus on high-traffic competitor websites.
    5. PHYSICAL STORE SPECIFIC: If platform is Physical, incorporate profitable locations, average store costs, competitor store counts, and product retail feasibility into 'platformInfo' and 'growth'.

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