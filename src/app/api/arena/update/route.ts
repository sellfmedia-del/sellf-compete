// Dosya Yolu: src/app/api/arena/update/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server'; 
import { runArenaEngine } from '@/src/lib/services/arenaEngine'; // Yolunu projene göre kontrol et

// --- YARDIMCI FONKSİYON: Fiyat Metninden Rakam Çıkarma ---
// (Örn: "1.250,50 TRY" veya "389 TL" metinlerini saf matematiğe 1250.50 veya 389 olarak çevirir)
function parsePrice(priceStr: string | undefined): number | null {
  if (!priceStr) return null;
  const numStr = priceStr.replace(/[^\d.,]/g, '');
  let normalized = numStr;
  
  if (normalized.includes(',')) {
     normalized = normalized.replace(/\./g, '').replace(',', '.');
  }
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 1. KİMLİK KONTROLÜ
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // 2. KREDİ KONTROLÜ (Pre-flight Check)
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (!profile || profile.credits <= 0) {
      return NextResponse.json({ 
        error: "Insufficient credits. Please upgrade your plan to update data." 
      }, { status: 403 });
    }

    // 3. MEVCUT (ESKİ) VERİYİ ÇEK
    const { data: currentRecord, error: fetchError } = await supabase
      .from('user_products')
      .select('*')
      .eq('id', productId)
      .eq('user_id', user.id) // Güvenlik: Sadece kendi ürününü güncelleyebilir
      .single();

    if (fetchError || !currentRecord) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    // 4. MOTORU ÇALIŞTIR (Kıyaslama için eski veriyi parametre olarak gönderiyoruz)
    const newUpdatedData = await runArenaEngine(
      currentRecord.product_link,
      currentRecord.platform,
      currentRecord.category,
      currentRecord.competitor_brands,
      currentRecord.competitor_products,
      currentRecord.latest_data // DELTA İÇİN GEÇMİŞ VERİ
    );

    // --- 4.5 DELTA (FARK) MOTORU: SUNUCU TARAFLI KESİN MATEMATİK ---
    
    // 1. KENDİ ÜRÜNÜMÜZ (MY ASSET) İÇİN MATEMATİK
    const oldMyProduct = currentRecord.latest_data?.my_product;
    const newMyProduct = newUpdatedData?.my_product;

    if (oldMyProduct && newMyProduct) {
      // A) Fiyat Değişimi
      const oldPrice = parsePrice(oldMyProduct.current_price);
      const newPrice = parsePrice(newMyProduct.current_price);
      if (oldPrice !== null && newPrice !== null && oldPrice > 0) {
        const diff = newPrice - oldPrice;
        const percentage = Math.abs((diff / oldPrice) * 100).toFixed(1);
        if (diff > 0) newMyProduct.discount_rate = `+%${percentage} Fiyat Artışı 📈`;
        else if (diff < 0) newMyProduct.discount_rate = `-%${percentage} Fiyat Düşüşü 📉`;
        else newMyProduct.discount_rate = "Fiyat Sabit";
      }

      // B) Net Yeni Yorum Sayısı
      const oldReviews = oldMyProduct.recent_10_reviews || [];
      const newReviews = newMyProduct.recent_10_reviews || [];
      const actualNewReviews = newReviews.filter((rev: string) => !oldReviews.includes(rev));
      newMyProduct.new_reviews_count = actualNewReviews.length;

      // C) Satış Büyüme Tahminini (Eğer AI "Baseline" dendiyse eski değeri koru)
      if (newMyProduct.sales_growth_estimate === "Baseline" || !newMyProduct.sales_growth_estimate) {
        newMyProduct.sales_growth_estimate = oldMyProduct.sales_growth_estimate || "Calculating...";
      }
    }

    // 2. RAKİP ÜRÜNLER (COMPETITORS) İÇİN MATEMATİK VE DEDEKTİFLİK
    const oldCompetitors = currentRecord.latest_data?.competitor_products || [];
    const newCompetitors = newUpdatedData?.competitor_products || [];

    if (Array.isArray(newCompetitors)) {
      newCompetitors.forEach((newComp: any) => {
        // Aynı isimdeki eski rakibi bul
        const oldComp = oldCompetitors.find((c: any) => c.name === newComp.name);
        
        if (oldComp) {
          // A) Rakip Fiyat Farkı
          const oldCPrice = parsePrice(oldComp.current_price);
          const newCPrice = parsePrice(newComp.current_price);
          
          let priceShiftStr = "";
          if (oldCPrice !== null && newCPrice !== null && oldCPrice > 0) {
            const diff = newCPrice - oldCPrice;
            const percentage = Math.abs((diff / oldCPrice) * 100).toFixed(1);
            if (diff > 0) priceShiftStr = `(+%${percentage} Artış)`;
            else if (diff < 0) priceShiftStr = `(-%${percentage} Düşüş)`;
          }
          
          // Eğer rakip fiyatı değişmişse, bunu price_vs_category_avg alanına not olarak ekle
          if (priceShiftStr) {
             const currentAvgText = newComp.price_vs_category_avg || "";
             newComp.price_vs_category_avg = `${currentAvgText} ${priceShiftStr}`.trim();
          }

          // B) Rakip Yeni Kampanya/Rozet Dedektörü
          const oldBadges = oldComp.badges_and_campaigns || [];
          const newBadges = newComp.badges_and_campaigns || [];
          
          // Eskide olmayan yeni rozetleri bul ve başlarına "YENİ:" ekle
          const newlyAddedBadges = newBadges.filter((b: string) => !oldBadges.includes(b));
          
          if (newlyAddedBadges.length > 0) {
             // Mevcut rozet listesini güncelle (Yenileri belirginleştirerek)
             newComp.badges_and_campaigns = newBadges.map((b: string) => 
               newlyAddedBadges.includes(b) ? `🔥 YENİ: ${b}` : b
             );
          }
        }
      });
    }

    // 3. MARKET İSTİHBARATI (YENİ ANAHTAR KELİMELER)
    const oldKeywords = currentRecord.latest_data?.market_intelligence?.top_3_keywords || [];
    const newKeywords = newUpdatedData?.market_intelligence?.top_3_keywords || [];
    
    if (newUpdatedData.market_intelligence && Array.isArray(newKeywords) && newKeywords.length > 0) {
       const trendingKeywords = newKeywords.filter((kw: string) => !oldKeywords.includes(kw));
       // Eğer dün olmayan yepyeni bir kelime varsa, sonuna 🚀 trend emojisi ekle
       newUpdatedData.market_intelligence.top_3_keywords = newKeywords.map((kw: string) => 
         trendingKeywords.includes(kw) ? `${kw} 🚀` : kw
       );
    }
    // --- DELTA MOTORU BİTİŞİ ---

    // 5. ARŞİVLEME İŞLEMİ (Mevcut latest_data'yı historical_data dizisinin başına ekle)
    const currentHistory = Array.isArray(currentRecord.historical_data) ? currentRecord.historical_data : [];
    
    // Eski veriye bir zaman damgası vurarak arşive atıyoruz
    const archivedData = {
      ...currentRecord.latest_data,
      archived_at: new Date().toISOString()
    };
    
    const newHistory = [archivedData, ...currentHistory];

    // 6. VERİTABANINI GÜNCELLE
    const { data: updatedRecord, error: updateError } = await supabase
      .from('user_products')
      .update({
        latest_data: newUpdatedData,
        historical_data: newHistory,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // 7. KREDİ DÜŞÜŞÜ (Her şey kusursuz bittiğinde tahsilat yap)
    await supabase
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', user.id);

    return NextResponse.json({ success: true, data: updatedRecord }, { status: 200 });

  } catch (error) {
    console.error("Arena Update API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}