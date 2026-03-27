// Dosya Yolu: src/app/api/arena/initialize/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server'; 
import { runArenaEngine } from '@/src/lib/services/arenaEngine'; // YENİ: Gerçek motoru import ettik

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productLink, platform, category, competitorBrands, competitorProducts } = body;

    if (!productLink || !platform || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // YENİ: Sahte bekleme silindi. Gerçek AI ve Scraper motorunu çalıştırıyoruz!
    const baselineData = await runArenaEngine(
      productLink, 
      platform, 
      category, 
      competitorBrands, 
      competitorProducts
    );

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

    return NextResponse.json({ success: true, data: insertedData }, { status: 200 });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}