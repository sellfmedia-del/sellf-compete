// Dosya Yolu: src/app/api/arena/update/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server'; 
import { runArenaEngine } from '@/src/lib/services/arenaEngine'; // Yolunu projene göre kontrol et

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