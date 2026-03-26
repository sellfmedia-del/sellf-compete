// Dosya Yolu: src/app/api/arena/initialize/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server'; // Gerçek Auth istemcimiz

export async function POST(req: Request) {
  try {
    // 1. İstek gövdesini (Form verilerini) al
    const body = await req.json();
    const { productLink, platform, category, competitorBrands, competitorProducts } = body;

    // 2. Basit Validasyon
    if (!productLink || !platform || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. KULLANICI DOĞRULAMA (Gerçek ve Güvenli)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Kullanıcı giriş yapmamışsa veya token geçersizse işlemi reddet
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // --- BURASI İLERİDE APIFY VE GEMINI'NİN ÇALIŞACAĞI YERDİR ---
    // Gerçek entegrasyona geçene kadar UI'daki o Loading animasyonunu (Day 0) test edebilmek için 2 saniyelik bir simülasyon beklemesi koyuyoruz
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Sıfırıncı Gün (Baseline) Veri Paketi
    const baselineData = {
      my_product: {
        name: "Tracking Initialized Product",
        current_price: "N/A",
        original_price: "N/A",
        total_reviews: 0,
        average_rating: 0,
        buybox_winner: true
      },
      competitor_products: competitorProducts.map((link: string, index: number) => ({
        id: `comp-prod-${index}`,
        link: link,
        name: `Competitor Product ${index + 1}`,
        current_price: "N/A",
        total_reviews: 0,
        average_rating: 0
      })),
      competitor_brands: competitorBrands.map((brand: string, index: number) => ({
        id: `comp-brand-${index}`,
        name: brand,
        store_rating: "N/A",
        active_coupons: []
      })),
      market_intelligence: {
        top_keywords: ["keyword1", "keyword2", "keyword3"],
        market_momentum: "Analyzing...",
        top_pain_points: ["Gathering data..."]
      }
    };

    // 4. Supabase'e GERÇEK Kayıt İşlemi
    const { data: insertedData, error: insertError } = await supabase
      .from('user_products')
      .insert([
        {
          user_id: user.id, // Kullanıcının gerçek kimliğini veritabanına mühürlüyoruz
          product_link: productLink,
          platform: platform,
          category: category,
          competitor_brands: competitorBrands,
          competitor_products: competitorProducts,
          latest_data: baselineData,
          historical_data: [] // Sıfırıncı gün olduğu için geçmiş henüz yok
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 5. Başarılı Yanıt (Oluşturulan ürünün ID'si ile birlikte)
    return NextResponse.json({ success: true, data: insertedData }, { status: 200 });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}