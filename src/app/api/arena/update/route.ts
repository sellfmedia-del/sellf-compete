// Dosya Yolu: src/app/api/arena/update/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server'; 
import { runArenaEngine } from '@/src/lib/services/arenaEngine'; 

// --- YARDIMCI FONKSİYON: Fiyat Metninden Rakam Çıkarma ---
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
      .eq('user_id', user.id) 
      .single();

    if (fetchError || !currentRecord) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    // 4. MOTORU ÇALIŞTIR 
    const newUpdatedData = await runArenaEngine(
      currentRecord.product_link,
      currentRecord.platform,
      currentRecord.category,
      currentRecord.competitor_brands,
      currentRecord.competitor_products,
      currentRecord.latest_data 
    );

    // --- 4.5 DELTA (FARK) MOTORU: SUNUCU TARAFLI KESİN MATEMATİK ---
    
    // 1. KENDİ ÜRÜNÜMÜZ (MY ASSET) İÇİN MATEMATİK
    const oldMyProduct = currentRecord.latest_data?.my_product;
    const newMyProduct = newUpdatedData?.my_product;

    if (oldMyProduct && newMyProduct) {
      const oldPrice = parsePrice(oldMyProduct.current_price);
      const newPrice = parsePrice(newMyProduct.current_price);
      if (oldPrice !== null && newPrice !== null && oldPrice > 0) {
        const diff = newPrice - oldPrice;
        const percentage = Math.abs((diff / oldPrice) * 100).toFixed(1);
        if (diff > 0) newMyProduct.discount_rate = `+%${percentage} Fiyat Artışı 📈`;
        else if (diff < 0) newMyProduct.discount_rate = `-%${percentage} Fiyat Düşüşü 📉`;
        else newMyProduct.discount_rate = "Fiyat Sabit";
      }

      const oldReviews = oldMyProduct.recent_10_reviews || [];
      const newReviews = newMyProduct.recent_10_reviews || [];
      const actualNewReviews = newReviews.filter((rev: string) => !oldReviews.includes(rev));
      newMyProduct.new_reviews_count = actualNewReviews.length;

      if (newMyProduct.sales_growth_estimate === "Baseline" || !newMyProduct.sales_growth_estimate) {
        newMyProduct.sales_growth_estimate = oldMyProduct.sales_growth_estimate || "Calculating...";
      }
    }

    // 2. RAKİP ÜRÜNLER (COMPETITORS) İÇİN MATEMATİK VE DEDEKTİFLİK
    const oldCompetitors = currentRecord.latest_data?.competitor_products || [];
    const newCompetitors = newUpdatedData?.competitor_products || [];

    if (Array.isArray(newCompetitors)) {
      newCompetitors.forEach((newComp: any) => {
        const oldComp = oldCompetitors.find((c: any) => c.name === newComp.name);
        
        if (oldComp) {
          const oldCPrice = parsePrice(oldComp.current_price);
          const newCPrice = parsePrice(newComp.current_price);
          
          let priceShiftStr = "";
          if (oldCPrice !== null && newCPrice !== null && oldCPrice > 0) {
            const diff = newCPrice - oldCPrice;
            const percentage = Math.abs((diff / oldCPrice) * 100).toFixed(1);
            if (diff > 0) priceShiftStr = `(+%${percentage} Artış)`;
            else if (diff < 0) priceShiftStr = `(-%${percentage} Düşüş)`;
          }
          
          if (priceShiftStr) {
             const currentAvgText = newComp.price_vs_category_avg || "";
             newComp.price_vs_category_avg = `${currentAvgText} ${priceShiftStr}`.trim();
          }

          const oldBadges = oldComp.badges_and_campaigns || [];
          const newBadges = newComp.badges_and_campaigns || [];
          const newlyAddedBadges = newBadges.filter((b: string) => !oldBadges.includes(b));
          
          if (newlyAddedBadges.length > 0) {
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
       newUpdatedData.market_intelligence.top_3_keywords = newKeywords.map((kw: string) => 
         trendingKeywords.includes(kw) ? `${kw} 🚀` : kw
       );
    }
    // --- DELTA MOTORU BİTİŞİ ---

    // 5. ARŞİVLEME İŞLEMİ
    const currentHistory = Array.isArray(currentRecord.historical_data) ? currentRecord.historical_data : [];
    
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

    // 7. KREDİ DÜŞÜŞÜ (GÜVENLİ VE ATOMİK TAHSİLAT)
    const { error: rpcError } = await supabase.rpc('decrement_credits', { 
      target_user_id: user.id 
    });

    if (rpcError) {
      console.error("Arena Update Credit Deduction Error:", rpcError);
    }

    return NextResponse.json({ success: true, data: updatedRecord }, { status: 200 });

  } catch (error) {
    console.error("Arena Update API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}