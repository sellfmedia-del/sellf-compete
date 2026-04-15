// Dosya Yolu: src/app/api/arena/initialize/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server'; 
import { runArenaEngine } from '@/src/lib/services/arenaEngine'; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productLink, platform, category, competitorBrands, competitorProducts } = body;

    if (!productLink || !platform || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 1. KİMLİK KONTROLÜ
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // 2. KREDİ KONTROLÜ (Pre-flight Check)
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    // Kredi yoksa Apify ve Gemini motorlarını hiç yormadan kapıdan çevir
    if (!profile || profile.credits <= 0) {
      return NextResponse.json({ 
        error: "Insufficient credits. Please upgrade your plan." 
      }, { status: 403 });
    }

    // 3. AI VE SCRAPER MOTORUNU ÇALIŞTIR (Maliyetin oluştuğu an)
    const baselineData = await runArenaEngine(
      productLink, 
      platform, 
      category, 
      competitorBrands, 
      competitorProducts
    );

    // 4. VERİTABANINA KAYIT
    const { data: insertedData, error: insertError } = await supabase
      .from('user_products')
      .insert([
        {
          user_id: user.id,
          product_link: productLink,
          platform: platform,
          category: category,
          competitor_brands: competitorBrands,
          competitor_products: competitorProducts,
          latest_data: baselineData,
          historical_data: [] 
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 5. KREDİ DÜŞÜŞÜ (GÜVENLİ VE ATOMİK TAHSİLAT)
    if (insertedData) {
      const { error: rpcError } = await supabase.rpc('decrement_credits', { 
        target_user_id: user.id 
      });

      if (rpcError) {
        console.error("Initialize Credit Deduction Error:", rpcError);
      }
    }

    return NextResponse.json({ success: true, data: insertedData }, { status: 200 });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}